// Supervisor Dashboard functionality
document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in and has supervisor role
    checkAuthAndRole();
    
    // Setup logout functionality
    setupLogout();
    
    // Update welcome message
    updateWelcomeMessage();
    
    // Initialize dashboard data
    initializeDashboardData();
});

function checkAuthAndRole() {
    const isLoggedIn = sessionStorage.getItem('isLoggedIn');
    const userRole = sessionStorage.getItem('userRole');
    
    if (!isLoggedIn || isLoggedIn !== 'true') {
        // Redirect to login page if not logged in
        window.location.href = 'index.html';
        return;
    }
    
    if (userRole !== 'supervisor' && userRole !== 'admin') {
        // Redirect to appropriate dashboard based on role
        if (userRole === 'staff') {
            window.location.href = 'staff-dashboard.html';
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
    const username = sessionStorage.getItem('username') || 'Supervisor';
    const welcomeMessage = document.getElementById('welcomeMessage');
    
    // Capitalize first letter
    const displayName = username.charAt(0).toUpperCase() + username.slice(1);
    welcomeMessage.textContent = `Welcome, ${displayName}!`;
}

function initializeDashboardData() {
    // Simulate real-time data updates
    updateKPIData();
    updateStockAlerts();
    setupChartInteractions();
}

function updateKPIData() {
    // Simulate dynamic KPI updates
    const kpiData = {
        revenue: { value: 125450, trend: 12.5 },
        profit: { value: 28900, trend: 8.3 },
        wastage: { value: 2150, trend: -15.2 },
        efficiency: { value: 87.5, trend: 3.1 }
    };
    
    // Add animation to KPI cards
    const kpiCards = document.querySelectorAll('.kpi-card');
    kpiCards.forEach((card, index) => {
        card.style.animationDelay = `${index * 0.1}s`;
        card.classList.add('animate-in');
    });
}

function updateStockAlerts() {
    // Add real-time stock monitoring
    const alertItems = document.querySelectorAll('.alert-item');
    alertItems.forEach(item => {
        item.addEventListener('click', function() {
            const productName = this.querySelector('strong').textContent;
            showAlertDetails(productName);
        });
    });
}

function setupChartInteractions() {
    // Add hover effects to chart bars
    const bars = document.querySelectorAll('.bar');
    bars.forEach(bar => {
        bar.addEventListener('mouseenter', function() {
            this.style.transform = 'scaleY(1.05)';
        });
        
        bar.addEventListener('mouseleave', function() {
            this.style.transform = 'scaleY(1)';
        });
        
        bar.addEventListener('click', function() {
            const value = this.getAttribute('data-value');
            showSalesDetails(value);
        });
    });
}

function showAlertDetails(productName) {
    alert(`Stock Alert Details for ${productName}\n\nThis feature will show:\n- Current stock levels\n- Reorder recommendations\n- Supplier information\n- Historical usage patterns`);
}

function showSalesDetails(value) {
    alert(`Sales Details for ${value}\n\nThis feature will show:\n- Daily breakdown\n- Product categories\n- Customer demographics\n- Profit margins`);
}

// Management tool functions
function openInventoryManagement() {
    // Redirect to the inventory management page
    window.location.href = 'inventory-management.html';
}

function openProductionTracking() {
    // Redirect to the production tracking page
    window.location.href = 'production-tracking.html';
}

function openWastageLogging() {
    // Redirect to the wastage logging page
    window.location.href = 'wastage-logging.html';
}

function openSalesAnalytics() {
    // Redirect to the sales analytics page
    window.location.href = 'sales-analytics.html';
}

function openSupplyRequest() {
    // Redirect to the supply request page
    window.location.href = 'supply-request.html';
}

function openStaffManagement() {
    // Redirect to the staff management page
    window.location.href = 'staff-management.html';
}

function openReportIssue() {
    // Redirect to the report issue page
    window.location.href = 'report-issue.html';
}

function generateReport() {
    // Redirect to the report generation page
    window.location.href = 'report-generation.html';
}

function openSettings() {
    // Redirect to the system settings page
    window.location.href = 'system-settings.html';
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInUp {
        from {
            opacity: 0;
            transform: translateY(20px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    
    .animate-in {
        animation: slideInUp 0.6s ease-out forwards;
    }
    
    .kpi-card {
        opacity: 0;
    }
    
    .kpi-card.animate-in {
        opacity: 1;
    }
`;
document.head.appendChild(style);

// Chart bar click functionality
function showChartDetails(barElement) {
    const month = barElement.getAttribute('data-month');
    const amount = barElement.getAttribute('data-value');
    const growth = barElement.getAttribute('data-growth');
    
    // Get additional details based on the month
    const monthDetails = getMonthDetails(month);
    
    // Update modal content
    document.getElementById('modalMonth').textContent = month;
    document.getElementById('modalAmount').textContent = amount;
    document.getElementById('modalGrowth').textContent = growth;
    document.getElementById('modalProducts').textContent = monthDetails.topProducts;
    document.getElementById('modalSource').textContent = monthDetails.revenueSource;
    
    // Show modal
    document.getElementById('chartModal').style.display = 'block';
}

function getMonthDetails(month) {
    const details = {
        'January': {
            topProducts: 'Classic Pau (45%), Char Siew Pau (32%)',
            revenueSource: 'Factory Sales (68%), Outlet Sales (32%)'
        },
        'February': {
            topProducts: 'Nai Wong Bao (38%), Red Bean Pau (35%)',
            revenueSource: 'Factory Sales (72%), Outlet Sales (28%)'
        },
        'March': {
            topProducts: 'Char Siew Pau (42%), Vegetarian Bao (31%)',
            revenueSource: 'Factory Sales (65%), Outlet Sales (35%)'
        },
        'April': {
            topProducts: 'Classic Pau (48%), Lotus Bao (29%)',
            revenueSource: 'Factory Sales (70%), Outlet Sales (30%)'
        },
        'May': {
            topProducts: 'Nai Wong Bao (44%), Char Siew Pau (36%)',
            revenueSource: 'Factory Sales (75%), Outlet Sales (25%)'
        },
        'June': {
            topProducts: 'Red Bean Pau (41%), Classic Pau (33%)',
            revenueSource: 'Factory Sales (68%), Outlet Sales (32%)'
        }
    };
    
    return details[month] || {
        topProducts: 'Mixed Products',
        revenueSource: 'Combined Sales'
    };
}

function closeChartModal() {
    document.getElementById('chartModal').style.display = 'none';
}

function viewDetailedReport() {
    // Navigate to detailed analytics page
    window.location.href = 'sales-analytics.html';
}

// Close modal when clicking outside of it
window.addEventListener('click', function(event) {
    const modal = document.getElementById('chartModal');
    if (event.target === modal) {
        closeChartModal();
    }
});

// Add CSS for modal and clickable bars
const modalStyle = document.createElement('style');
modalStyle.textContent = `
    .modal {
        display: none;
        position: fixed;
        z-index: 1000;
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.5);
        animation: fadeIn 0.3s ease-out;
    }

    .modal-content {
        background-color: #fefefe;
        margin: 5% auto;
        padding: 0;
        border: none;
        border-radius: 12px;
        width: 90%;
        max-width: 500px;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
        animation: slideDown 0.3s ease-out;
    }

    .modal-header {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 20px;
        border-radius: 12px 12px 0 0;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .modal-header h3 {
        margin: 0;
        font-size: 1.3em;
        font-weight: 600;
    }

    .close-btn {
        background: none;
        border: none;
        color: white;
        font-size: 1.5em;
        cursor: pointer;
        padding: 0;
        width: 30px;
        height: 30px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        transition: background-color 0.2s;
    }

    .close-btn:hover {
        background-color: rgba(255, 255, 255, 0.2);
    }

    .modal-body {
        padding: 25px;
    }

    .chart-details {
        margin-bottom: 25px;
    }

    .detail-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 15px;
        padding: 12px;
        background-color: #f8f9fa;
        border-radius: 8px;
        border-left: 4px solid #667eea;
    }

    .detail-item label {
        font-weight: 600;
        color: #333;
        font-size: 0.95em;
    }

    .detail-item span {
        font-weight: 500;
        color: #555;
        text-align: right;
        flex: 1;
        margin-left: 15px;
    }

    .modal-actions {
        display: flex;
        gap: 12px;
        justify-content: flex-end;
    }

    .detail-btn, .close-detail-btn {
        padding: 10px 20px;
        border: none;
        border-radius: 6px;
        cursor: pointer;
        font-weight: 500;
        font-size: 0.95em;
        transition: all 0.2s;
    }

    .detail-btn {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
    }

    .detail-btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
    }

    .close-detail-btn {
        background-color: #e9ecef;
        color: #495057;
    }

    .close-detail-btn:hover {
        background-color: #dee2e6;
    }

    .clickable-bar {
        cursor: pointer;
        transition: all 0.2s ease;
        position: relative;
    }

    .clickable-bar:hover {
        transform: scale(1.05);
        box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
        z-index: 10;
    }

    .clickable-bar:active {
        transform: scale(0.98);
    }

    @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
    }

    @keyframes slideDown {
        from {
            opacity: 0;
            transform: translateY(-30px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
`;
document.head.appendChild(modalStyle);

// Real-time data simulation
setInterval(function() {
    // Simulate real-time updates (in a real app, this would fetch from an API)
    const now = new Date();
    const timeString = now.toLocaleTimeString();
    
    // Update a subtle indicator that data is live
    const header = document.querySelector('.logo span');
    if (header) {
        header.setAttribute('title', `Last updated: ${timeString}`);
    }
}, 30000); // Update every 30 seconds

// Alert Lists Modal Functions

// Stock Alerts Modal
function showStockAlertsModal() {
    document.getElementById('stockAlertsModal').style.display = 'block';
}

function closeStockAlertsModal() {
    document.getElementById('stockAlertsModal').style.display = 'none';
}

// Top Products Modal
function showTopProductsModal() {
    document.getElementById('topProductsModal').style.display = 'block';
}

function closeTopProductsModal() {
    document.getElementById('topProductsModal').style.display = 'none';
}

// KPI Modal
function showKpiModal(type) {
    const modal = document.getElementById('kpiModal');
    const title = document.getElementById('kpiModalTitle');
    const content = document.getElementById('kpiDetailsContent');
    
    let modalData = {};
    
    switch(type) {
        case 'revenue':
            modalData = {
                title: '💰 Revenue Details',
                content: `
                    <div class="kpi-breakdown">
                        <h4>Revenue Breakdown - Current Month</h4>
                        <div class="breakdown-item">
                            <label>Factory Sales:</label>
                            <span>$85,200 (68%)</span>
                        </div>
                        <div class="breakdown-item">
                            <label>Outlet Sales:</label>
                            <span>$40,250 (32%)</span>
                        </div>
                        <div class="breakdown-item">
                            <label>Total Revenue:</label>
                            <span class="highlight">$125,450</span>
                        </div>
                        <div class="breakdown-item">
                            <label>Monthly Growth:</label>
                            <span class="positive">+12.5% (+$13,950)</span>
                        </div>
                        <div class="breakdown-item">
                            <label>Daily Average:</label>
                            <span>$4,180</span>
                        </div>
                        <div class="breakdown-item">
                            <label>Peak Day:</label>
                            <span>July 15 - $6,750</span>
                        </div>
                        <div class="breakdown-item">
                            <label>Projected End-of-Month:</label>
                            <span>$138,200</span>
                        </div>
                    </div>
                `
            };
            break;
        case 'profit':
            modalData = {
                title: '📈 Profit Analysis',
                content: `
                    <div class="kpi-breakdown">
                        <h4>Profit Analysis - Current Month</h4>
                        <div class="breakdown-item">
                            <label>Gross Revenue:</label>
                            <span>$125,450</span>
                        </div>
                        <div class="breakdown-item">
                            <label>Total Costs:</label>
                            <span>$96,550</span>
                        </div>
                        <div class="breakdown-item">
                            <label>Net Profit:</label>
                            <span class="highlight">$28,900</span>
                        </div>
                        <div class="breakdown-item">
                            <label>Profit Margin:</label>
                            <span>23.0%</span>
                        </div>
                        <div class="breakdown-item">
                            <label>Monthly Growth:</label>
                            <span class="positive">+8.3% (+$2,210)</span>
                        </div>
                        <div class="cost-breakdown">
                            <h5>Cost Breakdown:</h5>
                            <div class="breakdown-item small">
                                <label>Raw Materials:</label>
                                <span>$58,200 (60.3%)</span>
                            </div>
                            <div class="breakdown-item small">
                                <label>Labor:</label>
                                <span>$24,100 (25.0%)</span>
                            </div>
                            <div class="breakdown-item small">
                                <label>Utilities:</label>
                                <span>$8,950 (9.3%)</span>
                            </div>
                            <div class="breakdown-item small">
                                <label>Other:</label>
                                <span>$5,300 (5.4%)</span>
                            </div>
                        </div>
                    </div>
                `
            };
            break;
        case 'wastage':
            modalData = {
                title: '🗑️ Wastage Analysis',
                content: `
                    <div class="kpi-breakdown">
                        <h4>Wastage Analysis - Current Month</h4>
                        <div class="breakdown-item">
                            <label>Total Wastage:</label>
                            <span class="highlight">$3,240</span>
                        </div>
                        <div class="breakdown-item">
                            <label>Wastage Rate:</label>
                            <span>2.6% of total production</span>
                        </div>
                        <div class="breakdown-item">
                            <label>Monthly Change:</label>
                            <span class="negative">+5.2% (+$160)</span>
                        </div>
                        <div class="breakdown-item">
                            <label>Target Wastage Rate:</label>
                            <span>2.0%</span>
                        </div>
                        <div class="wastage-breakdown">
                            <h5>Wastage by Category:</h5>
                            <div class="breakdown-item small">
                                <label>Expired Ingredients:</label>
                                <span>$1,450 (44.8%)</span>
                            </div>
                            <div class="breakdown-item small">
                                <label>Production Defects:</label>
                                <span>$890 (27.5%)</span>
                            </div>
                            <div class="breakdown-item small">
                                <label>Overproduction:</label>
                                <span>$650 (20.1%)</span>
                            </div>
                            <div class="breakdown-item small">
                                <label>Damaged Goods:</label>
                                <span>$250 (7.6%)</span>
                            </div>
                        </div>
                        <div class="recommendations">
                            <h5>💡 Recommendations:</h5>
                            <p>• Improve inventory rotation (FIFO)</p>
                            <p>• Enhanced quality control</p>
                            <p>• Better demand forecasting</p>
                        </div>
                    </div>
                `
            };
            break;
        case 'efficiency':
            modalData = {
                title: '⚡ Efficiency Analysis',
                content: `
                    <div class="kpi-breakdown">
                        <h4>Production Efficiency - Current Month</h4>
                        <div class="breakdown-item">
                            <label>Overall Efficiency:</label>
                            <span class="highlight">87.5%</span>
                        </div>
                        <div class="breakdown-item">
                            <label>Target Efficiency:</label>
                            <span>85.0%</span>
                        </div>
                        <div class="breakdown-item">
                            <label>Monthly Change:</label>
                            <span class="positive">+3.1% (+2.6 points)</span>
                        </div>
                        <div class="breakdown-item">
                            <label>Production Output:</label>
                            <span>15,240 PAU units</span>
                        </div>
                        <div class="breakdown-item">
                            <label>Target Output:</label>
                            <span>17,400 PAU units</span>
                        </div>
                        <div class="efficiency-breakdown">
                            <h5>Efficiency by Process:</h5>
                            <div class="breakdown-item small">
                                <label>Dough Preparation:</label>
                                <span>92.3% (Excellent)</span>
                            </div>
                            <div class="breakdown-item small">
                                <label>Filling Preparation:</label>
                                <span>89.1% (Good)</span>
                            </div>
                            <div class="breakdown-item small">
                                <label>Assembly Line:</label>
                                <span>85.7% (Good)</span>
                            </div>
                            <div class="breakdown-item small">
                                <label>Steaming Process:</label>
                                <span>83.2% (Needs Improvement)</span>
                            </div>
                            <div class="breakdown-item small">
                                <label>Packaging:</label>
                                <span>91.8% (Excellent)</span>
                            </div>
                        </div>
                        <div class="shift-breakdown">
                            <h5>Efficiency by Shift:</h5>
                            <div class="breakdown-item small">
                                <label>Morning Shift (6AM-2PM):</label>
                                <span>89.4% (Best)</span>
                            </div>
                            <div class="breakdown-item small">
                                <label>Afternoon Shift (2PM-10PM):</label>
                                <span>87.1% (Good)</span>
                            </div>
                            <div class="breakdown-item small">
                                <label>Night Shift (10PM-6AM):</label>
                                <span>85.9% (Needs Focus)</span>
                            </div>
                        </div>
                        <div class="recommendations">
                            <h5>💡 Improvement Areas:</h5>
                            <p>• Optimize steaming cycle timing</p>
                            <p>• Additional training for night shift</p>
                            <p>• Upgrade steaming equipment</p>
                            <p>• Implement lean manufacturing practices</p>
                        </div>
                    </div>
                `
            };
            break;
        default:
            modalData = {
                title: '📊 Performance Details',
                content: '<p>No data available</p>'
            };
    }
    
    title.textContent = modalData.title;
    content.innerHTML = modalData.content;
    modal.style.display = 'block';
}

function closeKpiModal() {
    document.getElementById('kpiModal').style.display = 'none';
}

// Close modals when clicking outside
window.addEventListener('click', function(event) {
    const stockModal = document.getElementById('stockAlertsModal');
    const productsModal = document.getElementById('topProductsModal');
    const kpiModal = document.getElementById('kpiModal');
    const chartModal = document.getElementById('chartModal');
    
    if (event.target === stockModal) {
        closeStockAlertsModal();
    }
    
    if (event.target === productsModal) {
        closeTopProductsModal();
    }
    
    if (event.target === kpiModal) {
        closeKpiModal();
    }
    
    if (event.target === chartModal) {
        closeChartModal();
    }
});

// Add CSS styles for the new modals
const modalStyles = document.createElement('style');
modalStyles.textContent = `
    .expand-btn {
        background: none;
        border: 1px solid #ddd;
        border-radius: 50%;
        width: 24px;
        height: 24px;
        cursor: pointer;
        font-size: 12px;
        margin-left: 8px;
        transition: all 0.2s ease;
    }
    
    .expand-btn:hover {
        background: #667eea;
        color: white;
        border-color: #667eea;
    }
    
    .alert-modal-header {
        background: linear-gradient(135deg, #ff4757 0%, #ff3838 100%);
        color: white;
    }
    
    .products-modal-header {
        background: linear-gradient(135deg, #2ed573 0%, #1e90ff 100%);
        color: white;
    }
    
    .kpi-modal-header {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
    }
    
    .alert-details, .products-details, .kpi-breakdown {
        max-height: 60vh;
        overflow-y: auto;
        padding: 10px 0;
    }
    
    .alert-section, .product-detail-section {
        margin-bottom: 25px;
        border-left: 4px solid #ddd;
        padding-left: 15px;
    }
    
    .critical-section {
        border-left-color: #ff4757;
    }
    
    .warning-section {
        border-left-color: #ffa502;
    }
    
    .expiring-section {
        border-left-color: #ff6b6b;
    }
    
    .detailed-alert-item, .product-detail-item {
        background: #f8f9fa;
        border-radius: 8px;
        padding: 15px;
        margin: 10px 0;
        transition: all 0.2s ease;
    }
    
    .product-detail-item:hover {
        background: #e9ecef;
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }
    
    .urgency {
        color: #dc3545;
        font-weight: bold;
        margin-top: 8px;
    }
    
    .notice {
        color: #fd7e14;
        font-weight: 500;
        margin-top: 8px;
    }
    
    .action {
        color: #28a745;
        font-weight: 500;
        margin-top: 8px;
    }
    
    .rank-badge {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        border-radius: 50%;
        width: 40px;
        height: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: bold;
        font-size: 1.1em;
        margin-right: 15px;
    }
    
    .rank-1 .rank-badge {
        background: linear-gradient(135deg, #f39c12 0%, #f1c40f 100%);
    }
    
    .rank-2 .rank-badge {
        background: linear-gradient(135deg, #95a5a6 0%, #bdc3c7 100%);
    }
    
    .rank-3 .rank-badge {
        background: linear-gradient(135deg, #d35400 0%, #e67e22 100%);
    }
    
    .product-detail-item {
        display: flex;
        align-items: center;
    }
    
    .product-stats p {
        margin: 5px 0;
        font-size: 0.9em;
    }
    
    .breakdown-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 10px 0;
        border-bottom: 1px solid #eee;
    }
    
    .breakdown-item.small {
        padding: 5px 0;
        font-size: 0.9em;
        margin-left: 20px;
    }
    
    .breakdown-item label {
        font-weight: 500;
        color: #333;
    }
    
    .breakdown-item span {
        font-weight: 600;
    }
    
    .breakdown-item .highlight {
        color: #667eea;
        font-size: 1.1em;
    }
    
    .breakdown-item .positive {
        color: #28a745;
    }
    
    .breakdown-item .negative {
        color: #dc3545;
    }
    
    .cost-breakdown, .wastage-breakdown, .recommendations {
        margin-top: 20px;
        padding-top: 15px;
        border-top: 2px solid #eee;
    }
    
    .recommendations p {
        margin: 5px 0;
        color: #555;
        font-size: 0.9em;
    }
    
    .action-btn {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        border: none;
        padding: 10px 20px;
        border-radius: 6px;
        cursor: pointer;
        font-weight: 500;
        transition: all 0.2s ease;
    }
    
    .action-btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
    }
    
    .close-btn-modal {
        background: #e9ecef;
        color: #495057;
        border: none;
        padding: 10px 20px;
        border-radius: 6px;
        cursor: pointer;
        font-weight: 500;
        transition: all 0.2s ease;
    }
    
    .close-btn-modal:hover {
        background: #dee2e6;
    }
`;
document.head.appendChild(modalStyles);
