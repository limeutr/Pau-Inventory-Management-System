// Staff Dashboard functionality
document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in and has staff role
    checkAuthAndRole();
    
    // Setup logout functionality
    setupLogout();
    
    // Update welcome message
    updateWelcomeMessage();
    
    // Initialize dashboard functionality
    initializeTaskManagement();
    initializeAlertSystem();
});

function checkAuthAndRole() {
    const isLoggedIn = sessionStorage.getItem('isLoggedIn');
    const userRole = sessionStorage.getItem('userRole');
    
    if (!isLoggedIn || isLoggedIn !== 'true') {
        // Redirect to login page if not logged in
        window.location.href = 'index.html';
        return;
    }
    
    if (userRole !== 'staff') {
        // Redirect to appropriate dashboard based on role
        if (userRole === 'supervisor') {
            window.location.href = 'supervisor-dashboard.html';
        } else {
            window.location.href = 'index.html';
        }
        return;
    }
}

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

// Function to handle dashboard navigation (refresh current dashboard)
function goToDashboard() {
    // For dashboard pages, simply refresh to return to top
    window.location.reload();
}

function updateWelcomeMessage() {
    const username = sessionStorage.getItem('username') || 'Staff';
    const welcomeMessage = document.getElementById('welcomeMessage');
    
    // Capitalize first letter
    const displayName = username.charAt(0).toUpperCase() + username.slice(1);
    welcomeMessage.textContent = `Welcome, ${displayName}!`;
}

function initializeTaskManagement() {
    // Setup task checkbox functionality
    const taskCheckboxes = document.querySelectorAll('.task-checkbox');
    
    taskCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            const taskItem = this.closest('.task-item');
            const taskInfo = taskItem.querySelector('.task-info h3');
            const progressFill = taskItem.querySelector('.progress-fill');
            const progressText = taskItem.querySelector('.task-progress span');
            
            if (this.checked) {
                taskItem.classList.add('completed');
                progressFill.style.width = '100%';
                progressText.textContent = 'Completed ✓';
                
                // Show completion animation
                showTaskCompletionMessage(taskInfo.textContent);
            } else {
                taskItem.classList.remove('completed');
                // Reset progress to original values
                resetTaskProgress(taskItem);
            }
        });
    });
    
    // Setup progress tracking
    trackTaskProgress();
}

function resetTaskProgress(taskItem) {
    const taskId = taskItem.querySelector('.task-checkbox').id;
    const progressFill = taskItem.querySelector('.progress-fill');
    const progressText = taskItem.querySelector('.task-progress span');
    
    // Reset to original values based on task ID
    const originalProgress = {
        'task1': { width: '30%', text: '15/50 completed' },
        'task2': { width: '0%', text: '0/30 completed' },
        'task3': { width: '100%', text: 'Completed ✓' },
        'task4': { width: '0%', text: '0/24 completed' }
    };
    
    if (originalProgress[taskId]) {
        progressFill.style.width = originalProgress[taskId].width;
        progressText.textContent = originalProgress[taskId].text;
    }
}

function trackTaskProgress() {
    // Simulate real-time progress updates
    setInterval(function() {
        const incompleteTasks = document.querySelectorAll('.task-item:not(.completed)');
        
        incompleteTasks.forEach(task => {
            const checkbox = task.querySelector('.task-checkbox');
            if (!checkbox.checked) {
                const progressFill = task.querySelector('.progress-fill');
                const currentWidth = parseInt(progressFill.style.width) || 0;
                
                // Randomly increase progress slightly (simulating work)
                if (Math.random() < 0.1 && currentWidth < 90) { // 10% chance to progress
                    const newWidth = Math.min(currentWidth + Math.random() * 10, 90);
                    progressFill.style.width = newWidth + '%';
                    
                    // Update progress text
                    updateProgressText(task, newWidth);
                }
            }
        });
    }, 30000); // Update every 30 seconds
}

function updateProgressText(taskItem, progressPercent) {
    const progressText = taskItem.querySelector('.task-progress span');
    const taskId = taskItem.querySelector('.task-checkbox').id;
    
    // Calculate completed items based on progress percentage
    const totalItems = {
        'task1': 50,
        'task2': 30,
        'task4': 24
    };
    
    if (totalItems[taskId]) {
        const completed = Math.floor((progressPercent / 100) * totalItems[taskId]);
        progressText.textContent = `${completed}/${totalItems[taskId]} completed`;
    }
}

function showTaskCompletionMessage(taskName) {
    // Create a temporary success message
    const message = document.createElement('div');
    message.className = 'completion-toast';
    message.innerHTML = `
        <div class="toast-content">
            <span class="toast-icon">✅</span>
            <span class="toast-text">Task completed: ${taskName}</span>
        </div>
    `;
    
    // Add styles
    message.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #4CAF50;
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 15px rgba(76, 175, 80, 0.3);
        z-index: 1000;
        animation: slideInRight 0.3s ease-out;
    `;
    
    document.body.appendChild(message);
    
    // Remove after 3 seconds
    setTimeout(() => {
        message.style.animation = 'slideOutRight 0.3s ease-in';
        setTimeout(() => {
            if (message.parentNode) {
                message.parentNode.removeChild(message);
            }
        }, 300);
    }, 3000);
}

function initializeAlertSystem() {
    // Setup alert button functionality
    const alertButtons = document.querySelectorAll('.alert-btn');
    
    alertButtons.forEach(button => {
        button.addEventListener('click', function() {
            const alertItem = this.closest('.alert-item');
            const alertTitle = alertItem.querySelector('h3').textContent;
            const actionType = this.textContent;
            
            handleAlertAction(alertTitle, actionType, alertItem);
        });
    });
}

function handleAlertAction(alertTitle, actionType, alertElement) {
    switch(actionType) {
        case 'Notify Supervisor':
            showNotificationSent();
            break;
        case 'Mark as Noted':
            markAlertAsHandled(alertElement);
            break;
        case 'Add to Tasks':
            addToTaskList(alertTitle);
            break;
        case 'Acknowledge':
            markAlertAsHandled(alertElement);
            break;
        case 'View Details':
            showAlertDetails(alertTitle);
            break;
        default:
            console.log(`Action: ${actionType} for alert: ${alertTitle}`);
    }
}

function showNotificationSent() {
    alert('✅ Notification sent to supervisor!\n\nYour supervisor has been notified about the critical flour stock level and will arrange for immediate reordering.');
}

function markAlertAsHandled(alertElement) {
    alertElement.style.opacity = '0.6';
    alertElement.style.transform = 'scale(0.98)';
    
    const actions = alertElement.querySelector('.alert-actions');
    actions.innerHTML = '<span style="color: #4CAF50; font-weight: 600;">✓ Handled</span>';
    
    // Remove the pulse animation if it exists
    alertElement.style.animation = 'none';
}

function addToTaskList(alertTitle) {
    alert(`📝 Task Added!\n\n"${alertTitle}" has been added to your task list for tomorrow's shift.`);
}

function showAlertDetails(alertTitle) {
    alert(`📋 Alert Details: ${alertTitle}\n\nDetailed information about this alert would be displayed here, including:\n- Historical data\n- Recommended actions\n- Related documentation\n- Contact information`);
}

// Quick Action Functions
function reportStockUsage() {
    // Redirect to production tracking page
    window.location.href = 'production-tracking.html';
}

function manageIngredients() {
    // Redirect to ingredient management page
    window.location.href = 'ingredient-management.html';
}

function logWastage() {
    // Redirect to wastage logging page
    window.location.href = 'wastage-logging.html';
}

function requestSupplies() {
    // Redirect to supply request page
    window.location.href = 'supply-request.html';
}

function viewRecipes() {
    // Allow staff to view inventory items (read-only)
    window.location.href = 'inventory-management.html';
}

function reportIssue() {
    // Redirect to report issue page
    window.location.href = 'report-issue.html';
}

// Add CSS animations for toasts and interactions
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
    
    .completion-toast .toast-content {
        display: flex;
        align-items: center;
        gap: 10px;
    }
    
    .completion-toast .toast-icon {
        font-size: 1.2em;
    }
`;
document.head.appendChild(style);

// Simulate real-time stock level updates
setInterval(function() {
    // Update stock levels slightly (simulating real-time consumption)
    const stockCards = document.querySelectorAll('.stock-card');
    
    stockCards.forEach(card => {
        const currentSpan = card.querySelector('.current');
        if (currentSpan && Math.random() < 0.05) { // 5% chance to update
            const currentText = currentSpan.textContent;
            const match = currentText.match(/(\d+)/);
            
            if (match) {
                const currentValue = parseInt(match[1]);
                const newValue = Math.max(0, currentValue - Math.floor(Math.random() * 2));
                currentSpan.textContent = currentText.replace(/\d+/, newValue);
                
                // Update status if needed
                updateStockStatus(card, newValue);
            }
        }
    });
}, 60000); // Update every minute

function updateStockStatus(card, currentValue) {
    const statusElement = card.querySelector('.stock-status');
    const h3 = card.querySelector('h3');
    
    // Define thresholds for different items
    const thresholds = {
        'Flour (All Purpose)': { low: 20, critical: 10 },
        'Sugar': { low: 15, critical: 5 },
        'Eggs': { low: 50, critical: 20 },
        'Butter': { low: 3, critical: 1 },
        'Milk (Fresh)': { low: 8, critical: 3 },
        'Blueberries': { low: 1, critical: 0.5 }
    };
    
    const itemName = h3.textContent;
    const threshold = thresholds[itemName];
    
    if (threshold) {
        if (currentValue <= threshold.critical) {
            statusElement.textContent = 'Critical';
            statusElement.className = 'stock-status low';
            card.className = 'stock-card critical';
        } else if (currentValue <= threshold.low) {
            statusElement.textContent = 'Low Stock';
            statusElement.className = 'stock-status low';
            card.className = 'stock-card adequate';
        } else {
            statusElement.textContent = 'Good';
            statusElement.className = 'stock-status good';
            card.className = 'stock-card good';
        }
    }
}
