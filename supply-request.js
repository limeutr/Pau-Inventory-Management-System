// Supply Request Management System
let supplyRequests = [];
let nextRequestId = 1;
let currentUser = {};
let filteredRequests = [];
let currentRequestId = null;

// Initialize the system
document.addEventListener('DOMContentLoaded', function() {
    // Check authentication and role
    checkAuthAndRole();
    
    // Setup logout functionality
    setupLogout();
    
    // Update welcome message and role badge
    updateUserInfo();
    
    // Initialize sample data
    initializeSampleData();
    
    // Setup form submission
    setupFormSubmission();
    
    // Load and display requests
    displayRequests();
    
    // Update statistics
    updateStatistics();
    
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
    
    const displayName = currentUser.username.charAt(0).toUpperCase() + currentUser.username.slice(1);
    welcomeMessage.textContent = `Welcome, ${displayName}!`;
    
    if (currentUser.role === 'supervisor' || currentUser.role === 'admin') {
        roleBadge.textContent = 'Supervisor';
        roleBadge.className = 'role-badge supervisor';
        // Show "View All Requests" button for supervisors
        if (viewAllBtn) {
            viewAllBtn.style.display = 'flex';
        }
    } else {
        roleBadge.textContent = 'Staff';
        roleBadge.className = 'role-badge staff';
        // Hide "View All Requests" button for staff
        if (viewAllBtn) {
            viewAllBtn.style.display = 'none';
        }
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
    
    const sampleRequests = [
        {
            id: 'REQ001',
            itemName: 'All Purpose Flour',
            category: 'raw_ingredient',
            quantity: 100,
            unit: 'kg',
            priority: 'high',
            status: 'pending',
            requestedBy: 'john_doe',
            requestedDate: today.toISOString().split('T')[0],
            neededBy: tomorrow.toISOString().split('T')[0],
            justification: 'Critical stock shortage - only 15kg remaining with minimum threshold of 50kg. Need immediate restocking for daily PAU production.',
            preferredSupplier: 'Golden Wheat Co.',
            approvedBy: null,
            approvedDate: null,
            completedDate: null
        },
        {
            id: 'REQ002',
            itemName: 'Red Bean Paste',
            category: 'filling',
            quantity: 20,
            unit: 'kg',
            priority: 'medium',
            status: 'approved',
            requestedBy: 'jane_smith',
            requestedDate: '2025-07-20',
            neededBy: '2025-07-25',
            justification: 'Red Bean Pau is popular item. Need additional stock to meet weekend demand.',
            preferredSupplier: 'Filling Co.',
            approvedBy: 'admin',
            approvedDate: '2025-07-21',
            completedDate: null
        },
        {
            id: 'REQ003',
            itemName: 'Char Siew',
            category: 'filling',
            quantity: 15,
            unit: 'kg',
            priority: 'urgent',
            status: 'pending',
            requestedBy: 'baker_mike',
            requestedDate: today.toISOString().split('T')[0],
            neededBy: today.toISOString().split('T')[0],
            justification: 'Urgent replacement needed - current batch expires tomorrow. Essential for Char Siew Pau production.',
            preferredSupplier: 'Filling Co.',
            approvedBy: null,
            approvedDate: null,
            completedDate: null
        },
        {
            id: 'REQ004',
            itemName: 'Instant Dry Yeast',
            category: 'raw_ingredient',
            quantity: 5,
            unit: 'kg',
            priority: 'medium',
            status: 'completed',
            requestedBy: 'staff_mary',
            requestedDate: '2025-07-18',
            neededBy: '2025-07-22',
            justification: 'Regular inventory restocking for PAU dough preparation.',
            preferredSupplier: 'Golden Wheat Co.',
            approvedBy: 'admin',
            approvedDate: '2025-07-18',
            completedDate: '2025-07-19'
        },
        {
            id: 'REQ005',
            itemName: 'Lotus Seed Paste',
            category: 'filling',
            quantity: 12,
            unit: 'kg',
            priority: 'high',
            status: 'approved',
            requestedBy: 'production_team',
            requestedDate: '2025-07-21',
            neededBy: nextWeek.toISOString().split('T')[0],
            justification: 'High demand for Lotus Bao. Premium filling ingredient needed for special orders.',
            preferredSupplier: 'Filling Co.',
            approvedBy: 'supervisor',
            approvedDate: '2025-07-21',
            completedDate: null
        },
        {
            id: 'REQ006',
            itemName: 'Sugar',
            category: 'raw_ingredient',
            quantity: 25,
            unit: 'kg',
            priority: 'low',
            status: 'pending',
            requestedBy: 'inventory_clerk',
            requestedDate: today.toISOString().split('T')[0],
            neededBy: nextWeek.toISOString().split('T')[0],
            justification: 'Routine stock replenishment. Current levels adequate but approaching minimum threshold.',
            preferredSupplier: 'Sweet Supply Ltd.',
            approvedBy: null,
            approvedDate: null,
            completedDate: null
        },
        {
            id: 'REQ007',
            itemName: 'Custard Filling',
            category: 'filling',
            quantity: 8,
            unit: 'kg',
            priority: 'medium',
            status: 'rejected',
            requestedBy: 'staff_peter',
            requestedDate: '2025-07-19',
            neededBy: '2025-07-24',
            justification: 'Additional custard filling for Nai Wong Bao production increase.',
            preferredSupplier: 'Filling Co.',
            approvedBy: 'admin',
            approvedDate: '2025-07-20',
            completedDate: null,
            rejectionReason: 'Sufficient stock available. Request denied to control inventory costs.'
        }
    ];
    
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
        tableBody.innerHTML = `
            <tr>
                <td colspan="8" style="text-align: center; padding: 40px; color: #666;">
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
                ${(currentUser.role === 'supervisor' || currentUser.role === 'admin') && request.status === 'pending' ? `
                    <button onclick="approveRequestQuick('${request.id}')" class="action-btn approve-btn">
                        Approve
                    </button>
                ` : ''}
            </td>
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
    const date = new Date(dateString);
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
    const request = supplyRequests.find(r => r.id === requestId);
    if (!request) return;
    
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
    document.getElementById('itemName').value = request.itemName;
    document.getElementById('category').value = request.category;
    document.getElementById('quantity').value = request.quantity;
    document.getElementById('unit').value = request.unit;
    document.getElementById('priority').value = request.priority;
    document.getElementById('neededBy').value = request.neededBy;
    document.getElementById('justification').value = request.justification;
    document.getElementById('preferredSupplier').value = request.preferredSupplier || '';
    
    // Store the request ID for updating
    document.getElementById('requestForm').dataset.editingId = requestId;
    document.getElementById('requestModal').style.display = 'block';
}

function viewRequest(requestId) {
    const request = supplyRequests.find(r => r.id === requestId);
    if (!request) return;
    
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

function approveRequestQuick(requestId) {
    if (currentUser.role !== 'supervisor' && currentUser.role !== 'admin') {
        alert('⚠️ Access Denied\n\nOnly supervisors can approve requests.');
        return;
    }
    
    const request = supplyRequests.find(r => r.id === requestId);
    if (!request) return;
    
    if (request.status !== 'pending') {
        alert('⚠️ Cannot Approve\n\nOnly pending requests can be approved.');
        return;
    }
    
    const confirmMessage = `Are you sure you want to approve the request for "${request.itemName}"?`;
    if (confirm(confirmMessage)) {
        request.status = 'approved';
        request.approvedBy = currentUser.username;
        request.approvedDate = new Date().toISOString().split('T')[0];
        
        filteredRequests = [...supplyRequests];
        displayRequests();
        updateStatistics();
        showNotification('Request approved successfully', 'success');
    }
}

function approveRequest() {
    if (!currentRequestId) return;
    
    const request = supplyRequests.find(r => r.id === currentRequestId);
    if (!request) return;
    
    request.status = 'approved';
    request.approvedBy = currentUser.username;
    request.approvedDate = new Date().toISOString().split('T')[0];
    
    filteredRequests = [...supplyRequests];
    displayRequests();
    updateStatistics();
    closeViewModal();
    showNotification('Request approved successfully', 'success');
}

function rejectRequest() {
    if (!currentRequestId) return;
    
    const request = supplyRequests.find(r => r.id === currentRequestId);
    if (!request) return;
    
    const reason = prompt('Please provide a reason for rejection:');
    if (reason === null) return; // User cancelled
    
    request.status = 'rejected';
    request.rejectedBy = currentUser.username;
    request.rejectedDate = new Date().toISOString().split('T')[0];
    request.rejectionReason = reason;
    
    filteredRequests = [...supplyRequests];
    displayRequests();
    updateStatistics();
    closeViewModal();
    showNotification('Request rejected', 'info');
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
    document.getElementById('requestForm').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const formData = new FormData(this);
        const requestData = {
            itemName: formData.get('itemName'),
            category: formData.get('category'),
            quantity: parseFloat(formData.get('quantity')),
            unit: formData.get('unit'),
            priority: formData.get('priority'),
            neededBy: formData.get('neededBy') || null,
            justification: formData.get('justification'),
            preferredSupplier: formData.get('preferredSupplier') || null,
            status: 'pending',
            requestedBy: currentUser.username,
            requestedDate: new Date().toISOString().split('T')[0],
            approvedBy: null,
            approvedDate: null,
            completedDate: null
        };
        
        // Validate business rules
        if (!validateRequestData(requestData)) {
            return;
        }
        
        const editingId = this.dataset.editingId;
        
        if (editingId) {
            // Update existing request
            const requestIndex = supplyRequests.findIndex(request => request.id === editingId);
            if (requestIndex !== -1) {
                supplyRequests[requestIndex] = { ...supplyRequests[requestIndex], ...requestData };
                showNotification('Request updated successfully', 'success');
            }
        } else {
            // Add new request
            requestData.id = generateRequestId();
            supplyRequests.push(requestData);
            showNotification('Request submitted successfully', 'success');
        }
        
        filteredRequests = [...supplyRequests];
        displayRequests();
        updateStatistics();
        closeModal();
    });
}

function validateRequestData(requestData) {
    // Business rule: Quantity must be positive
    if (requestData.quantity <= 0) {
        alert('⚠️ Validation Error\n\nQuantity must be greater than zero.');
        return false;
    }
    
    // Business rule: Check if needed by date is in the future
    if (requestData.neededBy) {
        const today = new Date();
        const neededDate = new Date(requestData.neededBy);
        
        if (neededDate < today) {
            const confirmPastDate = confirm('⚠️ Date Warning\n\nThe "needed by" date is in the past. This may cause delays in processing.\n\nDo you want to continue?');
            if (!confirmPastDate) {
                return false;
            }
        }
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

function refreshData() {
    // Placeholder for data refresh functionality
    displayRequests();
    updateStatistics();
    showNotification('Data refreshed successfully', 'success');
}
