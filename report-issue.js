// Report Issue Management System
let reportedIssues = [];
let nextIssueId = 1;
let currentUser = {};
let filteredIssues = [];
let currentIssueId = null;

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
    
    // Load and display issues
    displayIssues();
    
    // Update statistics
    updateStatistics();
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
        // Show "View All Issues" button for supervisors
        if (viewAllBtn) {
            viewAllBtn.style.display = 'flex';
        }
    } else {
        roleBadge.textContent = 'Staff';
        roleBadge.className = 'role-badge staff';
        // Hide "View All Issues" button for staff
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
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const sampleIssues = [
        {
            id: 'ISS001',
            title: 'Oven Temperature Control Malfunction',
            type: 'equipment',
            priority: 'high',
            status: 'open',
            reportedBy: 'john_doe',
            reportedDate: today.toISOString().split('T')[0],
            location: 'factory',
            equipment: 'Main Production Oven #2',
            description: 'The oven temperature control is not maintaining consistent temperature. Temperature fluctuates between 180°C and 220°C instead of the set 200°C.',
            stepsToReproduce: '1. Set oven to 200°C\n2. Wait for preheating\n3. Monitor temperature for 30 minutes\n4. Observe fluctuations',
            impact: 'Affecting product quality and baking times. Risk of burnt or undercooked products.',
            urgency: 'high',
            department: 'maintenance',
            assignedTo: null,
            resolvedDate: null,
            resolution: null
        },
        {
            id: 'ISS002',
            title: 'Slippery Floor in Storage Area',
            type: 'safety',
            priority: 'critical',
            status: 'in_progress',
            reportedBy: 'jane_smith',
            reportedDate: yesterday.toISOString().split('T')[0],
            location: 'warehouse',
            equipment: 'Storage Area Floor',
            description: 'Water leak from ceiling causing slippery conditions in main storage area. Several near-miss incidents reported.',
            stepsToReproduce: 'N/A - Environmental hazard',
            impact: 'High risk of slip and fall accidents. Potential injury to staff.',
            urgency: 'critical',
            department: 'maintenance',
            assignedTo: 'maintenance_team',
            resolvedDate: null,
            resolution: null
        },
        {
            id: 'ISS003',
            title: 'Inventory System Login Issues',
            type: 'system',
            priority: 'medium',
            status: 'resolved',
            reportedBy: 'staff_user',
            reportedDate: '2025-07-09',
            location: 'office',
            equipment: 'Computer Terminal #3',
            description: 'Unable to login to inventory management system. Error message: "Connection timeout".',
            stepsToReproduce: '1. Open inventory system\n2. Enter credentials\n3. Click login\n4. Wait for timeout error',
            impact: 'Staff cannot update inventory records or check stock levels.',
            urgency: 'medium',
            department: 'it',
            assignedTo: 'it_support',
            resolvedDate: '2025-07-10',
            resolution: 'Network connectivity issue resolved. Replaced faulty ethernet cable.'
        },
        {
            id: 'ISS004',
            title: 'Missing Cleaning Supplies',
            type: 'operational',
            priority: 'low',
            status: 'open',
            reportedBy: 'baker_mike',
            reportedDate: today.toISOString().split('T')[0],
            location: 'factory',
            equipment: 'Cleaning Station',
            description: 'Sanitizing solution and paper towels are out of stock at the main cleaning station.',
            stepsToReproduce: 'Check cleaning station supplies',
            impact: 'Cannot properly sanitize equipment between production runs.',
            urgency: 'medium',
            department: 'production',
            assignedTo: null,
            resolvedDate: null,
            resolution: null
        }
    ];
    
    reportedIssues = sampleIssues;
    nextIssueId = reportedIssues.length + 1;
    filteredIssues = [...reportedIssues];
}

function generateIssueId() {
    return `ISS${String(nextIssueId++).padStart(3, '0')}`;
}

function displayIssues() {
    const tableBody = document.getElementById('issuesTableBody');
    tableBody.innerHTML = '';
    
    if (filteredIssues.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="8" style="text-align: center; padding: 40px; color: #666;">
                    No issues found
                </td>
            </tr>
        `;
        return;
    }
    
    filteredIssues.forEach(issue => {
        const row = document.createElement('tr');
        
        // Highlight critical issues
        if (issue.priority === 'critical') {
            row.style.background = '#fff5f5';
        }
        
        const canModify = currentUser.role === 'supervisor' || currentUser.role === 'admin' || 
                         issue.reportedBy === currentUser.username;
        
        row.innerHTML = `
            <td><span class="issue-id">${issue.id}</span></td>
            <td><strong>${issue.title}</strong></td>
            <td><span class="type-badge ${issue.type}">${issue.type}</span></td>
            <td><span class="priority-badge ${issue.priority}">${issue.priority}</span></td>
            <td><span class="status-badge ${issue.status}">${issue.status.replace('_', ' ')}</span></td>
            <td>${formatUsername(issue.reportedBy)}</td>
            <td>${formatDate(issue.reportedDate)}</td>
            <td class="actions">
                <button onclick="viewIssue('${issue.id}')" class="action-btn view-btn">
                    View
                </button>
                ${canModify && issue.status === 'open' ? `
                    <button onclick="editIssue('${issue.id}')" class="action-btn edit-btn">
                        Edit
                    </button>
                ` : ''}
                ${(currentUser.role === 'supervisor' || currentUser.role === 'admin') && issue.status !== 'closed' ? `
                    <button onclick="updateIssueStatusQuick('${issue.id}', 'in_progress')" class="action-btn progress-btn">
                        Progress
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
        total: reportedIssues.length,
        open: 0,
        inProgress: 0,
        resolved: 0,
        critical: 0
    };
    
    reportedIssues.forEach(issue => {
        if (issue.status === 'open') stats.open++;
        if (issue.status === 'in_progress') stats.inProgress++;
        if (issue.status === 'resolved') stats.resolved++;
        if (issue.priority === 'critical') stats.critical++;
    });
    
    document.getElementById('openCount').textContent = stats.open;
    document.getElementById('inProgressCount').textContent = stats.inProgress;
    document.getElementById('resolvedCount').textContent = stats.resolved;
    document.getElementById('criticalCount').textContent = stats.critical;
}

function searchIssues() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    filteredIssues = reportedIssues.filter(issue =>
        issue.title.toLowerCase().includes(searchTerm) ||
        issue.id.toLowerCase().includes(searchTerm) ||
        issue.description.toLowerCase().includes(searchTerm) ||
        issue.reportedBy.toLowerCase().includes(searchTerm) ||
        issue.equipment.toLowerCase().includes(searchTerm)
    );
    displayIssues();
}

function filterIssues() {
    const statusFilter = document.getElementById('statusFilter').value;
    const priorityFilter = document.getElementById('priorityFilter').value;
    const typeFilter = document.getElementById('typeFilter').value;
    const dateFilter = document.getElementById('dateFilter').value;
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    
    filteredIssues = reportedIssues.filter(issue => {
        const matchesStatus = !statusFilter || issue.status === statusFilter;
        const matchesPriority = !priorityFilter || issue.priority === priorityFilter;
        const matchesType = !typeFilter || issue.type === typeFilter;
        const matchesDate = !dateFilter || issue.reportedDate === dateFilter;
        const matchesSearch = !searchTerm || 
            issue.title.toLowerCase().includes(searchTerm) ||
            issue.id.toLowerCase().includes(searchTerm) ||
            issue.description.toLowerCase().includes(searchTerm) ||
            issue.reportedBy.toLowerCase().includes(searchTerm) ||
            issue.equipment.toLowerCase().includes(searchTerm);
        
        return matchesStatus && matchesPriority && matchesType && matchesDate && matchesSearch;
    });
    
    displayIssues();
}

function viewMyIssues() {
    filteredIssues = reportedIssues.filter(issue => issue.reportedBy === currentUser.username);
    displayIssues();
    showNotification('Showing your reported issues only', 'info');
}

function viewAllIssues() {
    if (currentUser.role !== 'supervisor' && currentUser.role !== 'admin') {
        alert('⚠️ Access Denied\n\nOnly supervisors can view all issues.');
        return;
    }
    
    filteredIssues = [...reportedIssues];
    displayIssues();
    showNotification('Showing all reported issues', 'info');
}

// Quick Report Functions
function quickReport(type, priority) {
    document.getElementById('modalTitle').textContent = `Quick Report - ${type.charAt(0).toUpperCase() + type.slice(1)} Issue`;
    document.getElementById('issueForm').reset();
    document.getElementById('issueType').value = type;
    document.getElementById('priority').value = priority;
    document.getElementById('issueModal').style.display = 'block';
}

// Modal Functions
function openNewIssueModal() {
    document.getElementById('modalTitle').textContent = 'Report New Issue';
    document.getElementById('issueForm').reset();
    document.getElementById('issueModal').style.display = 'block';
}

function editIssue(issueId) {
    const issue = reportedIssues.find(i => i.id === issueId);
    if (!issue) return;
    
    // Check if user can edit this issue
    const canEdit = currentUser.role === 'supervisor' || currentUser.role === 'admin' || 
                   issue.reportedBy === currentUser.username;
    
    if (!canEdit) {
        alert('⚠️ Access Denied\n\nYou can only edit your own reported issues.');
        return;
    }
    
    if (issue.status !== 'open') {
        alert('⚠️ Cannot Edit\n\nOnly open issues can be edited.');
        return;
    }
    
    document.getElementById('modalTitle').textContent = 'Edit Issue Report';
    document.getElementById('issueTitle').value = issue.title;
    document.getElementById('issueType').value = issue.type;
    document.getElementById('priority').value = issue.priority;
    document.getElementById('location').value = issue.location;
    document.getElementById('equipment').value = issue.equipment;
    document.getElementById('description').value = issue.description;
    document.getElementById('stepsToReproduce').value = issue.stepsToReproduce || '';
    document.getElementById('impact').value = issue.impact || '';
    document.getElementById('urgency').value = issue.urgency;
    document.getElementById('department').value = issue.department;
    
    // Store the issue ID for updating
    document.getElementById('issueForm').dataset.editingId = issueId;
    document.getElementById('issueModal').style.display = 'block';
}

function viewIssue(issueId) {
    const issue = reportedIssues.find(i => i.id === issueId);
    if (!issue) return;
    
    currentIssueId = issueId;
    
    const details = document.getElementById('issueDetails');
    details.innerHTML = `
        <div class="detail-group">
            <label>Issue ID:</label>
            <p>${issue.id}</p>
        </div>
        <div class="detail-group">
            <label>Title:</label>
            <p>${issue.title}</p>
        </div>
        <div class="detail-group">
            <label>Type:</label>
            <p><span class="type-badge ${issue.type}">${issue.type}</span></p>
        </div>
        <div class="detail-group">
            <label>Priority:</label>
            <p><span class="priority-badge ${issue.priority}">${issue.priority}</span></p>
        </div>
        <div class="detail-group">
            <label>Status:</label>
            <p><span class="status-badge ${issue.status}">${issue.status.replace('_', ' ')}</span></p>
        </div>
        <div class="detail-group">
            <label>Location:</label>
            <p>${issue.location}</p>
        </div>
        <div class="detail-group">
            <label>Equipment/Asset:</label>
            <p>${issue.equipment}</p>
        </div>
        <div class="detail-group">
            <label>Description:</label>
            <p>${issue.description}</p>
        </div>
        ${issue.stepsToReproduce ? `
            <div class="detail-group">
                <label>Steps to Reproduce:</label>
                <p>${issue.stepsToReproduce}</p>
            </div>
        ` : ''}
        ${issue.impact ? `
            <div class="detail-group">
                <label>Impact:</label>
                <p>${issue.impact}</p>
            </div>
        ` : ''}
        <div class="detail-group">
            <label>Urgency:</label>
            <p>${issue.urgency}</p>
        </div>
        <div class="detail-group">
            <label>Department:</label>
            <p>${issue.department}</p>
        </div>
        <div class="detail-group">
            <label>Reported By:</label>
            <p>${formatUsername(issue.reportedBy)}</p>
        </div>
        <div class="detail-group">
            <label>Reported Date:</label>
            <p>${formatDate(issue.reportedDate)}</p>
        </div>
        ${issue.assignedTo ? `
            <div class="detail-group">
                <label>Assigned To:</label>
                <p>${formatUsername(issue.assignedTo)}</p>
            </div>
        ` : ''}
        ${issue.resolvedDate ? `
            <div class="detail-group">
                <label>Resolved Date:</label>
                <p>${formatDate(issue.resolvedDate)}</p>
            </div>
        ` : ''}
        ${issue.resolution ? `
            <div class="detail-group">
                <label>Resolution:</label>
                <p>${issue.resolution}</p>
            </div>
        ` : ''}
    `;
    
    // Show admin actions for supervisors
    const adminActions = document.getElementById('adminActions');
    if ((currentUser.role === 'supervisor' || currentUser.role === 'admin') && issue.status !== 'closed') {
        adminActions.style.display = 'flex';
    } else {
        adminActions.style.display = 'none';
    }
    
    document.getElementById('viewModal').style.display = 'block';
}

function updateIssueStatusQuick(issueId, newStatus) {
    if (currentUser.role !== 'supervisor' && currentUser.role !== 'admin') {
        alert('⚠️ Access Denied\n\nOnly supervisors can update issue status.');
        return;
    }
    
    const issue = reportedIssues.find(i => i.id === issueId);
    if (!issue) return;
    
    const statusText = newStatus.replace('_', ' ');
    const confirmMessage = `Are you sure you want to mark issue "${issue.title}" as ${statusText}?`;
    
    if (confirm(confirmMessage)) {
        issue.status = newStatus;
        if (newStatus === 'in_progress') {
            issue.assignedTo = currentUser.username;
        } else if (newStatus === 'resolved') {
            issue.resolvedDate = new Date().toISOString().split('T')[0];
            const resolution = prompt('Please provide resolution details:');
            if (resolution) {
                issue.resolution = resolution;
            }
        }
        
        filteredIssues = [...reportedIssues];
        displayIssues();
        updateStatistics();
        showNotification(`Issue marked as ${statusText}`, 'success');
    }
}

function updateIssueStatus(newStatus) {
    if (!currentIssueId) return;
    
    const issue = reportedIssues.find(i => i.id === currentIssueId);
    if (!issue) return;
    
    if (newStatus === 'resolved') {
        const resolution = prompt('Please provide resolution details:');
        if (resolution === null) return; // User cancelled
        issue.resolution = resolution;
        issue.resolvedDate = new Date().toISOString().split('T')[0];
    }
    
    issue.status = newStatus;
    if (newStatus === 'in_progress') {
        issue.assignedTo = currentUser.username;
    }
    
    filteredIssues = [...reportedIssues];
    displayIssues();
    updateStatistics();
    closeViewModal();
    
    const statusText = newStatus.replace('_', ' ');
    showNotification(`Issue marked as ${statusText}`, 'success');
}

function closeModal() {
    document.getElementById('issueModal').style.display = 'none';
    document.getElementById('issueForm').removeAttribute('data-editing-id');
}

function closeViewModal() {
    document.getElementById('viewModal').style.display = 'none';
    currentIssueId = null;
}

function closeConfirmModal() {
    document.getElementById('confirmModal').style.display = 'none';
}

function setupFormSubmission() {
    document.getElementById('issueForm').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const formData = new FormData(this);
        const issueData = {
            title: formData.get('issueTitle'),
            type: formData.get('issueType'),
            priority: formData.get('priority'),
            location: formData.get('location'),
            equipment: formData.get('equipment') || 'N/A',
            description: formData.get('description'),
            stepsToReproduce: formData.get('stepsToReproduce') || null,
            impact: formData.get('impact') || null,
            urgency: formData.get('urgency'),
            department: formData.get('department'),
            status: 'open',
            reportedBy: currentUser.username,
            reportedDate: new Date().toISOString().split('T')[0],
            assignedTo: null,
            resolvedDate: null,
            resolution: null
        };
        
        // Validate business rules
        if (!validateIssueData(issueData)) {
            return;
        }
        
        const editingId = this.dataset.editingId;
        
        if (editingId) {
            // Update existing issue
            const issueIndex = reportedIssues.findIndex(issue => issue.id === editingId);
            if (issueIndex !== -1) {
                reportedIssues[issueIndex] = { ...reportedIssues[issueIndex], ...issueData };
                showNotification('Issue updated successfully', 'success');
            }
        } else {
            // Add new issue
            issueData.id = generateIssueId();
            reportedIssues.push(issueData);
            showNotification('Issue reported successfully', 'success');
        }
        
        filteredIssues = [...reportedIssues];
        displayIssues();
        updateStatistics();
        closeModal();
    });
}

function validateIssueData(issueData) {
    // Business rule: Description must be meaningful
    if (issueData.description.trim().length < 20) {
        alert('⚠️ Validation Error\n\nPlease provide a more detailed description (at least 20 characters).');
        return false;
    }
    
    // Business rule: Critical issues must have impact assessment
    if (issueData.priority === 'critical' && (!issueData.impact || issueData.impact.trim().length < 10)) {
        alert('⚠️ Validation Error\n\nCritical issues must include a detailed impact assessment.');
        return false;
    }
    
    // Business rule: Safety issues should be high priority or critical
    if (issueData.type === 'safety' && issueData.priority === 'low') {
        const confirmLowPriority = confirm('⚠️ Priority Warning\n\nSafety issues are typically high priority or critical. Are you sure this is low priority?');
        if (!confirmLowPriority) {
            return false;
        }
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
                searchIssues();
            } else {
                // Debounced search
                clearTimeout(this.searchTimeout);
                this.searchTimeout = setTimeout(searchIssues, 300);
            }
        });
    }
});

// Close modals when clicking outside
window.addEventListener('click', function(e) {
    const issueModal = document.getElementById('issueModal');
    const viewModal = document.getElementById('viewModal');
    const confirmModal = document.getElementById('confirmModal');
    
    if (e.target === issueModal) {
        closeModal();
    }
    
    if (e.target === viewModal) {
        closeViewModal();
    }
    
    if (e.target === confirmModal) {
        closeConfirmModal();
    }
});
