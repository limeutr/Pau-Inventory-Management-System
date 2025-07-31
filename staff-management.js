// Staff Management JavaScript
let staffData = [];
let filteredStaff = [];
let currentPage = 1;
const itemsPerPage = 10;
let editingStaffId = null;
let deleteStaffId = null;
let currentScheduleStaff = null;

// React-like state management for form data
let currentFormState = {
    id: '',
    name: '',
    department: '',
    position: '',
    shift: '',
    status: '',
    phone: '',
    email: '',
    hire_date: '',
    salary: ''
};

// Initialize the page
document.addEventListener('DOMContentLoaded', async function() {
    // Check authentication and role
    checkAuthAndRole();
    
    // Setup logout functionality
    setupLogout();
    
    // Update welcome message
    updateWelcomeMessage();
    
    // Initialize staff data
    await loadStaffDataFromAPI();
    await updateStatistics();
    displayStaff();
    
    // Set up form submission
    document.getElementById('staffForm').addEventListener('submit', handleFormSubmit);
    
    // Add React-like state management for form fields
    const formInputs = ['staffName', 'department', 'position', 'shift', 'status', 'phone', 'email', 'hireDate', 'salary'];
    formInputs.forEach(inputId => {
        const element = document.getElementById(inputId);
        if (element) {
            element.addEventListener('input', () => {
                // Update state on every input change (React-like)
                if (!editingStaffId) {
                    saveFormState();
                }
            });
        }
    });
    
    // Generate next staff ID
    await generateNextStaffId();
});

// Check authentication and role
function checkAuthAndRole() {
    const isLoggedIn = sessionStorage.getItem('isLoggedIn');
    const userRole = sessionStorage.getItem('userRole');
    
    if (!isLoggedIn || isLoggedIn !== 'true') {
        // Redirect to login page if not logged in
        window.location.href = 'index.html';
        return;
    }
    
    // Update role badge
    const roleBadge = document.getElementById('userRoleBadge');
    if (userRole === 'supervisor') {
        roleBadge.textContent = 'Supervisor';
        roleBadge.classList.remove('staff');
    } else if (userRole === 'staff') {
        roleBadge.textContent = 'Staff';
        roleBadge.classList.add('staff');
    }
}

// Setup logout functionality
function setupLogout() {
    const logoutBtn = document.getElementById('logoutBtn');
    
    logoutBtn.addEventListener('click', function() {
        // Confirm logout
        if (confirm('Are you sure you want to logout?')) {
            // Clear session storage
            sessionStorage.removeItem('isLoggedIn');
            sessionStorage.removeItem('username');
            sessionStorage.removeItem('userRole');
            
            // Redirect to login page
            window.location.href = 'index.html';
        }
    });
}

// Update welcome message
function updateWelcomeMessage() {
    const username = sessionStorage.getItem('username') || 'User';
    const welcomeMessage = document.getElementById('welcomeMessage');
    
    // Capitalize first letter
    const displayName = username.charAt(0).toUpperCase() + username.slice(1);
    welcomeMessage.textContent = `Welcome, ${displayName}!`;
}

// Navigation function
function goBackToDashboard() {
    const userRole = sessionStorage.getItem('userRole');
    if (userRole === 'supervisor' || userRole === 'admin') {
        window.location.href = 'supervisor-dashboard.html';
    } else if (userRole === 'staff') {
        window.location.href = 'staff-dashboard.html';
    } else {
        window.location.href = 'index.html';
    }
}

// Load staff data from API
async function loadStaffDataFromAPI() {
    try {
        const response = await fetch('/api/staff');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        staffData = await response.json();
        filteredStaff = [...staffData];
        console.log('Staff data loaded from API:', staffData.length, 'records');
    } catch (error) {
        console.error('Error loading staff data:', error);
        showNotification('Failed to load staff data. Please refresh the page.', 'error');
        // Fallback to empty array
        staffData = [];
        filteredStaff = [];
    }
}

// Generate next staff ID from API
async function generateNextStaffId() {
    try {
        const response = await fetch('/api/staff/utils/next-id');
        if (response.ok) {
            const data = await response.json();
            const staffIdInput = document.getElementById('staffId');
            if (staffIdInput) {
                staffIdInput.value = data.nextId;
            }
        } else {
            // Fallback to local calculation
            const maxId = staffData.reduce((max, staff) => {
                const num = parseInt(staff.id.replace('STF', ''));
                return num > max ? num : max;
            }, 0);
            
            const nextId = 'STF' + String(maxId + 1).padStart(3, '0');
            const staffIdInput = document.getElementById('staffId');
            if (staffIdInput) {
                staffIdInput.value = nextId;
            }
        }
    } catch (error) {
        console.error('Error generating next staff ID:', error);
        // Fallback to local calculation
        const maxId = staffData.reduce((max, staff) => {
            const num = parseInt(staff.id.replace('STF', ''));
            return num > max ? num : max;
        }, 0);
        
        const nextId = 'STF' + String(maxId + 1).padStart(3, '0');
        const staffIdInput = document.getElementById('staffId');
        if (staffIdInput) {
            staffIdInput.value = nextId;
        }
    }
}

// Update statistics
async function updateStatistics() {
    try {
        const response = await fetch('/api/staff/stats/overview');
        if (response.ok) {
            const stats = await response.json();
            document.getElementById('totalStaff').textContent = stats.total_staff;
            document.getElementById('activeStaff').textContent = stats.active_staff;
            
            // Always calculate scheduled staff from current data since it needs schedule parsing
            const scheduledStaffList = staffData.filter(staff => {
                const isActive = staff.status === 'Active';
                const hasValidSchedule = hasSchedule(staff);
                return isActive && hasValidSchedule;
            });
            
            console.log('Scheduled staff from API stats:', scheduledStaffList.length);
            document.getElementById('scheduledStaff').textContent = scheduledStaffList.length;
            document.getElementById('factoryStaff').textContent = stats.factory_staff;
        } else {
            // Fallback to local calculation
            console.log('API stats failed, using local calculation');
            updateStatisticsLocal();
        }
    } catch (error) {
        console.error('Error fetching statistics:', error);
        // Fallback to local calculation
        console.log('API stats error, using local calculation');
        updateStatisticsLocal();
    }
}

// Local statistics calculation (fallback)
function updateStatisticsLocal() {
    console.log('=== Calculating Statistics Locally ===');
    
    const totalStaff = staffData.length;
    const activeStaff = staffData.filter(staff => staff.status === 'Active').length;
    
    // Calculate scheduled staff with detailed logging
    const scheduledStaffList = staffData.filter(staff => {
        const isActive = staff.status === 'Active';
        const hasValidSchedule = hasSchedule(staff);
        const isScheduled = isActive && hasValidSchedule;
        
        if (isScheduled) {
            console.log(`Scheduled staff found: ${staff.name}`);
        }
        
        return isScheduled;
    });
    
    const scheduledStaffCount = scheduledStaffList.length;
    console.log(`Total scheduled staff: ${scheduledStaffCount}`);
    
    const factoryStaff = staffData.filter(staff => 
        staff.department === 'PAU Production' || 
        staff.department === 'Filling Preparation' || 
        staff.department === 'Quality Control' || 
        staff.department === 'Packaging & Distribution' || 
        staff.department === 'Inventory Management'
    ).length;
    
    console.log('Statistics:', {
        totalStaff,
        activeStaff,
        scheduledStaff: scheduledStaffCount,
        factoryStaff
    });
    
    document.getElementById('totalStaff').textContent = totalStaff;
    document.getElementById('activeStaff').textContent = activeStaff;
    document.getElementById('scheduledStaff').textContent = scheduledStaffCount;
    document.getElementById('factoryStaff').textContent = factoryStaff;
}

// Check if staff has schedule
function hasSchedule(staff) {
    if (!staff.schedule) {
        console.log(`hasSchedule: No schedule found for ${staff.name}`);
        return false;
    }
    
    // Handle both object and string schedule formats
    let schedule = staff.schedule;
    if (typeof schedule === 'string') {
        try {
            schedule = JSON.parse(schedule);
        } catch (e) {
            console.log(`hasSchedule: Failed to parse schedule string for ${staff.name}`);
            return false;
        }
    }
    
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    const hasValidSchedule = days.some(day => {
        const daySchedule = schedule[day];
        const hasStartAndEnd = daySchedule && daySchedule.start && daySchedule.end;
        if (hasStartAndEnd) {
            console.log(`hasSchedule: ${staff.name} has schedule on ${day}:`, daySchedule);
        }
        return hasStartAndEnd;
    });
    
    console.log(`hasSchedule: ${staff.name} has valid schedule:`, hasValidSchedule);
    return hasValidSchedule;
}

// Display staff in table
function displayStaff() {
    const tableBody = document.getElementById('staffTableBody');
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const pageData = filteredStaff.slice(startIndex, endIndex);
    
    tableBody.innerHTML = '';
    
    if (pageData.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="8" class="text-center">No staff found</td></tr>';
        return;
    }
    
    pageData.forEach(staff => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${staff.id}</td>
            <td>${staff.name}</td>
            <td>${staff.department}</td>
            <td>${staff.position}</td>
            <td>${staff.shift}</td>
            <td><span class="status-badge ${getStatusClass(staff.status)}">${staff.status}</span></td>
            <td>${staff.phone || 'N/A'}</td>
            <td>
                <button class="action-btn edit-btn" onclick="editStaff('${staff.id}')">Edit</button>
                <button class="action-btn schedule-btn" onclick="showSchedule('${staff.id}')">Schedule</button>
                <button class="action-btn delete-btn" onclick="deleteStaff('${staff.id}')">Delete</button>
            </td>
        `;
        tableBody.appendChild(row);
    });
    
    updatePagination();
}

// Get status class for styling
function getStatusClass(status) {
    switch(status) {
        case 'Active': return 'status-active';
        case 'On Leave': return 'status-leave';
        case 'Inactive': return 'status-inactive';
        default: return 'status-inactive';
    }
}

// Update pagination
function updatePagination() {
    const totalPages = Math.ceil(filteredStaff.length / itemsPerPage);
    document.getElementById('currentPage').textContent = currentPage;
    document.getElementById('totalPages').textContent = totalPages;
    
    document.getElementById('prevBtn').disabled = currentPage === 1;
    document.getElementById('nextBtn').disabled = currentPage === totalPages || totalPages === 0;
}

// Filter staff based on search and filters
function filterStaff() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const departmentFilter = document.getElementById('departmentFilter').value;
    const statusFilter = document.getElementById('statusFilter').value;
    
    filteredStaff = staffData.filter(staff => {
        const matchesSearch = staff.name.toLowerCase().includes(searchTerm) ||
                            staff.id.toLowerCase().includes(searchTerm) ||
                            staff.position.toLowerCase().includes(searchTerm);
        
        const matchesDepartment = !departmentFilter || staff.department === departmentFilter;
        const matchesStatus = !statusFilter || staff.status === statusFilter;
        
        return matchesSearch && matchesDepartment && matchesStatus;
    });
    
    currentPage = 1;
    displayStaff();
}

// Pagination functions
function previousPage() {
    if (currentPage > 1) {
        currentPage--;
        displayStaff();
    }
}

function nextPage() {
    const totalPages = Math.ceil(filteredStaff.length / itemsPerPage);
    if (currentPage < totalPages) {
        currentPage++;
        displayStaff();
    }
}

// Utility function to save current form state (React-like useState)
function saveFormState() {
    currentFormState = {
        id: document.getElementById('staffId').value || '',
        name: document.getElementById('staffName').value || '',
        department: document.getElementById('department').value || '',
        position: document.getElementById('position').value || '',
        shift: document.getElementById('shift').value || '',
        status: document.getElementById('status').value || '',
        phone: document.getElementById('phone').value || '',
        email: document.getElementById('email').value || '',
        hire_date: document.getElementById('hireDate').value || '',
        salary: document.getElementById('salary').value || ''
    };
}

// Utility function to restore form state (React-like useState)
function restoreFormState() {
    const formFields = [
        { id: 'staffId', value: currentFormState.id },
        { id: 'staffName', value: currentFormState.name },
        { id: 'department', value: currentFormState.department },
        { id: 'position', value: currentFormState.position },
        { id: 'shift', value: currentFormState.shift },
        { id: 'status', value: currentFormState.status },
        { id: 'phone', value: currentFormState.phone },
        { id: 'email', value: currentFormState.email },
        { id: 'hireDate', value: currentFormState.hire_date },
        { id: 'salary', value: currentFormState.salary }
    ];
    
    formFields.forEach(field => {
        const element = document.getElementById(field.id);
        if (element) {
            element.value = field.value;
        }
    });
}

// Utility function to format time for HTML input (ensures HH:MM format)
function formatTimeForInput(timeValue) {
    if (!timeValue) {
        console.log('formatTimeForInput: Empty or null time value');
        return '';
    }
    
    console.log('formatTimeForInput: Processing time value:', timeValue, 'Type:', typeof timeValue);
    
    try {
        // If it's already in HH:MM format, return as is
        if (typeof timeValue === 'string' && /^\d{2}:\d{2}$/.test(timeValue)) {
            console.log('formatTimeForInput: Already in HH:MM format:', timeValue);
            return timeValue;
        }
        
        // If it's a time string like "09:00:00", extract HH:MM
        if (typeof timeValue === 'string' && /^\d{2}:\d{2}:\d{2}$/.test(timeValue)) {
            const result = timeValue.substring(0, 5);
            console.log('formatTimeForInput: Extracted HH:MM from HH:MM:SS:', result);
            return result;
        }
        
        // If it's a time string like "9:00" (single digit hour), pad it
        if (typeof timeValue === 'string' && /^\d{1}:\d{2}$/.test(timeValue)) {
            const result = '0' + timeValue;
            console.log('formatTimeForInput: Padded single digit hour:', result);
            return result;
        }
        
        // If it's a time string like "9:00:00" (single digit hour with seconds), process it
        if (typeof timeValue === 'string' && /^\d{1}:\d{2}:\d{2}$/.test(timeValue)) {
            const result = '0' + timeValue.substring(0, 4);
            console.log('formatTimeForInput: Processed single digit hour with seconds:', result);
            return result;
        }
        
        // Try to parse as Date and format
        const date = new Date(`1970-01-01T${timeValue}`);
        if (!isNaN(date.getTime())) {
            const result = date.toTimeString().substring(0, 5);
            console.log('formatTimeForInput: Parsed as date and formatted:', result);
            return result;
        }
        
        console.warn('formatTimeForInput: Could not format time value:', timeValue);
        return '';
    } catch (error) {
        console.error('formatTimeForInput: Error formatting time:', error, 'Value:', timeValue);
        return '';
    }
}

// Utility function to format date for HTML input (similar to React state management)
function formatDateForInput(dateValue) {
    if (!dateValue) return '';
    
    try {
        let date;
        if (dateValue instanceof Date) {
            date = dateValue;
        } else {
            date = new Date(dateValue);
        }
        
        // Check if the date is valid
        if (isNaN(date.getTime())) {
            return '';
        }
        
        // Format as YYYY-MM-DD for HTML date input
        return date.toISOString().split('T')[0];
    } catch (error) {
        console.error('Error formatting date:', error);
        return '';
    }
}

// Utility function to populate form with staff data (React-like state setter)
function populateStaffForm(staff) {
    const formFields = [
        { id: 'staffName', value: staff.name || '' },
        { id: 'staffId', value: staff.id || '' },
        { id: 'department', value: staff.department || '' },
        { id: 'position', value: staff.position || '' },
        { id: 'shift', value: staff.shift || '' },
        { id: 'status', value: staff.status || '' },
        { id: 'phone', value: staff.phone || '' },
        { id: 'email', value: staff.email || '' },
        { id: 'hireDate', value: formatDateForInput(staff.hire_date) },
        { id: 'salary', value: staff.salary || '' }
    ];
    
    formFields.forEach(field => {
        const element = document.getElementById(field.id);
        if (element) {
            element.value = field.value;
        }
    });
    
    // Update internal state to match form values (React-like state management)
    currentFormState = {
        id: staff.id || '',
        name: staff.name || '',
        department: staff.department || '',
        position: staff.position || '',
        shift: staff.shift || '',
        status: staff.status || '',
        phone: staff.phone || '',
        email: staff.email || '',
        hire_date: formatDateForInput(staff.hire_date),
        salary: staff.salary || ''
    };
}

// Show add staff form
function showAddStaffForm() {
    editingStaffId = null;
    document.getElementById('modalTitle').textContent = 'Add New Staff';
    
    // Check if we have a previous state to restore (React-like useState behavior)
    if (currentFormState.name || currentFormState.department || currentFormState.position) {
        // Restore previous form state
        restoreFormState();
    } else {
        // Reset form for new entry
        document.getElementById('staffForm').reset();
        // Generate next staff ID when showing the form
        generateNextStaffId();
    }
    
    document.getElementById('staffModal').style.display = 'block';
}

// Edit staff
function editStaff(staffId) {
    const staff = staffData.find(s => s.id === staffId);
    if (!staff) return;
    
    editingStaffId = staffId;
    document.getElementById('modalTitle').textContent = 'Edit Staff';
    
    // Use the utility function to populate form fields (React-like state management)
    populateStaffForm(staff);
    
    document.getElementById('staffModal').style.display = 'block';
}

// Handle form submission
async function handleFormSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    
    // Prepare staff info with proper date handling
    const staffInfo = {
        id: formData.get('staffId'),
        name: formData.get('staffName'),
        department: formData.get('department'),
        position: formData.get('position'),
        shift: formData.get('shift'),
        status: formData.get('status'),
        phone: formData.get('phone'),
        email: formData.get('email'),
        hire_date: formData.get('hireDate') || null, // Ensure null instead of empty string for database
        salary: parseFloat(formData.get('salary')) || 0
    };
    
    // Validate required fields
    if (!staffInfo.name || !staffInfo.department || !staffInfo.position || !staffInfo.shift || !staffInfo.status) {
        showNotification('Please fill in all required fields.', 'error');
        return;
    }
    
    try {
        let response;
        
        if (editingStaffId) {
            // Update existing staff
            response = await fetch(`/api/staff/${editingStaffId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(staffInfo)
            });
        } else {
            // Add new staff
            response = await fetch('/api/staff', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(staffInfo)
            });
        }
        
        if (response.ok) {
            const result = await response.json();
            showNotification(editingStaffId ? 'Staff updated successfully!' : 'Staff added successfully!', 'success');
            
            // Reload data and update UI
            await loadStaffDataFromAPI();
            await updateStatistics();
            displayStaff();
            closeModal();
        } else {
            const error = await response.json();
            throw new Error(error.error || 'Failed to save staff data');
        }
    } catch (error) {
        console.error('Error saving staff:', error);
        showNotification('Error: ' + error.message, 'error');
    }
}

// Show schedule modal
async function showSchedule(staffId) {
    try {
        // First try to get the latest staff data from API to ensure we have current schedule
        const response = await fetch(`/api/staff/${staffId}`);
        let staff;
        
        if (response.ok) {
            staff = await response.json();
            console.log('Retrieved staff with schedule from API:', staff);
        } else {
            // Fallback to local data if API fails
            staff = staffData.find(s => s.id === staffId);
            console.log('Using local staff data as fallback:', staff);
        }
        
        if (!staff) {
            showNotification('Staff member not found', 'error');
            return;
        }
        
        currentScheduleStaff = staff;
        
        // Update modal header with staff info
        document.getElementById('scheduleStaffName').textContent = staff.name;
        document.getElementById('scheduleStaffDetails').textContent = `${staff.department} • ${staff.position}`;
        
        // Load existing schedule from database
        const schedule = staff.schedule || {};
        const days = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
        const dayNames = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
        
        console.log('Loading schedule data:', schedule);
        console.log('Schedule keys:', Object.keys(schedule));
        console.log('Full staff object:', staff);
        
        // Check if schedule is a string that needs parsing
        let parsedSchedule = schedule;
        if (typeof schedule === 'string') {
            try {
                parsedSchedule = JSON.parse(schedule);
                console.log('Parsed schedule from string:', parsedSchedule);
            } catch (e) {
                console.error('Failed to parse schedule string:', e);
                parsedSchedule = {};
            }
        }
        
        // Show the modal first
        document.getElementById('scheduleModal').style.display = 'block';
        
        // Wait for modal to be fully rendered, then populate schedule
        setTimeout(() => {
            console.log('=== Populating Schedule After Modal Display ===');
            
            // Populate schedule inputs with database values
            days.forEach((day, index) => {
                const dayName = dayNames[index];
                const daySchedule = parsedSchedule[dayName] || {};
                const startInput = document.getElementById(`${day}-start`);
                const endInput = document.getElementById(`${day}-end`);
                
                console.log(`Processing ${dayName} (${day}):`, daySchedule);
                
                if (startInput && endInput) {
                    // Format time values properly (ensure HH:MM format)
                    const formattedStart = formatTimeForInput(daySchedule.start);
                    const formattedEnd = formatTimeForInput(daySchedule.end);
                    
                    console.log(`Setting ${dayName} - Start: "${formattedStart}", End: "${formattedEnd}"`);
                    
                    // Set values directly
                    startInput.value = formattedStart;
                    endInput.value = formattedEnd;
                    
                    // Force trigger change event to ensure UI updates
                    startInput.dispatchEvent(new Event('change', { bubbles: true }));
                    endInput.dispatchEvent(new Event('change', { bubbles: true }));
                    
                    // Verify the values were set
                    console.log(`Verification - ${dayName} inputs after setting:`, {
                        start: startInput.value,
                        end: endInput.value,
                        startElement: startInput,
                        endElement: endInput
                    });
                } else {
                    console.error(`Missing input elements for ${dayName}:`, {
                        startInput: !!startInput,
                        endInput: !!endInput,
                        expectedStartId: `${day}-start`,
                        expectedEndId: `${day}-end`
                    });
                }
            });
            
            // Final verification after all inputs are set
            setTimeout(() => {
                console.log('=== Final Schedule Verification ===');
                days.forEach(day => {
                    const startInput = document.getElementById(`${day}-start`);
                    const endInput = document.getElementById(`${day}-end`);
                    if (startInput && endInput) {
                        console.log(`${day}: start="${startInput.value}", end="${endInput.value}"`);
                    }
                });
            }, 100);
            
        }, 50);
        
    } catch (error) {
        console.error('Error loading staff schedule:', error);
        showNotification('Failed to load staff schedule. Please try again.', 'error');
    }
}

// Save schedule
async function saveSchedule() {
    if (!currentScheduleStaff) {
        showNotification('No staff member selected for schedule update', 'error');
        return;
    }
    
    const days = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
    const dayNames = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    const schedule = {};
    let hasValidSchedule = false;
    
    // Build schedule object and validate times
    days.forEach((day, index) => {
        const startInput = document.getElementById(`${day}-start`);
        const endInput = document.getElementById(`${day}-end`);
        
        if (startInput && endInput) {
            const start = startInput.value.trim();
            const end = endInput.value.trim();
            
            // Validate that if start time is provided, end time is also provided
            if (start && !end) {
                showNotification(`Please provide end time for ${dayNames[index]}`, 'warning');
                return;
            }
            if (!start && end) {
                showNotification(`Please provide start time for ${dayNames[index]}`, 'warning');
                return;
            }
            
            // Validate that start time is before end time
            if (start && end) {
                const startTime = new Date(`1970-01-01T${start}:00`);
                const endTime = new Date(`1970-01-01T${end}:00`);
                
                if (startTime >= endTime) {
                    showNotification(`Start time must be before end time for ${dayNames[index]}`, 'error');
                    return;
                }
                hasValidSchedule = true;
            }
            
            schedule[dayNames[index]] = {
                start: start || '',
                end: end || ''
            };
        }
    });
    
    console.log('Saving schedule for staff:', currentScheduleStaff.id, schedule);
    
    try {
        const response = await fetch(`/api/staff/${currentScheduleStaff.id}/schedule`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ schedule })
        });
        
        if (response.ok) {
            const result = await response.json();
            showNotification(
                hasValidSchedule 
                    ? 'Schedule saved successfully!' 
                    : 'Schedule cleared successfully!', 
                'success'
            );
            closeScheduleModal();
            
            // Reload data and update UI to reflect changes
            await loadStaffDataFromAPI();
            await updateStatistics();
            displayStaff();
        } else {
            const error = await response.json();
            throw new Error(error.error || 'Failed to save schedule');
        }
    } catch (error) {
        console.error('Error saving schedule:', error);
        showNotification('Error: ' + error.message, 'error');
    }
}

// Delete staff
function deleteStaff(staffId) {
    const staff = staffData.find(s => s.id === staffId);
    if (!staff) return;
    
    deleteStaffId = staffId;
    document.getElementById('deleteStaffName').textContent = staff.name;
    document.getElementById('deleteModal').style.display = 'block';
}

// Confirm delete
async function confirmDelete() {
    if (!deleteStaffId) return;
    
    try {
        const response = await fetch(`/api/staff/${deleteStaffId}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            showNotification('Staff deleted successfully!', 'success');
            closeDeleteModal();
            
            // Reload data and update UI
            await loadStaffDataFromAPI();
            await updateStatistics();
            displayStaff();
        } else {
            const error = await response.json();
            throw new Error(error.error || 'Failed to delete staff');
        }
    } catch (error) {
        console.error('Error deleting staff:', error);
        showNotification('Error: ' + error.message, 'error');
    }
}

// Export staff data
function exportStaffData() {
    const csvContent = convertToCSV(filteredStaff);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `staff_data_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        showNotification('Staff data exported successfully!', 'success');
    }
}

// Convert data to CSV
function convertToCSV(data) {
    const headers = ['Staff ID', 'Name', 'Department', 'Position', 'Shift', 'Status', 'Phone', 'Email', 'Hire Date', 'Salary'];
    const csvRows = [];
    
    csvRows.push(headers.join(','));
    
    data.forEach(staff => {
        const row = [
            staff.id,
            `"${staff.name}"`,
            staff.department,
            `"${staff.position}"`,
            `"${staff.shift}"`,
            staff.status,
            staff.phone || '',
            staff.email || '',
            staff.hire_date || '',
            staff.salary || ''
        ];
        csvRows.push(row.join(','));
    });
    
    return csvRows.join('\n');
}

// Notification system
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    // Style the notification
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 25px;
        border-radius: 8px;
        color: white;
        font-weight: 500;
        z-index: 10000;
        animation: slideInRight 0.3s ease;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
    `;
    
    // Set background color based on type
    switch(type) {
        case 'success':
            notification.style.background = '#28a745';
            break;
        case 'error':
            notification.style.background = '#dc3545';
            break;
        case 'warning':
            notification.style.background = '#ffc107';
            break;
        default:
            notification.style.background = '#17a2b8';
    }
    
    // Add to document
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Modal functions
function closeModal() {
    // Save current form state before closing (React-like behavior)
    if (!editingStaffId) {
        saveFormState();
    }
    
    document.getElementById('staffModal').style.display = 'none';
    editingStaffId = null;
}

function closeScheduleModal() {
    document.getElementById('scheduleModal').style.display = 'none';
    currentScheduleStaff = null;
    
    // Clear schedule form inputs
    const days = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
    days.forEach(day => {
        const startInput = document.getElementById(`${day}-start`);
        const endInput = document.getElementById(`${day}-end`);
        if (startInput) startInput.value = '';
        if (endInput) endInput.value = '';
    });
}

function closeDeleteModal() {
    document.getElementById('deleteModal').style.display = 'none';
    deleteStaffId = null;
}

// Navigation functions (already updated above)

// Close modals when clicking outside
window.onclick = function(event) {
    const modals = ['staffModal', 'scheduleModal', 'deleteModal'];
    modals.forEach(modalId => {
        const modal = document.getElementById(modalId);
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });
}

// Keyboard shortcuts
document.addEventListener('keydown', function(e) {
    // ESC key to close modals
    if (e.key === 'Escape') {
        closeModal();
        closeScheduleModal();
        closeDeleteModal();
    }
    
    // Ctrl+N to add new staff
    if (e.ctrlKey && e.key === 'n') {
        e.preventDefault();
        showAddStaffForm();
    }
    
    // Ctrl+E to export data
    if (e.ctrlKey && e.key === 'e') {
        e.preventDefault();
        exportStaffData();
    }
});
