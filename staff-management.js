// Staff Management JavaScript
let staffData = [];
let filteredStaff = [];
let currentPage = 1;
const itemsPerPage = 10;
let editingStaffId = null;
let deleteStaffId = null;
let currentScheduleStaff = null;

// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
    // Check authentication and role
    checkAuthAndRole();
    
    // Setup logout functionality
    setupLogout();
    
    // Update welcome message
    updateWelcomeMessage();
    
    // Initialize staff data
    initializeStaffData();
    loadStaffData();
    updateStatistics();
    displayStaff();
    
    // Set up form submission
    document.getElementById('staffForm').addEventListener('submit', handleFormSubmit);
    
    // Generate next staff ID
    generateNextStaffId();
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

// Initialize sample staff data
function initializeStaffData() {
    const sampleStaff = [
        {
            id: 'STF001',
            name: 'Chen Wei Ming',
            department: 'PAU Production',
            position: 'Head PAU Chef',
            shift: 'Early Morning (4:00 AM - 12:00 PM)',
            status: 'Active',
            phone: '+65-9123-4567',
            email: 'chen.weiming@pau.com',
            hireDate: '2022-01-15',
            salary: 75000,
            schedule: {
                monday: { start: '04:00', end: '12:00' },
                tuesday: { start: '04:00', end: '12:00' },
                wednesday: { start: '04:00', end: '12:00' },
                thursday: { start: '04:00', end: '12:00' },
                friday: { start: '04:00', end: '12:00' },
                saturday: { start: '04:00', end: '12:00' },
                sunday: { start: '', end: '' }
            }
        },
        {
            id: 'STF002',
            name: 'Lim Hui Ling',
            department: 'Filling Preparation',
            position: 'Senior Filling Specialist',
            shift: 'Early Morning (4:00 AM - 12:00 PM)',
            status: 'Active',
            phone: '+65-9234-5678',
            email: 'lim.huiling@pau.com',
            hireDate: '2022-03-20',
            salary: 58000,
            specialties: 'Char Siew, Red Bean Paste, Lotus Seed Paste',
            schedule: {
                monday: { start: '04:00', end: '12:00' },
                tuesday: { start: '04:00', end: '12:00' },
                wednesday: { start: '04:00', end: '12:00' },
                thursday: { start: '04:00', end: '12:00' },
                friday: { start: '04:00', end: '12:00' },
                saturday: { start: '04:00', end: '12:00' },
                sunday: { start: '', end: '' }
            }
        },
        {
            id: 'STF003',
            name: 'Tan Ah Huat',
            department: 'PAU Production',
            position: 'Steam Master',
            shift: 'Day Shift (8:00 AM - 4:00 PM)',
            status: 'Active',
            phone: '+65-9345-6789',
            email: 'tan.ahhuat@pau.com',
            hireDate: '2021-11-10',
            salary: 65000,
            experience: '15 years PAU steaming experience',
            schedule: {
                monday: { start: '08:00', end: '16:00' },
                tuesday: { start: '08:00', end: '16:00' },
                wednesday: { start: '08:00', end: '16:00' },
                thursday: { start: '08:00', end: '16:00' },
                friday: { start: '08:00', end: '16:00' },
                saturday: { start: '08:00', end: '14:00' },
                sunday: { start: '', end: '' }
            }
        },
        {
            id: 'STF004',
            name: 'Maria Santos',
            department: 'Quality Control',
            position: 'PAU Quality Inspector',
            shift: 'Day Shift (8:00 AM - 4:00 PM)',
            status: 'Active',
            phone: '+65-9456-7890',
            email: 'maria.santos@pau.com',
            hireDate: '2023-02-14',
            salary: 52000,
            certifications: 'Food Safety, HACCP',
            schedule: {
                monday: { start: '08:00', end: '16:00' },
                tuesday: { start: '08:00', end: '16:00' },
                wednesday: { start: '08:00', end: '16:00' },
                thursday: { start: '08:00', end: '16:00' },
                friday: { start: '08:00', end: '16:00' },
                saturday: { start: '', end: '' },
                sunday: { start: '', end: '' }
            }
        },
        {
            id: 'STF005',
            name: 'Wong Kah Wai',
            department: 'Packaging & Distribution',
            position: 'Packaging Supervisor',
            shift: 'Afternoon (12:00 PM - 8:00 PM)',
            status: 'Active',
            phone: '+65-9567-8901',
            email: 'wong.kahwai@pau.com',
            hireDate: '2022-08-05',
            salary: 55000,
            responsibilities: 'PAU packaging, outlet deliveries',
            schedule: {
                monday: { start: '12:00', end: '20:00' },
                tuesday: { start: '12:00', end: '20:00' },
                wednesday: { start: '12:00', end: '20:00' },
                thursday: { start: '12:00', end: '20:00' },
                friday: { start: '12:00', end: '20:00' },
                saturday: { start: '10:00', end: '18:00' },
                sunday: { start: '', end: '' }
            }
        },
        {
            id: 'STF006',
            name: 'Sarah Lee',
            department: 'Outlet Management',
            position: 'Central Outlet Manager',
            shift: 'Day Shift (8:00 AM - 4:00 PM)',
            status: 'Active',
            phone: '+65-9678-9012',
            email: 'sarah.lee@pau.com',
            hireDate: '2023-01-18',
            salary: 62000,
            outlet: 'PAU Central Outlet',
            schedule: {
                monday: { start: '08:00', end: '16:00' },
                tuesday: { start: '08:00', end: '16:00' },
                wednesday: { start: '08:00', end: '16:00' },
                thursday: { start: '08:00', end: '16:00' },
                friday: { start: '08:00', end: '16:00' },
                saturday: { start: '08:00', end: '16:00' },
                sunday: { start: '10:00', end: '16:00' }
            }
        },
        {
            id: 'STF007',
            name: 'Kumar Raj',
            department: 'Inventory Management',
            position: 'Inventory Coordinator',
            shift: 'Day Shift (8:00 AM - 4:00 PM)',
            status: 'Active',
            phone: '+65-9789-0123',
            email: 'kumar.raj@pau.com',
            hireDate: '2022-12-03',
            salary: 48000,
            focus: 'Ingredient tracking, supply coordination',
            schedule: {
                monday: { start: '08:00', end: '16:00' },
                tuesday: { start: '08:00', end: '16:00' },
                wednesday: { start: '08:00', end: '16:00' },
                thursday: { start: '08:00', end: '16:00' },
                friday: { start: '08:00', end: '16:00' },
                saturday: { start: '', end: '' },
                sunday: { start: '', end: '' }
            }
        },
        {
            id: 'STF008',
            name: 'Alice Tay',
            department: 'Administration',
            position: 'HR & Operations Manager',
            shift: 'Day Shift (8:00 AM - 4:00 PM)',
            status: 'Active',
            phone: '+65-9890-1234',
            email: 'alice.tay@pau.com',
            hireDate: '2021-09-15',
            salary: 68000,
            responsibilities: 'Staff management, operations oversight',
            schedule: {
                monday: { start: '08:00', end: '16:00' },
                tuesday: { start: '08:00', end: '16:00' },
                wednesday: { start: '08:00', end: '16:00' },
                thursday: { start: '08:00', end: '16:00' },
                friday: { start: '08:00', end: '16:00' },
                saturday: { start: '', end: '' },
                sunday: { start: '', end: '' }
            }
        },
        {
            id: 'STF009',
            name: 'Zhang Ming',
            department: 'PAU Production',
            position: 'Junior PAU Baker',
            shift: 'Early Morning (4:00 AM - 12:00 PM)',
            status: 'On Leave',
            phone: '+65-9901-2345',
            email: 'zhang.ming@pau.com',
            hireDate: '2023-06-01',
            salary: 38000,
            training: 'Classic PAU, Char Siew PAU specialist',
            schedule: {
                monday: { start: '04:00', end: '12:00' },
                tuesday: { start: '04:00', end: '12:00' },
                wednesday: { start: '04:00', end: '12:00' },
                thursday: { start: '04:00', end: '12:00' },
                friday: { start: '04:00', end: '12:00' },
                saturday: { start: '', end: '' },
                sunday: { start: '', end: '' }
            }
        }
    ];
    
    // Load existing data or initialize with sample data
    const existingData = localStorage.getItem('staffData');
    if (!existingData) {
        staffData = sampleStaff;
        saveStaffData();
    }
}

// Load staff data from localStorage
function loadStaffData() {
    const savedData = localStorage.getItem('staffData');
    if (savedData) {
        staffData = JSON.parse(savedData);
    }
    filteredStaff = [...staffData];
}

// Save staff data to localStorage
function saveStaffData() {
    localStorage.setItem('staffData', JSON.stringify(staffData));
}

// Generate next staff ID
function generateNextStaffId() {
    const maxId = staffData.reduce((max, staff) => {
        const num = parseInt(staff.id.replace('STF', ''));
        return num > max ? num : max;
    }, 0);
    
    const nextId = 'STF' + String(maxId + 1).padStart(3, '0');
    document.getElementById('staffId').value = nextId;
}

// Update statistics
function updateStatistics() {
    const totalStaff = staffData.length;
    const activeStaff = staffData.filter(staff => staff.status === 'Active').length;
    const scheduledStaff = staffData.filter(staff => staff.status === 'Active' && hasSchedule(staff)).length;
    const factoryStaff = staffData.filter(staff => 
        staff.department === 'PAU Production' || 
        staff.department === 'Filling Preparation' || 
        staff.department === 'Quality Control' || 
        staff.department === 'Packaging & Distribution' || 
        staff.department === 'Inventory Management'
    ).length;
    
    document.getElementById('totalStaff').textContent = totalStaff;
    document.getElementById('activeStaff').textContent = activeStaff;
    document.getElementById('scheduledStaff').textContent = scheduledStaff;
    document.getElementById('factoryStaff').textContent = factoryStaff;
}

// Check if staff has schedule
function hasSchedule(staff) {
    if (!staff.schedule) return false;
    
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    return days.some(day => staff.schedule[day] && staff.schedule[day].start && staff.schedule[day].end);
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

// Show add staff form
function showAddStaffForm() {
    editingStaffId = null;
    document.getElementById('modalTitle').textContent = 'Add New Staff';
    document.getElementById('staffForm').reset();
    generateNextStaffId();
    document.getElementById('staffModal').style.display = 'block';
}

// Edit staff
function editStaff(staffId) {
    const staff = staffData.find(s => s.id === staffId);
    if (!staff) return;
    
    editingStaffId = staffId;
    document.getElementById('modalTitle').textContent = 'Edit Staff';
    
    // Populate form fields
    document.getElementById('staffName').value = staff.name;
    document.getElementById('staffId').value = staff.id;
    document.getElementById('department').value = staff.department;
    document.getElementById('position').value = staff.position;
    document.getElementById('shift').value = staff.shift;
    document.getElementById('status').value = staff.status;
    document.getElementById('phone').value = staff.phone || '';
    document.getElementById('email').value = staff.email || '';
    document.getElementById('hireDate').value = staff.hireDate || '';
    document.getElementById('salary').value = staff.salary || '';
    
    document.getElementById('staffModal').style.display = 'block';
}

// Handle form submission
function handleFormSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const staffInfo = {
        id: formData.get('staffId'),
        name: formData.get('staffName'),
        department: formData.get('department'),
        position: formData.get('position'),
        shift: formData.get('shift'),
        status: formData.get('status'),
        phone: formData.get('phone'),
        email: formData.get('email'),
        hireDate: formData.get('hireDate'),
        salary: parseFloat(formData.get('salary')) || 0
    };
    
    // Validate required fields
    if (!staffInfo.name || !staffInfo.department || !staffInfo.position || !staffInfo.shift || !staffInfo.status) {
        alert('Please fill in all required fields.');
        return;
    }
    
    if (editingStaffId) {
        // Update existing staff
        const index = staffData.findIndex(s => s.id === editingStaffId);
        if (index !== -1) {
            // Preserve existing schedule
            const existingSchedule = staffData[index].schedule;
            staffInfo.schedule = existingSchedule || {};
            
            staffData[index] = staffInfo;
            showNotification('Staff updated successfully!', 'success');
        }
    } else {
        // Add new staff
        staffInfo.schedule = {};
        staffData.push(staffInfo);
        showNotification('Staff added successfully!', 'success');
    }
    
    saveStaffData();
    loadStaffData();
    updateStatistics();
    displayStaff();
    closeModal();
}

// Show schedule modal
function showSchedule(staffId) {
    const staff = staffData.find(s => s.id === staffId);
    if (!staff) return;
    
    currentScheduleStaff = staff;
    
    document.getElementById('scheduleStaffName').textContent = staff.name;
    document.getElementById('scheduleStaffDetails').textContent = `${staff.department} • ${staff.position}`;
    
    // Load existing schedule
    const schedule = staff.schedule || {};
    const days = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
    const dayNames = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    
    days.forEach((day, index) => {
        const daySchedule = schedule[dayNames[index]] || {};
        document.getElementById(`${day}-start`).value = daySchedule.start || '';
        document.getElementById(`${day}-end`).value = daySchedule.end || '';
    });
    
    document.getElementById('scheduleModal').style.display = 'block';
}

// Save schedule
function saveSchedule() {
    if (!currentScheduleStaff) return;
    
    const days = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
    const dayNames = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    const schedule = {};
    
    days.forEach((day, index) => {
        const start = document.getElementById(`${day}-start`).value;
        const end = document.getElementById(`${day}-end`).value;
        
        schedule[dayNames[index]] = {
            start: start || '',
            end: end || ''
        };
    });
    
    // Update staff schedule
    const staffIndex = staffData.findIndex(s => s.id === currentScheduleStaff.id);
    if (staffIndex !== -1) {
        staffData[staffIndex].schedule = schedule;
        saveStaffData();
        showNotification('Schedule saved successfully!', 'success');
        closeScheduleModal();
        updateStatistics();
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
function confirmDelete() {
    if (!deleteStaffId) return;
    
    const index = staffData.findIndex(s => s.id === deleteStaffId);
    if (index !== -1) {
        staffData.splice(index, 1);
        saveStaffData();
        loadStaffData();
        updateStatistics();
        displayStaff();
        showNotification('Staff deleted successfully!', 'success');
        closeDeleteModal();
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
            staff.hireDate || '',
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
    document.getElementById('staffModal').style.display = 'none';
    editingStaffId = null;
}

function closeScheduleModal() {
    document.getElementById('scheduleModal').style.display = 'none';
    currentScheduleStaff = null;
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
