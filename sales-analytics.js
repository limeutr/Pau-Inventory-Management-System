// PAU Inventory Management System - Sales & Analytics Module
let currentUser = {};
let salesData = {};
let charts = {};

// Sample data for demonstration
const SAMPLE_SALES_DATA = {
    monthly: [
        { month: 'Jan 2025', revenue: 98500, units: 6420, orders: 892, avgOrder: 110.43, growth: 8.5 },
        { month: 'Feb 2025', revenue: 105200, units: 6850, orders: 945, avgOrder: 111.32, growth: 6.8 },
        { month: 'Mar 2025', revenue: 112800, units: 7320, orders: 1015, avgOrder: 111.13, growth: 7.2 },
        { month: 'Apr 2025', revenue: 119600, units: 7680, orders: 1098, avgOrder: 108.93, growth: 6.0 },
        { month: 'May 2025', revenue: 125400, units: 8140, orders: 1187, avgOrder: 105.65, growth: 4.8 },
        { month: 'Jun 2025', revenue: 133200, units: 8590, orders: 1254, avgOrder: 106.22, growth: 6.2 },
        { month: 'Jul 2025', revenue: 125450, units: 8432, orders: 1254, avgOrder: 100.04, growth: -5.8 }
    ],
    products: [
        { name: 'Classic Bread', revenue: 45200, units: 2890, growth: 12.5, percentage: 36 },
        { name: 'Chocolate Croissant', revenue: 32100, units: 1456, growth: 8.7, percentage: 26 },
        { name: 'Blueberry Muffin', revenue: 18900, units: 945, growth: 15.2, percentage: 15 },
        { name: 'Vanilla Cake', revenue: 15600, units: 612, growth: -3.2, percentage: 12 },
        { name: 'Cinnamon Roll', revenue: 13650, units: 529, growth: 6.8, percentage: 11 }
    ],
    locations: [
        { name: 'Main Outlet', revenue: 78500, percentage: 62.6 },
        { name: 'University Campus', revenue: 31200, percentage: 24.8 },
        { name: 'City Center', revenue: 15750, percentage: 12.6 }
    ]
};

// Initialize the analytics module
document.addEventListener('DOMContentLoaded', function() {
    checkAuthenticationAndRole();
    initializeAnalytics();
});

function checkAuthenticationAndRole() {
    const isLoggedIn = sessionStorage.getItem('isLoggedIn');
    const userRole = sessionStorage.getItem('userRole');
    const username = sessionStorage.getItem('username');
    
    if (!isLoggedIn || isLoggedIn !== 'true') {
        alert('Please log in to access sales analytics.');
        window.location.href = 'index.html';
        return;
    }
    
    if (userRole !== 'supervisor' && userRole !== 'admin') {
        alert('Access denied. Only supervisors and administrators can access sales analytics.');
        if (userRole === 'staff') {
            window.location.href = 'staff-dashboard.html';
        } else {
            window.location.href = 'index.html';
        }
        return;
    }
    
    currentUser = {
        username: username,
        role: userRole,
        isLoggedIn: true
    };
    
    // Update UI with user information
    document.getElementById('welcomeMessage').textContent = `Welcome, ${currentUser.username}!`;
    document.getElementById('userRoleBadge').textContent = currentUser.role.charAt(0).toUpperCase() + currentUser.role.slice(1);
    
    // Setup logout functionality
    setupLogout();
}

function setupLogout() {
    document.getElementById('logoutBtn').addEventListener('click', function() {
        if (confirm('Are you sure you want to logout?')) {
            sessionStorage.removeItem('isLoggedIn');
            sessionStorage.removeItem('userRole');
            sessionStorage.removeItem('username');
            window.location.href = 'index.html';
        }
    });
}

function initializeAnalytics() {
    showLoading(true);
    
    // Load sales data
    loadSalesData();
    
    // Initialize charts
    setTimeout(() => {
        initializeCharts();
        populateAnalyticsTables();
        generateInsights();
        showLoading(false);
    }, 1500);
}

function loadSalesData() {
    // In a real application, this would fetch data from an API
    salesData = SAMPLE_SALES_DATA;
    
    // Update current metrics
    updateCurrentMetrics();
}

function updateCurrentMetrics() {
    const currentMonth = salesData.monthly[salesData.monthly.length - 1];
    
    document.getElementById('totalRevenue').textContent = `$${currentMonth.revenue.toLocaleString()}`;
    document.getElementById('unitsSold').textContent = currentMonth.units.toLocaleString();
    document.getElementById('totalOrders').textContent = currentMonth.orders.toLocaleString();
    document.getElementById('avgOrderValue').textContent = `$${currentMonth.avgOrder.toFixed(2)}`;
    
    // Update change indicators
    document.getElementById('revenueChange').textContent = `+12.5%`;
    document.getElementById('unitsChange').textContent = `+8.7%`;
    document.getElementById('ordersChange').textContent = `+15.2%`;
    document.getElementById('avgOrderChange').textContent = `-2.1%`;
}

function initializeCharts() {
    // Initialize Monthly Sales Trend Chart
    initializeSalesTrendChart();
    
    // Initialize Product Performance Chart
    initializeProductChart();
    
    // Initialize Location Chart
    initializeLocationChart();
    
    // Initialize Forecast Chart
    initializeForecastChart();
}

function initializeSalesTrendChart() {
    const ctx = document.getElementById('salesTrendChart').getContext('2d');
    
    charts.salesTrend = new Chart(ctx, {
        type: 'line',
        data: {
            labels: salesData.monthly.map(item => item.month),
            datasets: [{
                label: 'Revenue ($)',
                data: salesData.monthly.map(item => item.revenue),
                borderColor: '#667eea',
                backgroundColor: 'rgba(102, 126, 234, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return '$' + value.toLocaleString();
                        }
                    }
                }
            }
        }
    });
}

function initializeProductChart() {
    const ctx = document.getElementById('productChart').getContext('2d');
    
    charts.product = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: salesData.products.map(item => item.name),
            datasets: [{
                data: salesData.products.map(item => item.percentage),
                backgroundColor: [
                    '#667eea',
                    '#764ba2',
                    '#f093fb',
                    '#f5576c',
                    '#4facfe'
                ],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 20,
                        usePointStyle: true
                    }
                }
            }
        }
    });
}

function initializeLocationChart() {
    const ctx = document.getElementById('locationChart').getContext('2d');
    
    charts.location = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: salesData.locations.map(item => item.name),
            datasets: [{
                label: 'Revenue',
                data: salesData.locations.map(item => item.revenue),
                backgroundColor: ['#667eea', '#764ba2', '#f093fb'],
                borderRadius: 8,
                borderSkipped: false
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return '$' + value.toLocaleString();
                        }
                    }
                }
            }
        }
    });
}

function initializeForecastChart() {
    const ctx = document.getElementById('forecastChart').getContext('2d');
    
    // Generate forecast data
    const forecastData = generateForecastData();
    
    charts.forecast = new Chart(ctx, {
        type: 'line',
        data: {
            labels: forecastData.labels,
            datasets: [
                {
                    label: 'Historical Revenue',
                    data: forecastData.historical,
                    borderColor: '#667eea',
                    backgroundColor: 'rgba(102, 126, 234, 0.1)',
                    borderWidth: 3,
                    fill: false
                },
                {
                    label: 'Projected Revenue',
                    data: forecastData.projected,
                    borderColor: '#f5576c',
                    backgroundColor: 'rgba(245, 87, 108, 0.1)',
                    borderWidth: 3,
                    borderDash: [5, 5],
                    fill: false
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top'
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return '$' + value.toLocaleString();
                        }
                    }
                }
            }
        }
    });
}

function generateForecastData() {
    const months = ['Jul 2025', 'Aug 2025', 'Sep 2025', 'Oct 2025', 'Nov 2025', 'Dec 2025'];
    const historical = [119600, 125400, 133200, 125450, null, null];
    const projected = [null, null, null, 125450, 132000, 138500];
    
    return {
        labels: months,
        historical: historical,
        projected: projected
    };
}

function populateAnalyticsTables() {
    // Populate monthly breakdown table
    const tableBody = document.getElementById('monthlyTableBody');
    tableBody.innerHTML = '';
    
    salesData.monthly.forEach(month => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><strong>${month.month}</strong></td>
            <td>$${month.revenue.toLocaleString()}</td>
            <td>${month.units.toLocaleString()}</td>
            <td>${month.orders.toLocaleString()}</td>
            <td>$${month.avgOrder.toFixed(2)}</td>
            <td class="${month.growth >= 0 ? 'positive' : 'negative'}">${month.growth >= 0 ? '+' : ''}${month.growth}%</td>
        `;
        tableBody.appendChild(row);
    });
    
    // Populate product performance list
    const productList = document.getElementById('productPerformanceList');
    productList.innerHTML = '';
    
    salesData.products.forEach((product, index) => {
        const productItem = document.createElement('div');
        productItem.className = 'product-item';
        productItem.innerHTML = `
            <div class="product-info">
                <h4>#${index + 1} ${product.name}</h4>
                <p>${product.units.toLocaleString()} units sold</p>
            </div>
            <div class="product-metrics">
                <div class="product-revenue">$${product.revenue.toLocaleString()}</div>
                <div class="product-growth ${product.growth >= 0 ? 'positive' : 'negative'}">${product.growth >= 0 ? '+' : ''}${product.growth}%</div>
            </div>
        `;
        productList.appendChild(productItem);
    });
}

function generateInsights() {
    const insights = [
        {
            title: "Strong Product Performance",
            text: "Classic Bread continues to be the top performer with 36% of total revenue and 12.5% growth this quarter."
        },
        {
            title: "Seasonal Trend Alert",
            text: "July showed a 5.8% decline in revenue, typical for summer months. Consider summer-specific promotions."
        },
        {
            title: "Order Value Opportunity",
            text: "Average order value decreased by 2.1%. Bundle deals could help increase customer spend per visit."
        },
        {
            title: "Location Performance",
            text: "Main Outlet generates 62.6% of revenue. Consider expanding successful strategies to other locations."
        }
    ];
    
    const insightsList = document.getElementById('salesInsights');
    insightsList.innerHTML = '';
    
    insights.forEach(insight => {
        const insightItem = document.createElement('div');
        insightItem.className = 'insight-item';
        insightItem.innerHTML = `
            <h4>${insight.title}</h4>
            <p>${insight.text}</p>
        `;
        insightsList.appendChild(insightItem);
    });
}

// Chart control functions
function showSalesChart(type) {
    // Update active button
    document.querySelectorAll('.chart-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    
    // Update chart data based on type
    let data, label, color;
    
    switch (type) {
        case 'revenue':
            data = salesData.monthly.map(item => item.revenue);
            label = 'Revenue ($)';
            color = '#667eea';
            break;
        case 'units':
            data = salesData.monthly.map(item => item.units);
            label = 'Units Sold';
            color = '#4facfe';
            break;
        case 'orders':
            data = salesData.monthly.map(item => item.orders);
            label = 'Total Orders';
            color = '#f5576c';
            break;
    }
    
    charts.salesTrend.data.datasets[0] = {
        label: label,
        data: data,
        borderColor: color,
        backgroundColor: color + '20',
        borderWidth: 3,
        fill: true,
        tension: 0.4
    };
    
    charts.salesTrend.update();
}

// Update functions
function updateAnalytics() {
    const dateRange = document.getElementById('dateRange').value;
    showLoading(true);
    
    // Simulate API call
    setTimeout(() => {
        // In a real application, this would fetch new data based on date range
        showNotification(`Analytics updated for ${dateRange} days`, 'info');
        showLoading(false);
    }, 1000);
}

function updateForecast() {
    const period = document.getElementById('forecastPeriod').value;
    
    // Update forecast metrics based on period
    let projectedRevenue, expectedGrowth;
    
    switch (period) {
        case '30':
            projectedRevenue = '$142,300';
            expectedGrowth = '+13.4%';
            break;
        case '90':
            projectedRevenue = '$387,500';
            expectedGrowth = '+18.5%';
            break;
        case '180':
            projectedRevenue = '$785,200';
            expectedGrowth = '+22.1%';
            break;
    }
    
    document.getElementById('projectedRevenue').textContent = projectedRevenue;
    document.getElementById('expectedGrowth').textContent = expectedGrowth;
    
    showNotification(`Forecast updated for ${period} days`, 'info');
}

// Export functions
function exportAnalytics() {
    showNotification('Exporting complete analytics report...', 'info');
    
    // Simulate export process
    setTimeout(() => {
        const data = generateExportData();
        downloadCSV(data, 'sales-analytics-report.csv');
        showNotification('Analytics report exported successfully!', 'success');
    }, 1500);
}

function exportMonthlyData() {
    const data = salesData.monthly.map(month => ({
        Month: month.month,
        Revenue: month.revenue,
        Units: month.units,
        Orders: month.orders,
        'Average Order': month.avgOrder,
        'Growth %': month.growth
    }));
    
    downloadCSV(data, 'monthly-sales-data.csv');
    showNotification('Monthly data exported successfully!', 'success');
}

function exportProductData() {
    const data = salesData.products.map((product, index) => ({
        Rank: index + 1,
        Product: product.name,
        Revenue: product.revenue,
        Units: product.units,
        'Growth %': product.growth,
        'Market Share %': product.percentage
    }));
    
    downloadCSV(data, 'product-performance-data.csv');
    showNotification('Product data exported successfully!', 'success');
}

function generateExportData() {
    return {
        summary: {
            'Total Revenue': '$125,450',
            'Total Units': '8,432',
            'Total Orders': '1,254',
            'Average Order Value': '$100.04'
        },
        monthly: salesData.monthly,
        products: salesData.products,
        locations: salesData.locations
    };
}

function downloadCSV(data, filename) {
    if (Array.isArray(data)) {
        const csv = convertToCSV(data);
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.setAttribute('hidden', '');
        a.setAttribute('href', url);
        a.setAttribute('download', filename);
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }
}

function convertToCSV(data) {
    if (data.length === 0) return '';
    
    const headers = Object.keys(data[0]).join(',');
    const rows = data.map(row => Object.values(row).join(','));
    
    return [headers, ...rows].join('\n');
}

// Utility functions
function printReport() {
    showNotification('Preparing report for printing...', 'info');
    
    setTimeout(() => {
        window.print();
    }, 500);
}

function refreshData() {
    showLoading(true);
    
    setTimeout(() => {
        loadSalesData();
        updateCurrentMetrics();
        
        // Update all charts
        Object.values(charts).forEach(chart => {
            if (chart && typeof chart.update === 'function') {
                chart.update();
            }
        });
        
        populateAnalyticsTables();
        generateInsights();
        showLoading(false);
        showNotification('Data refreshed successfully!', 'success');
    }, 2000);
}

function showLoading(show) {
    const overlay = document.getElementById('loadingOverlay');
    overlay.style.display = show ? 'flex' : 'none';
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#f44336' : '#2196F3'};
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
        z-index: 1001;
        animation: slideInRight 0.3s ease-out;
        max-width: 300px;
    `;
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

// Navigation function
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

// Add notification animation styles
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
    
    .positive {
        color: #4CAF50 !important;
    }
    
    .negative {
        color: #f44336 !important;
    }
`;
document.head.appendChild(style);

console.log('PAU Sales & Analytics module loaded successfully');
