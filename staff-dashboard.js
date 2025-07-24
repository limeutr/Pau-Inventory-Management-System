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

// Alert Details Modal Functions
function showAlertDetails(alertType) {
    const modal = document.getElementById('alertDetailsModal');
    const modalIcon = document.getElementById('modalAlertIcon');
    const modalTitle = document.getElementById('modalAlertTitle');
    const modalSeverity = document.getElementById('modalAlertSeverity');
    const modalDescription = document.getElementById('modalAlertDescription');
    const modalCurrentStock = document.getElementById('modalCurrentStock');
    const modalMinStock = document.getElementById('modalMinStock');
    const modalShortage = document.getElementById('modalShortage');
    const modalSupplier = document.getElementById('modalSupplier');
    
    // Configure modal content based on alert type
    if (alertType === 'flour-critical') {
        modalIcon.textContent = '🔴';
        modalTitle.textContent = 'Critical Flour Stock Alert';
        modalSeverity.textContent = 'URGENT';
        modalSeverity.className = 'severity-badge urgent';
        modalDescription.textContent = 'All Purpose Flour stock has reached critically low levels and requires immediate attention. Current production orders are at risk of being delayed or cancelled without immediate restocking.';
        modalCurrentStock.textContent = '15 kg';
        modalMinStock.textContent = '50 kg';
        modalShortage.textContent = '35 kg (70% below minimum)';
        modalSupplier.textContent = 'Golden Wheat Co.';
    }
    
    // Show modal with animation
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden'; // Prevent background scrolling
    
    // Add event listener for ESC key
    document.addEventListener('keydown', handleModalEscKey);
}

function closeAlertModal() {
    const modal = document.getElementById('alertDetailsModal');
    modal.style.display = 'none';
    document.body.style.overflow = 'auto'; // Restore scrolling
    
    // Remove ESC key listener
    document.removeEventListener('keydown', handleModalEscKey);
}

function handleModalEscKey(event) {
    if (event.key === 'Escape') {
        closeAlertModal();
    }
}

// Action functions for modal buttons
function contactSupplier() {
    alert('Contacting Golden Wheat Co...\n\nPhone: (555) 123-4567\nEmail: orders@goldenwheat.com\n\nRequest: Emergency flour delivery (50kg minimum)\nEstimated delivery: 2-4 hours');
    
    // Mark action as completed
    markActionCompleted('contact-supplier');
}

function notifySupervisor() {
    alert('Supervisor notification sent!\n\nMessage: Critical flour shortage detected\nAction required: Approve emergency supplier contact\nStatus: Pending supervisor response');
    
    // Mark action as completed
    markActionCompleted('notify-supervisor');
}

function updateProduction() {
    alert('Production schedule updated!\n\nAdjustments made:\n• Reduced Classic Pau production from 60 to 30 units\n• Prioritized high-margin items\n• Estimated flour conservation: 15kg\n\nNew production timeline available in Production Tracking.');
    
    // Mark action as completed
    markActionCompleted('update-production');
}

function markActionCompleted(actionType) {
    // Find and check the corresponding checkbox in the modal
    const checkboxes = document.querySelectorAll('.action-checkbox');
    checkboxes.forEach(checkbox => {
        const actionText = checkbox.parentNode.querySelector('.action-text strong').textContent.toLowerCase();
        
        if ((actionType === 'contact-supplier' && actionText.includes('contact')) ||
            (actionType === 'notify-supervisor' && actionText.includes('notify')) ||
            (actionType === 'update-production' && actionText.includes('adjust'))) {
            checkbox.checked = true;
            checkbox.parentNode.style.opacity = '0.7';
        }
    });
}

// Functions for Char Siew warning alert buttons
function contactFillingCo() {
    // Show detailed contact information and options
    const contactInfo = `
🏢 FILLING CO. - EMERGENCY CONTACT

📞 Phone: (555) 789-0123
📧 Email: urgent@fillingco.com
📱 WhatsApp: +1-555-789-0123

⏰ URGENT REQUEST:
• Product: Char Siew (BBQ Pork Filling)
• Current Stock: 3 kg
• Required: Minimum 8 kg (emergency order: 15 kg)
• Delivery Timeline: Same day if ordered before 2 PM

💰 PRICING:
• Regular price: $12/kg
• Rush delivery fee: +$25
• Estimated total: $205 (15kg + rush fee)

📋 NEXT STEPS:
1. Call now to place emergency order
2. Confirm delivery time and cost
3. Update inventory system with expected delivery
4. Adjust production schedule accordingly

Would you like to:
- Copy phone number to clipboard?
- Send automated email request?
- View supplier order history?
    `;
    
    if (confirm(contactInfo + "\n\nClick OK to call Filling Co. now, or Cancel to take other actions.")) {
        // Simulate calling the supplier
        alert("📞 Calling Filling Co...\n\n✅ Call connected!\n📝 Order placed: 15kg Char Siew\n⏰ Delivery confirmed: Today 4:30 PM\n💰 Total cost: $205 (including rush fee)\n\n📋 Action logged in system.\n🔔 Supervisor has been notified.");
        
        // Update the alert to show it's been handled
        updateAlertStatus('char-siew-warning', 'contacted');
        
        // Log the action
        logStaffAction('contacted_filling_co', 'Emergency Char Siew order placed - 15kg delivery at 4:30 PM');
    }
}

function updateProductionPlan() {
    // Show the production plan modal
    const modal = document.getElementById('productionPlanModal');
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    
    // Setup option selection listeners
    setupProductionOptionListeners();
    
    // Add event listener for ESC key
    document.addEventListener('keydown', handleProductionModalEscKey);
}

function setupProductionOptionListeners() {
    const radioButtons = document.querySelectorAll('input[name="productionOption"]');
    const previewSection = document.getElementById('productionPreview');
    const previewContent = document.getElementById('previewContent');
    const applyBtn = document.getElementById('applyBtn');
    
    radioButtons.forEach(radio => {
        radio.addEventListener('change', function() {
            if (this.checked) {
                showProductionPreview(this.value);
                previewSection.style.display = 'block';
                applyBtn.disabled = false;
            }
        });
    });
}

function showProductionPreview(option) {
    const previewContent = document.getElementById('previewContent');
    let content = '';
    
    switch(option) {
        case 'reduce':
            content = `
                <p><strong>📉 Production Reduction Plan</strong></p>
                <table class="preview-table">
                    <thead>
                        <tr>
                            <th>Product</th>
                            <th>Current Plan</th>
                            <th>New Plan</th>
                            <th>Change</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>Classic Pau</td>
                            <td>60 units</td>
                            <td>60 units</td>
                            <td><span class="preview-change unchanged">No change</span></td>
                        </tr>
                        <tr>
                            <td>Char Siew Pau</td>
                            <td>40 units</td>
                            <td>15 units</td>
                            <td><span class="preview-change decrease">-25 units</span></td>
                        </tr>
                        <tr>
                            <td>Lotus Bao</td>
                            <td>24 units</td>
                            <td>24 units</td>
                            <td><span class="preview-change unchanged">No change</span></td>
                        </tr>
                    </tbody>
                </table>
                <p><strong>Impact:</strong> Char Siew savings: 5 kg | Revenue impact: -$112.50</p>
            `;
            break;
            
        case 'substitute':
            content = `
                <p><strong>🔄 Product Substitution Plan</strong></p>
                <table class="preview-table">
                    <thead>
                        <tr>
                            <th>Product</th>
                            <th>Current Plan</th>
                            <th>New Plan</th>
                            <th>Change</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>Classic Pau</td>
                            <td>60 units</td>
                            <td>60 units</td>
                            <td><span class="preview-change unchanged">No change</span></td>
                        </tr>
                        <tr>
                            <td>Char Siew Pau</td>
                            <td>40 units</td>
                            <td>15 units</td>
                            <td><span class="preview-change decrease">-25 units</span></td>
                        </tr>
                        <tr>
                            <td>Red Bean Pau</td>
                            <td>0 units</td>
                            <td>15 units</td>
                            <td><span class="preview-change increase">+15 units</span></td>
                        </tr>
                        <tr>
                            <td>Vegetarian Bao</td>
                            <td>0 units</td>
                            <td>10 units</td>
                            <td><span class="preview-change increase">+10 units</span></td>
                        </tr>
                        <tr>
                            <td>Lotus Bao</td>
                            <td>24 units</td>
                            <td>24 units</td>
                            <td><span class="preview-change unchanged">No change</span></td>
                        </tr>
                    </tbody>
                </table>
                <p><strong>Impact:</strong> Revenue maintained | Customer satisfaction: High (popular alternatives)</p>
            `;
            break;
            
        case 'delay':
            content = `
                <p><strong>⏰ Production Delay Plan</strong></p>
                <table class="preview-table">
                    <thead>
                        <tr>
                            <th>Product</th>
                            <th>Today</th>
                            <th>Tomorrow</th>
                            <th>Notes</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>Classic Pau</td>
                            <td>60 units</td>
                            <td>60 units</td>
                            <td>No change</td>
                        </tr>
                        <tr>
                            <td>Char Siew Pau</td>
                            <td>20 units</td>
                            <td>40 units</td>
                            <td>+20 carried over</td>
                        </tr>
                        <tr>
                            <td>Lotus Bao</td>
                            <td>24 units</td>
                            <td>24 units</td>
                            <td>No change</td>
                        </tr>
                    </tbody>
                </table>
                <p><strong>Impact:</strong> Emergency delivery expected 4:30 PM | Customer notifications required</p>
            `;
            break;
    }
    
    previewContent.innerHTML = content;
}

function applyProductionPlan() {
    const selectedOption = document.querySelector('input[name="productionOption"]:checked');
    
    if (!selectedOption) {
        alert('Please select an option first.');
        return;
    }
    
    const option = selectedOption.value;
    let message = '';
    
    switch(option) {
        case 'reduce':
            message = "✅ PRODUCTION PLAN UPDATED - Reduction Strategy\n\n📉 Char Siew Pau reduced from 40 to 15 units\n💾 Char Siew savings: 5 kg\n📝 Updated production schedule:\n  - Classic Pau: 60 units (unchanged)\n  - Char Siew Pau: 15 units (-25)\n  - Lotus Bao: 24 units (unchanged)\n\n🔔 Team has been notified of changes.\n📊 Customer service informed of reduced availability.";
            updateAlertStatus('char-siew-warning', 'production-reduced');
            logStaffAction('reduced_production', 'Reduced Char Siew Pau production by 25 units to conserve filling');
            break;
            
        case 'substitute':
            message = "✅ PRODUCTION PLAN UPDATED - Substitution Strategy\n\n🔄 Product substitution implemented:\n  - Char Siew Pau: 15 units (-25)\n  - Red Bean Pau: +15 units\n  - Vegetarian Bao: +10 units\n\n💰 Revenue impact: Minimal (substituted products have similar margins)\n📊 Customer satisfaction: High (popular alternatives)\n🔔 Sales team notified of product availability changes.";
            updateAlertStatus('char-siew-warning', 'products-substituted');
            logStaffAction('substituted_products', 'Replaced 25 Char Siew Pau with Red Bean Pau and Vegetarian Bao');
            break;
            
        case 'delay':
            message = "✅ PRODUCTION PLAN UPDATED - Delay Strategy\n\n⏰ Production delayed:\n  - Today: 20 Char Siew Pau only\n  - Tomorrow: +20 Char Siew Pau added to schedule\n\n📦 Emergency delivery expected: 4:30 PM today\n🔄 Full production resumes tomorrow\n📞 Customers with advance orders have been contacted.";
            updateAlertStatus('char-siew-warning', 'production-delayed');
            logStaffAction('delayed_production', 'Delayed 20 Char Siew Pau to tomorrow pending emergency delivery');
            break;
    }
    
    alert(message);
    closeProductionPlanModal();
}

function closeProductionPlanModal() {
    const modal = document.getElementById('productionPlanModal');
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
    
    // Reset form
    const radioButtons = document.querySelectorAll('input[name="productionOption"]');
    radioButtons.forEach(radio => radio.checked = false);
    
    const previewSection = document.getElementById('productionPreview');
    previewSection.style.display = 'none';
    
    const applyBtn = document.getElementById('applyBtn');
    applyBtn.disabled = true;
    
    // Remove ESC key listener
    document.removeEventListener('keydown', handleProductionModalEscKey);
}

function handleProductionModalEscKey(event) {
    if (event.key === 'Escape') {
        closeProductionPlanModal();
    }
}

// Helper functions for alert management
function updateAlertStatus(alertId, status) {
    // Find the alert element and update its visual status
    const alerts = document.querySelectorAll('.alert-item');
    alerts.forEach(alert => {
        if (alert.querySelector('h3').textContent.includes('Char Siew')) {
            // Add a status indicator
            const statusIndicator = document.createElement('div');
            statusIndicator.className = 'alert-status-indicator';
            statusIndicator.innerHTML = `<span class="status-badge resolved">✅ ${status.replace('-', ' ').toUpperCase()}</span>`;
            
            // Remove existing status indicator if any
            const existing = alert.querySelector('.alert-status-indicator');
            if (existing) existing.remove();
            
            // Add new status
            alert.querySelector('.alert-content').appendChild(statusIndicator);
            
            // Update alert styling
            alert.style.opacity = '0.8';
            alert.style.borderLeft = '4px solid #4CAF50';
        }
    });
}

function logStaffAction(actionType, description) {
    // Log the action with timestamp
    const timestamp = new Date().toLocaleString();
    const logEntry = {
        timestamp: timestamp,
        staff: sessionStorage.getItem('username') || 'Staff Member',
        action: actionType,
        description: description,
        alertId: 'char-siew-warning'
    };
    
    // Store in session storage (in a real app, this would go to a database)
    let actionLog = JSON.parse(sessionStorage.getItem('staffActionLog') || '[]');
    actionLog.push(logEntry);
    sessionStorage.setItem('staffActionLog', JSON.stringify(actionLog));
    
    console.log('Staff Action Logged:', logEntry);
}
