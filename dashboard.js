// Dashboard functionality
document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in
    checkLoginStatus();
    
    // Setup logout functionality
    setupLogout();
    
    // Update welcome message
    updateWelcomeMessage();
});

function checkLoginStatus() {
    const isLoggedIn = sessionStorage.getItem('isLoggedIn');
    
    if (!isLoggedIn || isLoggedIn !== 'true') {
        // Redirect to login page if not logged in
        window.location.href = 'index.html';
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
            
            // Redirect to login page
            window.location.href = 'index.html';
        }
    });
}

function updateWelcomeMessage() {
    const username = sessionStorage.getItem('username') || 'Admin';
    const welcomeMessage = document.getElementById('welcomeMessage');
    
    // Capitalize first letter
    const displayName = username.charAt(0).toUpperCase() + username.slice(1);
    welcomeMessage.textContent = `Welcome, ${displayName}!`;
}

// Simulate some data updates (for future expansion)
function updateStats() {
    // This function can be expanded later to fetch real data
    const stats = {
        totalItems: 0,
        categories: 0,
        lowStock: 0,
        totalValue: 0
    };
    
    // Update stat numbers in the UI
    const statNumbers = document.querySelectorAll('.stat-number');
    statNumbers[0].textContent = stats.totalItems;
    statNumbers[1].textContent = stats.categories;
    statNumbers[2].textContent = stats.lowStock;
    statNumbers[3].textContent = `$${stats.totalValue}`;
}

// Initialize stats
updateStats();
