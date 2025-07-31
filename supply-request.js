// Supply Request Management System
let supplyRequests = [];
let nextRequestId = 1;
let currentUser = {};
let filteredRequests = [];
let currentRequestId = null;

// API Configuration
const API_BASE_URL = 'http://localhost:3000/api';

// Initialize the system
document.addEventListener('DOMContentLoaded', function() {
    // Check authentication and role
    checkAuthAndRole();
    
    // Setup logout functionality
    setupLogout();
    
    // Update welcome message and role badge
    updateUserInfo();
    
    // Load supply requests from API
    loadSupplyRequestsFromAPI();
    
    // Setup form submission
    setupFormSubmission();
    
    // Set minimum date for needed by field
    setMinimumDates();
});

function checkAuthAndRole() {
    const isLoggedIn = sessionStorage.getItem('isLoggedIn');
    const userRole = sessionStorage.getItem('userRole');
    const username = sessionStorage.getItem('username');
    
    if (!isLoggedIn || isLoggedIn !== 'true') {
        window.location.href = 'index.html';
        return;
    }
    
    currentUser = {
        username: username,
        role: userRole
    };
    
    // Store user info for the session
    if (!userRole || !username) {
        window.location.href = 'index.html';
        return;
    }
}

function setupLogout() {
    const logoutBtn = document.getElementById('logoutBtn');
    logoutBtn.addEventListener('click', function() {
        if (confirm('Are you sure you want to logout?')) {
            sessionStorage.clear();
            window.location.href = 'index.html';
        }
    });
}

function updateUserInfo() {
    const welcomeMessage = document.getElementById('welcomeMessage');
    const roleBadge = document.getElementById('userRoleBadge');
    const viewAllBtn = document.getElementById('viewAllBtn');
    const approvalHeader = document.getElementById('approvalHeader');
    
    const displayName = currentUser.username.charAt(0).toUpperCase() + currentUser.username.slice(1);
    welcomeMessage.textContent = `Welcome, ${displayName}!`;
    
    if (currentUser.role === 'supervisor' || currentUser.role === 'admin') {
        roleBadge.textContent = 'Supervisor';
        roleBadge.className = 'role-badge supervisor';
        // Show "View All Requests" button for supervisors
        if (viewAllBtn) {
            viewAllBtn.style.display = 'flex';
        }
        // Show approval column for supervisors and admins
        if (approvalHeader) {
            approvalHeader.style.display = 'table-cell';
        }
    } else {
        roleBadge.textContent = 'Staff';
        roleBadge.className = 'role-badge staff';
        // Hide "View All Requests" button for staff
        if (viewAllBtn) {
            viewAllBtn.style.display = 'none';
        }
        // Hide approval column for staff
        if (approvalHeader) {
            approvalHeader.style.display = 'none';
        }
    }
}

// Load supply requests from API
async function loadSupplyRequestsFromAPI() {
    try {
        console.log('Fetching supply requests from API...');
        const response = await fetch(`${API_BASE_URL}/supply-requests`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log('Received supply requests from API:', data.length, 'requests');
        
        // Update supply requests with data from database
        supplyRequests = data;
        
        // Set filteredRequests to show all requests initially
        filteredRequests = [...supplyRequests];
        
        console.log('Updated supplyRequests array:', supplyRequests.length, 'requests');
        
        // Update display
        displayRequests();
        updateStatistics();
        
        console.log('Supply requests loaded from database:', supplyRequests.length, 'requests');
    } catch (error) {
        console.error('Error loading supply requests:', error);
        
        // Fallback to sample data if API fails
        initializeSampleData();
        displayRequests();
        updateStatistics();
    }
}

// Add new supply request via API
async function addSupplyRequestToAPI(requestData) {
    try {
        const response = await fetch(`${API_BASE_URL}/supply-requests`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                itemName: requestData.itemName,
                quantity: requestData.quantity,
                priority: requestData.priority,
                status: requestData.status,
                requestedBy: requestData.requestedBy,
                neededBy: requestData.neededBy,
                justification: requestData.justification,
                preferredSupplier: requestData.preferredSupplier,
                date: requestData.requestedDate
            })
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const newRequest = await response.json();
        console.log('Supply request added to database:', newRequest);
        
        // Reload supply requests data
        await loadSupplyRequestsFromAPI();
        
        return newRequest;
    } catch (error) {
        console.error('Error adding supply request to database:', error);
        throw error;
    }
}

// Update supply request via API
async function updateSupplyRequestInAPI(requestId, requestData) {
    try {
        const response = await fetch(`${API_BASE_URL}/supply-requests/${requestId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                itemName: requestData.itemName,
                quantity: requestData.quantity,
                priority: requestData.priority,
                status: requestData.status,
                requestedBy: requestData.requestedBy,
                neededBy: requestData.neededBy,
                justification: requestData.justification,
                preferredSupplier: requestData.preferredSupplier,
                date: requestData.requestedDate
            })
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        console.log('Supply request updated in database');
        
        // Reload supply requests data
        await loadSupplyRequestsFromAPI();
        
        return true;
    } catch (error) {
        console.error('Error updating supply request in database:', error);
        throw error;
    }
}

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

function initializeSampleData() {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);
    
    supplyRequests = sampleRequests;
    nextRequestId = supplyRequests.length + 1;
    filteredRequests = [...supplyRequests];
}

function generateRequestId() {
    return `REQ${String(nextRequestId++).padStart(3, '0')}`;
}

function setMinimumDates() {
    const today = new Date().toISOString().split('T')[0];
    const neededByInput = document.getElementById('neededBy');
    const dateFilter = document.getElementById('dateFilter');
    
    if (neededByInput) {
        neededByInput.min = today;
    }
    
    if (dateFilter) {
        dateFilter.max = today;
    }
}

function displayRequests() {
    const tableBody = document.getElementById('requestsTableBody');
    tableBody.innerHTML = '';
    
    if (filteredRequests.length === 0) {
        const colspan = (currentUser.role === 'supervisor' || currentUser.role === 'admin') ? '9' : '8';
        tableBody.innerHTML = `
            <tr>
                <td colspan="${colspan}" style="text-align: center; padding: 40px; color: #666;">
                    No supply requests found
                </td>
            </tr>
        `;
        return;
    }
    
    filteredRequests.forEach(request => {
        const row = document.createElement('tr');
        
        // Highlight urgent requests
        if (request.priority === 'urgent') {
            row.style.background = '#fff5f5';
        }
        
        const canModify = currentUser.role === 'supervisor' || currentUser.role === 'admin' || 
                         (request.requestedBy === currentUser.username && request.status === 'pending');
        
        row.innerHTML = `
            <td><span class="request-id">${request.id}</span></td>
            <td><strong>${request.itemName}</strong></td>
            <td>${request.quantity} ${request.unit}</td>
            <td><span class="priority-badge ${request.priority}">${request.priority}</span></td>
            <td><span class="status-badge ${request.status}">${request.status}</span></td>
            <td>${formatUsername(request.requestedBy)}</td>
            <td>${formatDate(request.requestedDate)}</td>
            <td class="actions">
                <button onclick="viewRequest('${request.id}')" class="action-btn">
                    View
                </button>
                ${canModify ? `
                    <button onclick="editRequest('${request.id}')" class="action-btn edit-btn" 
                        ${request.status !== 'pending' ? 'disabled title="Only pending requests can be edited"' : ''}>
                        Edit
                    </button>
                ` : ''}
            </td>
            ${(currentUser.role === 'supervisor' || currentUser.role === 'admin') ? `
            <td class="approval-section">
                ${request.status === 'pending' ? `
                    <button onclick="approveRequestQuick('${request.id}')" class="action-btn approve-btn">
                        Approve
                    </button>
                ` : ''}
            </td>
            ` : ''}
        `;
        
        tableBody.appendChild(row);
    });
}

function formatUsername(username) {
    return username.split('_').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
}

function formatDate(dateString) {
    if (!dateString) return 'Not specified';

    const dateOnly = dateString.split('T')[0]; // Get just the date part
    const [year, month, day] = dateOnly.split('-');
    
    // Create a Date object (Note: month is 0-indexed)
    const date = new Date(year, month - 1, parseInt(day));
    
    // Add 1 day
    date.setDate(date.getDate() + 1);

    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: '2-digit'
    });
}


function updateStatistics() {
    const stats = {
        total: supplyRequests.length,
        pending: 0,
        approved: 0,
        urgent: 0
    };
    
    supplyRequests.forEach(request => {
        if (request.status === 'pending') stats.pending++;
        if (request.status === 'approved') stats.approved++;
        if (request.priority === 'urgent') stats.urgent++;
    });
    
    document.getElementById('totalCount').textContent = stats.total;
    document.getElementById('pendingCount').textContent = stats.pending;
    document.getElementById('approvedCount').textContent = stats.approved;
    document.getElementById('urgentCount').textContent = stats.urgent;
}

function searchRequests() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    filteredRequests = supplyRequests.filter(request =>
        request.itemName.toLowerCase().includes(searchTerm) ||
        request.id.toLowerCase().includes(searchTerm) ||
        request.requestedBy.toLowerCase().includes(searchTerm) ||
        request.justification.toLowerCase().includes(searchTerm)
    );
    displayRequests();
}

function filterRequests() {
    const statusFilter = document.getElementById('statusFilter').value;
    const priorityFilter = document.getElementById('priorityFilter').value;
    const dateFilter = document.getElementById('dateFilter').value;
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    
    filteredRequests = supplyRequests.filter(request => {
        const matchesStatus = !statusFilter || request.status === statusFilter;
        const matchesPriority = !priorityFilter || request.priority === priorityFilter;
        const matchesDate = !dateFilter || request.requestedDate === dateFilter;
        const matchesSearch = !searchTerm || 
            request.itemName.toLowerCase().includes(searchTerm) ||
            request.id.toLowerCase().includes(searchTerm) ||
            request.requestedBy.toLowerCase().includes(searchTerm) ||
            request.justification.toLowerCase().includes(searchTerm);
        
        return matchesStatus && matchesPriority && matchesDate && matchesSearch;
    });
    
    displayRequests();
}

function viewMyRequests() {
    filteredRequests = supplyRequests.filter(request => request.requestedBy === currentUser.username);
    displayRequests();
    showNotification('Showing your requests only', 'info');
}

function viewAllRequests() {
    if (currentUser.role !== 'supervisor' && currentUser.role !== 'admin') {
        alert('⚠️ Access Denied\n\nOnly supervisors can view all requests.');
        return;
    }
    
    filteredRequests = [...supplyRequests];
    displayRequests();
    showNotification('Showing all requests', 'info');
}

// Modal Functions
function openNewRequestModal() {
    document.getElementById('modalTitle').textContent = 'New Supply Request';
    document.getElementById('requestForm').reset();
    document.getElementById('requestModal').style.display = 'block';
    
    // Set minimum date to today
    setMinimumDates();
}

function editRequest(requestId) {
    console.log('editRequest called with requestId:', requestId, 'type:', typeof requestId);
    
    // Convert requestId to handle both string and number types
    const request = supplyRequests.find(r => r.id == requestId || r.id === String(requestId) || r.id === Number(requestId));
    console.log('Found request for editing:', request);
    
    if (!request) {
        console.error('Request not found for editing, ID:', requestId);
        alert('Request not found!');
        return;
    }
    
    // Check if user can edit this request
    const canEdit = currentUser.role === 'supervisor' || currentUser.role === 'admin' || 
                   (request.requestedBy === currentUser.username && request.status === 'pending');
    
    if (!canEdit) {
        alert('⚠️ Access Denied\n\nYou can only edit your own pending requests.');
        return;
    }
    
    if (request.status !== 'pending') {
        alert('⚠️ Cannot Edit\n\nOnly pending requests can be edited.');
        return;
    }
    
    document.getElementById('modalTitle').textContent = 'Edit Supply Request';
    document.getElementById('itemName').value = request.itemName || '';
    document.getElementById('category').value = request.category || '';
    document.getElementById('quantity').value = request.quantity || '';
    document.getElementById('unit').value = request.unit || '';
    document.getElementById('priority').value = request.priority || '';
    document.getElementById('neededBy').value = request.neededBy || '';
    document.getElementById('justification').value = request.justification || '';
    document.getElementById('preferredSupplier').value = request.preferredSupplier || '';
    
    // Store the request ID for updating
    document.getElementById('requestForm').dataset.editingId = requestId;
    document.getElementById('requestModal').style.display = 'block';
}

function viewRequest(requestId) {
    console.log('viewRequest called with requestId:', requestId, 'type:', typeof requestId);
    console.log('Current supplyRequests array:', supplyRequests);
    
    // Convert requestId to number if it's a string, or try both string and number comparison
    const request = supplyRequests.find(r => r.id == requestId || r.id === String(requestId) || r.id === Number(requestId));
    console.log('Found request:', request);
    
    if (!request) {
        console.error('Request not found for ID:', requestId);
        alert('Request not found!');
        return;
    }
    
    currentRequestId = requestId;
    
    const details = document.getElementById('requestDetails');
    details.innerHTML = `
        <div class="detail-group">
            <label>Request ID:</label>
            <p>${request.id}</p>
        </div>
        <div class="detail-group">
            <label>Item Name:</label>
            <p>${request.itemName}</p>
        </div>
        <div class="detail-group">
            <label>Category:</label>
            <p>${request.category.replace('_', ' ')}</p>
        </div>
        <div class="detail-group">
            <label>Quantity:</label>
            <p>${request.quantity} ${request.unit}</p>
        </div>
        <div class="detail-group">
            <label>Priority:</label>
            <p><span class="priority-badge ${request.priority}">${request.priority}</span></p>
        </div>
        <div class="detail-group">
            <label>Status:</label>
            <p><span class="status-badge ${request.status}">${request.status}</span></p>
        </div>
        <div class="detail-group">
            <label>Requested By:</label>
            <p>${formatUsername(request.requestedBy)}</p>
        </div>
        <div class="detail-group">
            <label>Requested Date:</label>
            <p>${formatDate(request.requestedDate)}</p>
        </div>
        <div class="detail-group">
            <label>Needed By:</label>
            <p>${request.neededBy ? formatDate(request.neededBy) : 'Not specified'}</p>
        </div>
        <div class="detail-group">
            <label>Justification:</label>
            <p>${request.justification}</p>
        </div>
        <div class="detail-group">
            <label>Preferred Supplier:</label>
            <p>${request.preferredSupplier || 'Not specified'}</p>
        </div>
        ${request.approvedBy ? `
            <div class="detail-group">
                <label>Approved By:</label>
                <p>${formatUsername(request.approvedBy)}</p>
            </div>
            <div class="detail-group">
                <label>Approved Date:</label>
                <p>${formatDate(request.approvedDate)}</p>
            </div>
        ` : ''}
        ${request.completedDate ? `
            <div class="detail-group">
                <label>Completed Date:</label>
                <p>${formatDate(request.completedDate)}</p>
            </div>
        ` : ''}
    `;
    
    // Show admin actions for supervisors and pending requests
    const adminActions = document.getElementById('adminActions');
    if ((currentUser.role === 'supervisor' || currentUser.role === 'admin') && request.status === 'pending') {
        adminActions.style.display = 'flex';
    } else {
        adminActions.style.display = 'none';
    }
    
    document.getElementById('viewModal').style.display = 'block';
}

async function approveRequestQuick(requestId) {
    console.log('approveRequestQuick called with requestId:', requestId, 'type:', typeof requestId);
    
    if (currentUser.role !== 'supervisor' && currentUser.role !== 'admin') {
        alert('⚠️ Access Denied\n\nOnly supervisors can approve requests.');
        return;
    }
    
    // Convert requestId to handle both string and number types
    const request = supplyRequests.find(r => r.id == requestId || r.id === String(requestId) || r.id === Number(requestId));
    console.log('Found request for approval:', request);
    
    if (!request) {
        console.error('Request not found for approval, ID:', requestId);
        alert('Request not found!');
        return;
    }
    
    if (request.status !== 'pending') {
        alert('⚠️ Cannot Approve\n\nOnly pending requests can be approved.');
        return;
    }
    
    const confirmMessage = `Are you sure you want to approve the request for "${request.itemName}"?`;
    if (confirm(confirmMessage)) {
        try {
            // Update request data
            const updatedData = {
                ...request,
                status: 'approved',
                approvedBy: currentUser.username,
                approvedDate: new Date().toISOString().split('T')[0]
            };
            
            await updateSupplyRequestInAPI(requestId, updatedData);
            showNotification('Request approved successfully', 'success');
        } catch (error) {
            console.error('Error approving request:', error);
            showNotification('Error approving request. Please try again.', 'error');
        }
    }
}

async function approveRequest() {
    if (!currentRequestId) return;
    
    // Convert currentRequestId to handle both string and number types
    const request = supplyRequests.find(r => r.id == currentRequestId || r.id === String(currentRequestId) || r.id === Number(currentRequestId));
    if (!request) {
        console.error('Request not found for approval, ID:', currentRequestId);
        alert('Request not found!');
        return;
    }
    
    try {
        // Update request data
        const updatedData = {
            ...request,
            status: 'approved',
            approvedBy: currentUser.username,
            approvedDate: new Date().toISOString().split('T')[0]
        };
        
        await updateSupplyRequestInAPI(currentRequestId, updatedData);
        closeViewModal();
        showNotification('Request approved successfully', 'success');
    } catch (error) {
        console.error('Error approving request:', error);
        showNotification('Error approving request. Please try again.', 'error');
    }
}

async function rejectRequest() {
    if (!currentRequestId) return;
    
    // Convert currentRequestId to handle both string and number types
    const request = supplyRequests.find(r => r.id == currentRequestId || r.id === String(currentRequestId) || r.id === Number(currentRequestId));
    if (!request) {
        console.error('Request not found for rejection, ID:', currentRequestId);
        alert('Request not found!');
        return;
    }
    
    const reason = prompt('Please provide a reason for rejection:');
    if (reason === null) return; // User cancelled
    
    try {
        // Update request data
        const updatedData = {
            ...request,
            status: 'rejected',
            rejectedBy: currentUser.username,
            rejectedDate: new Date().toISOString().split('T')[0],
            rejectionReason: reason
        };
        
        await updateSupplyRequestInAPI(currentRequestId, updatedData);
        closeViewModal();
        showNotification('Request rejected', 'info');
    } catch (error) {
        console.error('Error rejecting request:', error);
        showNotification('Error rejecting request. Please try again.', 'error');
    }
}

function closeModal() {
    document.getElementById('requestModal').style.display = 'none';
    document.getElementById('requestForm').removeAttribute('data-editing-id');
}

function closeViewModal() {
    document.getElementById('viewModal').style.display = 'none';
    currentRequestId = null;
}

function closeConfirmModal() {
    document.getElementById('confirmModal').style.display = 'none';
}

function setupFormSubmission() {
    document.getElementById('requestForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const formData = new FormData(this);
        
        // Get today's date in proper format (no timezone manipulation)
        const today = new Date();
        const todayString = today.getFullYear() + '-' + 
                           String(today.getMonth() + 1).padStart(2, '0') + '-' + 
                           String(today.getDate()).padStart(2, '0');
        
        // Get the actual neededBy value from the form
        const formNeededBy = formData.get('neededBy');
        
        const requestData = {
            itemName: formData.get('itemName'),
            category: formData.get('category'),
            quantity: parseFloat(formData.get('quantity')),
            unit: formData.get('unit'),
            priority: formData.get('priority'),
            neededBy: formNeededBy || todayString,
            justification: formData.get('justification'),
            preferredSupplier: formData.get('preferredSupplier') || null,
            status: 'pending',
            requestedBy: currentUser.username,
            requestedDate: todayString, // Use proper date format
            approvedBy: null,
            approvedDate: null,
            completedDate: null
        };
        
        console.log('Form data - neededBy:', formData.get('neededBy'));
        console.log('Request data - neededBy:', requestData.neededBy);
        console.log('Full request data:', requestData);
        
        // Additional debugging for neededBy field
        const neededByField = document.getElementById('neededBy');
        console.log('neededBy field element:', neededByField);
        console.log('neededBy field value:', neededByField ? neededByField.value : 'Field not found');
        
        // Validate business rules
        if (!validateRequestData(requestData)) {
            return;
        }
        
        const editingId = this.dataset.editingId;
        
        try {
            if (editingId) {
                // Update existing request via API
                await updateSupplyRequestInAPI(editingId, requestData);
                showNotification('Request updated successfully', 'success');
            } else {
                // Add new request via API (ID will be auto-generated by database)
                await addSupplyRequestToAPI(requestData);
                showNotification('Request submitted successfully', 'success');
            }
            
            closeModal();
        } catch (error) {
            console.error('Error saving request:', error);
            showNotification('Error saving request. Please try again.', 'error');
        }
    });
}

function validateRequestData(requestData) {
    // Business rule: Quantity must be positive
    if (requestData.quantity <= 0) {
        alert('⚠️ Validation Error\n\nQuantity must be greater than zero.');
        return false;
    }
    
    // Business rule: Justification must be meaningful
    if (requestData.justification.trim().length < 10) {
        alert('⚠️ Validation Error\n\nPlease provide a more detailed justification (at least 10 characters).');
        return false;
    }
    
    return true;
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease-in';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// Setup search input event listener
document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('keyup', function(e) {
            if (e.key === 'Enter') {
                searchRequests();
            } else {
                // Debounced search
                clearTimeout(this.searchTimeout);
                this.searchTimeout = setTimeout(searchRequests, 300);
            }
        });
    }
});

// Close modals when clicking outside
window.addEventListener('click', function(e) {
    const requestModal = document.getElementById('requestModal');
    const viewModal = document.getElementById('viewModal');
    const confirmModal = document.getElementById('confirmModal');
    
    if (e.target === requestModal) {
        closeModal();
    }
    
    if (e.target === viewModal) {
        closeViewModal();
    }
    
    if (e.target === confirmModal) {
        closeConfirmModal();
    }
});

// Export and print functions (placeholder implementations)
function exportAnalytics() {
    // Placeholder for export functionality
    alert('📤 Export functionality will be implemented in the next version.');
}

function printReport() {
    // Placeholder for print functionality
    window.print();
}

async function refreshData() {
    try {
        await loadSupplyRequestsFromAPI();
        showNotification('Data refreshed successfully', 'success');
    } catch (error) {
        console.error('Error refreshing data:', error);
        showNotification('Error refreshing data. Please try again.', 'error');
    }
}
