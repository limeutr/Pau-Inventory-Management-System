// PAU Inventory Management System - User Management Module
// Comprehensive user management with role-based access, CRUD operations, and audit trail

// Global variables and constants
let users = [];
let auditLog = [];
let currentUser = null;

// User roles and permissions
const USER_ROLES = {
    SUPERVISOR: 'supervisor',
    STAFF: 'staff'
};

const PERMISSIONS = {
    [USER_ROLES.SUPERVISOR]: ['create_user', 'edit_user', 'delete_user', 'view_all_users', 'manage_roles', 'view_audit_log'],
    [USER_ROLES.STAFF]: ['view_profile']
};

// Initialize the module
document.addEventListener('DOMContentLoaded', function() {
    initializeUserManagement();
});

// Initialize user management
function initializeUserManagement() {
    currentUser = getCurrentUser();
    
    // Check if user has supervisor privileges
    if (!currentUser || currentUser.role !== USER_ROLES.SUPERVISOR) {
        showUnauthorizedAccess();
        return;
    }

    loadUsers();
    loadAuditLog();
    setupEventListeners();
    updateUserStats();
    renderUsersTable();
    renderAuditLog();
    
    // Update user info in header
    document.getElementById('welcomeMessage').textContent = `Welcome, ${currentUser.name}!`;
    document.getElementById('userRoleBadge').textContent = currentUser.role;
}

// Load users from localStorage
function loadUsers() {
    const storedUsers = localStorage.getItem('users');
    if (storedUsers) {
        users = JSON.parse(storedUsers);
    } else {
        // Initialize with default users if none exist
        users = [
            {
                id: generateUserId(),
                name: 'System Administrator',
                email: 'admin@pau.edu',
                role: USER_ROLES.SUPERVISOR,
                isActive: true,
                createdAt: new Date().toISOString(),
                createdBy: 'System',
                lastLogin: new Date().toISOString(),
                loginAttempts: 0
            },
            {
                id: generateUserId(),
                name: 'John Doe',
                email: 'john.doe@pau.edu',
                role: USER_ROLES.STAFF,
                isActive: true,
                createdAt: new Date().toISOString(),
                createdBy: 'System Administrator',
                lastLogin: null,
                loginAttempts: 0
            }
        ];
        saveUsers();
    }
}

// Load audit log from localStorage
function loadAuditLog() {
    const storedAuditLog = localStorage.getItem('userAuditLog');
    if (storedAuditLog) {
        auditLog = JSON.parse(storedAuditLog);
    } else {
        auditLog = [];
    }
}

// Save users to localStorage
function saveUsers() {
    localStorage.setItem('users', JSON.stringify(users));
}

// Save audit log to localStorage
function saveAuditLog() {
    localStorage.setItem('userAuditLog', JSON.stringify(auditLog));
}

// Setup event listeners
function setupEventListeners() {
    // Add User button
    document.getElementById('addUserBtn').addEventListener('click', showAddUserModal);
    
    // Modal close buttons
    document.getElementById('closeUserModal').addEventListener('click', closeUserModal);
    document.getElementById('closeAuditModal').addEventListener('click', closeAuditModal);
    
    // User form submission
    document.getElementById('userForm').addEventListener('submit', handleUserFormSubmit);
    
    // Search and filter
    document.getElementById('userSearchInput').addEventListener('input', handleUserSearch);
    document.getElementById('roleFilter').addEventListener('change', handleRoleFilter);
    document.getElementById('statusFilter').addEventListener('change', handleStatusFilter);
    
    // Bulk actions
    document.getElementById('selectAllUsers').addEventListener('change', handleSelectAllUsers);
    document.getElementById('bulkActivateBtn').addEventListener('click', () => handleBulkAction('activate'));
    document.getElementById('bulkDeactivateBtn').addEventListener('click', () => handleBulkAction('deactivate'));
    document.getElementById('bulkDeleteBtn').addEventListener('click', () => handleBulkAction('delete'));
    
    // Export buttons
    document.getElementById('exportUsersBtn').addEventListener('click', exportUsers);
    document.getElementById('exportAuditBtn').addEventListener('click', exportAuditLog);
    
    // Audit log button
    document.getElementById('viewAuditLogBtn').addEventListener('click', showAuditLogModal);
    
    // Logout button
    document.getElementById('logoutBtn').addEventListener('click', logout);
    
    // Close modals when clicking outside
    window.addEventListener('click', function(event) {
        const userModal = document.getElementById('userModal');
        const auditModal = document.getElementById('auditModal');
        
        if (event.target === userModal) {
            closeUserModal();
        }
        if (event.target === auditModal) {
            closeAuditModal();
        }
    });
}

// Get current user
function getCurrentUser() {
    const user = localStorage.getItem('currentUser');
    return user ? JSON.parse(user) : null;
}

// Show unauthorized access message
function showUnauthorizedAccess() {
    document.body.innerHTML = `
        <div class="unauthorized-container">
            <div class="unauthorized-content">
                <h1>🚫 Access Denied</h1>
                <p>You don't have permission to access User Management.</p>
                <p>This module is restricted to Supervisors only.</p>
                <button onclick="goBackToDashboard()" class="btn btn-primary">Back to Dashboard</button>
            </div>
        </div>
    `;
}

// Generate unique user ID
function generateUserId() {
    return 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// Update user statistics
function updateUserStats() {
    const totalUsers = users.length;
    const activeUsers = users.filter(user => user.isActive).length;
    const inactiveUsers = totalUsers - activeUsers;
    const supervisors = users.filter(user => user.role === USER_ROLES.SUPERVISOR).length;
    
    document.getElementById('totalUsers').textContent = totalUsers;
    document.getElementById('activeUsers').textContent = activeUsers;
    document.getElementById('inactiveUsers').textContent = inactiveUsers;
    document.getElementById('supervisorUsers').textContent = supervisors;
}

// Render users table
function renderUsersTable() {
    const tbody = document.getElementById('usersTableBody');
    tbody.innerHTML = '';
    
    const filteredUsers = getFilteredUsers();
    
    if (filteredUsers.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="8" class="no-data">
                    <div class="no-data-content">
                        <span class="no-data-icon">👤</span>
                        <p>No users found matching your criteria</p>
                    </div>
                </td>
            </tr>
        `;
        return;
    }
    
    filteredUsers.forEach(user => {
        const row = document.createElement('tr');
        row.className = user.isActive ? '' : 'inactive-row';
        
        row.innerHTML = `
            <td>
                <input type="checkbox" class="user-checkbox" value="${user.id}">
            </td>
            <td>
                <div class="user-info">
                    <div class="user-avatar">${user.name.charAt(0).toUpperCase()}</div>
                    <div class="user-details">
                        <div class="user-name">${escapeHtml(user.name)}</div>
                        <div class="user-email">${escapeHtml(user.email)}</div>
                    </div>
                </div>
            </td>
            <td>
                <span class="role-badge ${user.role}">${user.role}</span>
            </td>
            <td>
                <span class="status-badge ${user.isActive ? 'active' : 'inactive'}">
                    ${user.isActive ? '✅ Active' : '❌ Inactive'}
                </span>
            </td>
            <td>${formatDate(user.createdAt)}</td>
            <td>${user.lastLogin ? formatDate(user.lastLogin) : 'Never'}</td>
            <td>${user.loginAttempts}</td>
            <td class="actions">
                <button onclick="editUser('${user.id}')" class="btn btn-sm btn-primary" title="Edit User">
                    ✏️
                </button>
                <button onclick="toggleUserStatus('${user.id}')" 
                        class="btn btn-sm ${user.isActive ? 'btn-warning' : 'btn-success'}" 
                        title="${user.isActive ? 'Deactivate' : 'Activate'} User">
                    ${user.isActive ? '⏸️' : '▶️'}
                </button>
                <button onclick="deleteUser('${user.id}')" class="btn btn-sm btn-danger" title="Delete User">
                    🗑️
                </button>
            </td>
        `;
        
        tbody.appendChild(row);
    });
}

// Get filtered users based on search and filters
function getFilteredUsers() {
    let filteredUsers = [...users];
    
    // Search filter
    const searchTerm = document.getElementById('userSearchInput').value.toLowerCase();
    if (searchTerm) {
        filteredUsers = filteredUsers.filter(user => 
            user.name.toLowerCase().includes(searchTerm) ||
            user.email.toLowerCase().includes(searchTerm)
        );
    }
    
    // Role filter
    const roleFilter = document.getElementById('roleFilter').value;
    if (roleFilter && roleFilter !== 'all') {
        filteredUsers = filteredUsers.filter(user => user.role === roleFilter);
    }
    
    // Status filter
    const statusFilter = document.getElementById('statusFilter').value;
    if (statusFilter === 'active') {
        filteredUsers = filteredUsers.filter(user => user.isActive);
    } else if (statusFilter === 'inactive') {
        filteredUsers = filteredUsers.filter(user => !user.isActive);
    }
    
    return filteredUsers;
}

// Handle user search
function handleUserSearch() {
    renderUsersTable();
}

// Handle role filter
function handleRoleFilter() {
    renderUsersTable();
}

// Handle status filter
function handleStatusFilter() {
    renderUsersTable();
}

// Show add user modal
function showAddUserModal() {
    document.getElementById('modalTitle').textContent = 'Add New User';
    document.getElementById('userForm').reset();
    document.getElementById('userId').value = '';
    document.getElementById('userModal').style.display = 'block';
}

// Close user modal
function closeUserModal() {
    document.getElementById('userModal').style.display = 'none';
}

// Handle user form submission
function handleUserFormSubmit(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const userData = {
        name: formData.get('name').trim(),
        email: formData.get('email').trim().toLowerCase(),
        role: formData.get('role'),
        isActive: formData.get('isActive') === 'on'
    };
    
    // Validation
    if (!validateUserData(userData)) {
        return;
    }
    
    const userId = document.getElementById('userId').value;
    
    if (userId) {
        // Update existing user
        updateUser(userId, userData);
    } else {
        // Create new user
        createUser(userData);
    }
    
    closeUserModal();
}

// Validate user data
function validateUserData(userData) {
    // Check required fields
    if (!userData.name || !userData.email || !userData.role) {
        showNotification('Please fill in all required fields', 'error');
        return false;
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(userData.email)) {
        showNotification('Please enter a valid email address', 'error');
        return false;
    }
    
    // Check for duplicate email
    const userId = document.getElementById('userId').value;
    const existingUser = users.find(user => 
        user.email === userData.email && user.id !== userId
    );
    
    if (existingUser) {
        showNotification('A user with this email already exists', 'error');
        return false;
    }
    
    return true;
}

// Create new user
function createUser(userData) {
    const newUser = {
        id: generateUserId(),
        name: userData.name,
        email: userData.email,
        role: userData.role,
        isActive: userData.isActive,
        createdAt: new Date().toISOString(),
        createdBy: currentUser.name,
        lastLogin: null,
        loginAttempts: 0
    };
    
    users.push(newUser);
    saveUsers();
    
    // Add to audit log
    addToAuditLog('CREATE_USER', `Created user: ${newUser.name} (${newUser.email})`);
    
    updateUserStats();
    renderUsersTable();
    showNotification(`User ${newUser.name} created successfully`, 'success');
}

// Edit user
function editUser(userId) {
    const user = users.find(u => u.id === userId);
    if (!user) {
        showNotification('User not found', 'error');
        return;
    }
    
    // Populate form
    document.getElementById('modalTitle').textContent = 'Edit User';
    document.getElementById('userId').value = user.id;
    document.getElementById('userName').value = user.name;
    document.getElementById('userEmail').value = user.email;
    document.getElementById('userRole').value = user.role;
    document.getElementById('userIsActive').checked = user.isActive;
    
    document.getElementById('userModal').style.display = 'block';
}

// Update user
function updateUser(userId, userData) {
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex === -1) {
        showNotification('User not found', 'error');
        return;
    }
    
    const oldUser = { ...users[userIndex] };
    
    users[userIndex] = {
        ...users[userIndex],
        name: userData.name,
        email: userData.email,
        role: userData.role,
        isActive: userData.isActive,
        updatedAt: new Date().toISOString(),
        updatedBy: currentUser.name
    };
    
    saveUsers();
    
    // Add to audit log
    const changes = [];
    if (oldUser.name !== userData.name) changes.push(`name: ${oldUser.name} → ${userData.name}`);
    if (oldUser.email !== userData.email) changes.push(`email: ${oldUser.email} → ${userData.email}`);
    if (oldUser.role !== userData.role) changes.push(`role: ${oldUser.role} → ${userData.role}`);
    if (oldUser.isActive !== userData.isActive) changes.push(`status: ${oldUser.isActive ? 'active' : 'inactive'} → ${userData.isActive ? 'active' : 'inactive'}`);
    
    addToAuditLog('UPDATE_USER', `Updated user: ${userData.name} (${changes.join(', ')})`);
    
    updateUserStats();
    renderUsersTable();
    showNotification(`User ${userData.name} updated successfully`, 'success');
}

// Toggle user status
function toggleUserStatus(userId) {
    const user = users.find(u => u.id === userId);
    if (!user) {
        showNotification('User not found', 'error');
        return;
    }
    
    const action = user.isActive ? 'deactivate' : 'activate';
    const message = `Are you sure you want to ${action} ${user.name}?`;
    
    if (confirm(message)) {
        user.isActive = !user.isActive;
        user.updatedAt = new Date().toISOString();
        user.updatedBy = currentUser.name;
        
        saveUsers();
        
        // Add to audit log
        addToAuditLog(
            user.isActive ? 'ACTIVATE_USER' : 'DEACTIVATE_USER',
            `${user.isActive ? 'Activated' : 'Deactivated'} user: ${user.name}`
        );
        
        updateUserStats();
        renderUsersTable();
        showNotification(`User ${user.name} ${user.isActive ? 'activated' : 'deactivated'} successfully`, 'success');
    }
}

// Delete user
function deleteUser(userId) {
    const user = users.find(u => u.id === userId);
    if (!user) {
        showNotification('User not found', 'error');
        return;
    }
    
    // Prevent deleting the current user
    if (user.id === currentUser.id) {
        showNotification('You cannot delete your own account', 'error');
        return;
    }
    
    const message = `Are you sure you want to delete ${user.name}? This action cannot be undone.`;
    
    if (confirm(message)) {
        const userIndex = users.findIndex(u => u.id === userId);
        users.splice(userIndex, 1);
        
        saveUsers();
        
        // Add to audit log
        addToAuditLog('DELETE_USER', `Deleted user: ${user.name} (${user.email})`);
        
        updateUserStats();
        renderUsersTable();
        showNotification(`User ${user.name} deleted successfully`, 'success');
    }
}

// Handle select all users
function handleSelectAllUsers(event) {
    const checkboxes = document.querySelectorAll('.user-checkbox');
    checkboxes.forEach(checkbox => {
        checkbox.checked = event.target.checked;
    });
}

// Handle bulk actions
function handleBulkAction(action) {
    const selectedUserIds = Array.from(document.querySelectorAll('.user-checkbox:checked'))
        .map(checkbox => checkbox.value);
    
    if (selectedUserIds.length === 0) {
        showNotification('Please select users to perform bulk action', 'warning');
        return;
    }
    
    // Prevent bulk actions on current user
    if (selectedUserIds.includes(currentUser.id) && (action === 'delete' || action === 'deactivate')) {
        showNotification(`You cannot ${action} your own account`, 'error');
        return;
    }
    
    const actionText = action === 'activate' ? 'activate' : action === 'deactivate' ? 'deactivate' : 'delete';
    const message = `Are you sure you want to ${actionText} ${selectedUserIds.length} selected user(s)?`;
    
    if (confirm(message)) {
        let successCount = 0;
        
        selectedUserIds.forEach(userId => {
            const user = users.find(u => u.id === userId);
            if (user) {
                if (action === 'activate') {
                    user.isActive = true;
                    addToAuditLog('BULK_ACTIVATE', `Bulk activated user: ${user.name}`);
                    successCount++;
                } else if (action === 'deactivate') {
                    user.isActive = false;
                    addToAuditLog('BULK_DEACTIVATE', `Bulk deactivated user: ${user.name}`);
                    successCount++;
                } else if (action === 'delete') {
                    const userIndex = users.findIndex(u => u.id === userId);
                    if (userIndex !== -1) {
                        addToAuditLog('BULK_DELETE', `Bulk deleted user: ${user.name}`);
                        users.splice(userIndex, 1);
                        successCount++;
                    }
                }
            }
        });
        
        saveUsers();
        updateUserStats();
        renderUsersTable();
        
        // Clear select all checkbox
        document.getElementById('selectAllUsers').checked = false;
        
        showNotification(`Successfully ${actionText}d ${successCount} user(s)`, 'success');
    }
}

// Export users
function exportUsers() {
    const filteredUsers = getFilteredUsers();
    
    // Prepare data for export
    const exportData = filteredUsers.map(user => ({
        'Name': user.name,
        'Email': user.email,
        'Role': user.role,
        'Status': user.isActive ? 'Active' : 'Inactive',
        'Created At': formatDate(user.createdAt),
        'Created By': user.createdBy,
        'Last Login': user.lastLogin ? formatDate(user.lastLogin) : 'Never',
        'Login Attempts': user.loginAttempts
    }));
    
    // Convert to CSV
    const csv = convertToCSV(exportData);
    
    // Download CSV
    downloadFile(csv, 'pau_users_export.csv', 'text/csv');
    
    showNotification('Users exported successfully', 'success');
}

// Add to audit log
function addToAuditLog(action, description) {
    const auditEntry = {
        id: generateUserId(),
        action: action,
        description: description,
        performedBy: currentUser.name,
        performedAt: new Date().toISOString(),
        ipAddress: 'N/A', // Would be real IP in production
        userAgent: navigator.userAgent
    };
    
    auditLog.unshift(auditEntry); // Add to beginning
    
    // Keep only last 1000 entries
    if (auditLog.length > 1000) {
        auditLog = auditLog.slice(0, 1000);
    }
    
    saveAuditLog();
}

// Show audit log modal
function showAuditLogModal() {
    renderAuditLog();
    document.getElementById('auditModal').style.display = 'block';
}

// Close audit log modal
function closeAuditModal() {
    document.getElementById('auditModal').style.display = 'none';
}

// Render audit log
function renderAuditLog() {
    const tbody = document.getElementById('auditLogTableBody');
    tbody.innerHTML = '';
    
    if (auditLog.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="4" class="no-data">
                    <div class="no-data-content">
                        <span class="no-data-icon">📋</span>
                        <p>No audit log entries found</p>
                    </div>
                </td>
            </tr>
        `;
        return;
    }
    
    // Show last 50 entries
    const recentEntries = auditLog.slice(0, 50);
    
    recentEntries.forEach(entry => {
        const row = document.createElement('tr');
        
        row.innerHTML = `
            <td>${formatDate(entry.performedAt)}</td>
            <td>
                <span class="action-badge ${entry.action.toLowerCase().replace('_', '-')}">${entry.action}</span>
            </td>
            <td>${escapeHtml(entry.description)}</td>
            <td>${escapeHtml(entry.performedBy)}</td>
        `;
        
        tbody.appendChild(row);
    });
}

// Export audit log
function exportAuditLog() {
    // Prepare data for export
    const exportData = auditLog.map(entry => ({
        'Date/Time': formatDate(entry.performedAt),
        'Action': entry.action,
        'Description': entry.description,
        'Performed By': entry.performedBy,
        'IP Address': entry.ipAddress,
        'User Agent': entry.userAgent
    }));
    
    // Convert to CSV
    const csv = convertToCSV(exportData);
    
    // Download CSV
    downloadFile(csv, 'pau_audit_log_export.csv', 'text/csv');
    
    showNotification('Audit log exported successfully', 'success');
}

// Utility functions
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function convertToCSV(data) {
    if (data.length === 0) return '';
    
    const headers = Object.keys(data[0]);
    const csvHeaders = headers.join(',');
    
    const csvRows = data.map(row => {
        return headers.map(header => {
            const value = row[header];
            return `"${String(value).replace(/"/g, '""')}"`;
        }).join(',');
    });
    
    return [csvHeaders, ...csvRows].join('\n');
}

function downloadFile(content, filename, contentType) {
    const blob = new Blob([content], { type: contentType });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
}

function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <span class="notification-icon">${getNotificationIcon(type)}</span>
        <span class="notification-message">${message}</span>
        <button class="notification-close" onclick="this.parentElement.remove()">×</button>
    `;
    
    // Add to page
    document.body.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 5000);
}

function getNotificationIcon(type) {
    switch (type) {
        case 'success': return '✅';
        case 'error': return '❌';
        case 'warning': return '⚠️';
        default: return 'ℹ️';
    }
}

// Navigation functions
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

function logout() {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem('currentUser');
        window.location.href = 'index.html';
    }
}

// Export functions for global access
window.editUser = editUser;
window.toggleUserStatus = toggleUserStatus;
window.deleteUser = deleteUser;
window.goBackToDashboard = goBackToDashboard;
window.logout = logout;
