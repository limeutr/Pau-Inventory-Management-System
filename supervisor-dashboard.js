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
    
    if (userRole !== 'supervisor') {
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

function openIngredientManagement() {
    // Redirect to the ingredient management page
    window.location.href = 'ingredient-management.html';
}

function openProductionTracking() {
    // Redirect to the production tracking page
    window.location.href = 'production-tracking.html';
}

function openWastageLogging() {
    // Redirect to the wastage logging page
    window.location.href = 'wastage-logging.html';
}

function openSalesOverview() {
    // Redirect to the sales overview page
    window.location.href = 'sales-overview.html';
}

function openStaffManagement() {
    alert('Staff Management System\n\nFeatures coming soon:\n- Add/Edit staff accounts\n- Role and permission management\n- Work schedule management\n- Performance tracking\n- Training records\n- Payroll integration');
}

function generateReport() {
    // Redirect to the report generation page
    window.location.href = 'report-generation.html';
}

function openSettings() {
    alert('System Settings\n\nConfiguration options:\n- Alert thresholds\n- Notification preferences\n- User permissions\n- Backup settings\n- Integration settings\n- Security preferences');
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
