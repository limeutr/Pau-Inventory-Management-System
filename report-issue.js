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
            title: 'PAU Steamer Temperature Inconsistency',
            type: 'equipment',
            priority: 'high',
            status: 'open',
            reportedBy: 'chen_weiming',
            reportedDate: today.toISOString().split('T')[0],
            location: 'factory',
            equipment: 'PAU Steamer',
            description: 'Main PAU steamer temperature fluctuating between 95°C and 105°C instead of maintaining steady 100°C. Affecting Classic Pau and Char Siew Pau quality.',
            stepsToReproduce: '1. Set steamer to 100°C\n2. Load PAU batch\n3. Monitor temperature during 15-minute steam cycle\n4. Observe temperature variations',
            impact: 'Inconsistent PAU texture and cooking. Some PAU undercooked, others overcooked. Customer complaints about quality.',
            urgency: 'high',
            department: 'pau_production',
            assignedTo: null,
            resolvedDate: null,
            resolution: null
        },
        {
            id: 'ISS002',
            title: 'Contaminated Red Bean Paste Batch',
            type: 'quality',
            priority: 'critical',
            status: 'in_progress',
            reportedBy: 'maria_santos',
            reportedDate: yesterday.toISOString().split('T')[0],
            location: 'filling',
            equipment: 'Red Bean Paste',
            description: 'Foreign material (metal fragment) found in Red Bean Paste batch from Filling Co. Entire batch quarantined. Affects Red Bean Pau production.',
            stepsToReproduce: 'N/A - Quality control detection during inspection',
            impact: 'Critical food safety issue. Red Bean Pau production halted. Potential customer safety risk if not caught.',
            urgency: 'critical',
            department: 'quality_control',
            assignedTo: 'quality_team',
            resolvedDate: null,
            resolution: null
        },
        {
            id: 'ISS003',
            title: 'Golden Wheat Co. Flour Delivery Delay',
            type: 'supplier',
            priority: 'high',
            status: 'open',
            reportedBy: 'kumar_raj',
            reportedDate: today.toISOString().split('T')[0],
            location: 'storage',
            equipment: 'All Purpose Flour',
            description: 'Golden Wheat Co. failed to deliver scheduled All Purpose Flour order. Current stock down to 15kg, below minimum 50kg threshold.',
            stepsToReproduce: 'Check delivery schedule and current flour inventory',
            impact: 'Risk of production shutdown in 2-3 days if flour not replenished. All PAU varieties affected.',
            urgency: 'high',
            department: 'inventory_management',
            assignedTo: null,
            resolvedDate: null,
            resolution: null
        },
        {
            id: 'ISS004',
            title: 'Lotus Bao Filling Machine Malfunction',
            type: 'equipment',
            priority: 'medium',
            status: 'resolved',
            reportedBy: 'lim_huiling',
            reportedDate: '2025-07-20',
            location: 'filling',
            equipment: 'Filling Machine',
            description: 'Lotus Seed Paste filling machine dispensing incorrect portions. Some Lotus Bao overfilled, others underfilled.',
            stepsToReproduce: '1. Load Lotus Seed Paste into machine\n2. Set portion to standard size\n3. Run 10 test fills\n4. Observe portion inconsistencies',
            impact: 'Inconsistent Lotus Bao quality and portion costs. Customer dissatisfaction with varying sizes.',
            urgency: 'medium',
            department: 'filling_preparation',
            assignedTo: 'maintenance_team',
            resolvedDate: '2025-07-21',
            resolution: 'Calibrated filling machine dispensing mechanism. Replaced worn sealing gaskets.'
        },
        {
            id: 'ISS005',
            title: 'Downtown Branch Display Steamer Broken',
            type: 'equipment',
            priority: 'high',
            status: 'open',
            reportedBy: 'sarah_lee',
            reportedDate: today.toISOString().split('T')[0],
            location: 'downtown_branch',
            equipment: 'PAU Steamer',
            description: 'Display steamer at Downtown Branch not heating. PAU kept at room temperature, affecting freshness and customer appeal.',
            stepsToReproduce: 'Turn on display steamer and check heating elements',
            impact: 'PAU quality deteriorating quickly. Reduced sales due to poor presentation. Food safety concerns.',
            urgency: 'high',
            department: 'outlet_management',
            assignedTo: null,
            resolvedDate: null,
            resolution: null
        },
        {
            id: 'ISS006',
            title: 'Sweet Supply Ltd. Sugar Quality Issues',
            type: 'supplier',
            priority: 'medium',
            status: 'open',
            reportedBy: 'tan_ahhuat',
            reportedDate: '2025-07-21',
            location: 'factory',
            equipment: 'Sugar',
            description: 'Latest sugar delivery from Sweet Supply Ltd. has lumpy texture and off-color. Affecting dough consistency for all PAU varieties.',
            stepsToReproduce: 'Examine sugar batch #SS2025-07-18',
            impact: 'Dough mixing issues causing texture problems in Classic Pau and Nai Wong Bao. Production efficiency reduced.',
            urgency: 'medium',
            department: 'pau_production',
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
                ${(currentUser.role === 'supervisor' || currentUser.role === 'admin') && issue.status === 'open' ? `
                    <button onclick="updateIssueStatusQuick('${issue.id}', 'in_progress')" class="action-btn progress-btn">
                        Progress
                    </button>
                ` : ''}
                ${(currentUser.role === 'supervisor' || currentUser.role === 'admin') && issue.status === 'in_progress' ? `
                    <button onclick="updateIssueStatusQuick('${issue.id}', 'resolved')" class="action-btn resolve-btn">
                        Mark as Resolved
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
