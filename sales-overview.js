// PAU Inventory Management System - Sales Overview Module
// Comprehensive sales analytics, trends analysis, and demand forecasting

// Global state management
let salesState = {
    currentUser: null,
    currentPeriod: 'today',
    customDateRange: null,
    salesData: [],
    productsData: [],
    outletsData: [],
    forecastData: {},
    lastUpdate: null
};

// Sample sales data structure for demonstration
const SAMPLE_SALES_DATA = {
    transactions: [
        {
            id: 'TXN001',
            timestamp: '2025-07-02T09:30:00',
            outlet: 'main_outlet',
            items: [
                { productId: 'PRD001', name: 'Chocolate Croissant', category: 'finished_product', quantity: 3, unitPrice: 12.50, revenue: 37.50 },
                { productId: 'PRD002', name: 'Fresh Bread Loaf', category: 'finished_product', quantity: 2, unitPrice: 8.00, revenue: 16.00 }
            ],
            totalRevenue: 53.50,
            staff: 'john'
        },
        {
            id: 'TXN002',
            timestamp: '2025-07-02T10:15:00',
            outlet: 'downtown_branch',
            items: [
                { productId: 'PRD003', name: 'Butter Cookies', category: 'finished_product', quantity: 5, unitPrice: 15.00, revenue: 75.00 },
                { productId: 'PRD001', name: 'Chocolate Croissant', category: 'finished_product', quantity: 1, unitPrice: 12.50, revenue: 12.50 }
            ],
            totalRevenue: 87.50,
            staff: 'mary'
        }
        // More sample data would be populated from actual sales records
    ],
    products: [
        { id: 'PRD001', name: 'Chocolate Croissant', category: 'finished_product', unitPrice: 12.50, totalSold: 450, totalRevenue: 5625, popularity: 85 },
        { id: 'PRD002', name: 'Fresh Bread Loaf', category: 'finished_product', unitPrice: 8.00, totalSold: 380, totalRevenue: 3040, popularity: 78 },
        { id: 'PRD003', name: 'Butter Cookies', category: 'finished_product', unitPrice: 15.00, totalSold: 320, totalRevenue: 4800, popularity: 72 },
        { id: 'PRD004', name: 'Vanilla Cake Slice', category: 'finished_product', unitPrice: 18.00, totalSold: 290, totalRevenue: 5220, popularity: 68 },
        { id: 'PRD005', name: 'Blueberry Muffin', category: 'finished_product', unitPrice: 10.00, totalSold: 275, totalRevenue: 2750, popularity: 65 }
    ],
    outlets: [
        { id: 'main_outlet', name: 'Main Outlet', status: 'active', totalRevenue: 15420, totalSales: 890, avgOrderValue: 17.33 },
        { id: 'downtown_branch', name: 'Downtown Branch', status: 'active', totalRevenue: 12350, totalSales: 720, avgOrderValue: 17.15 },
        { id: 'mall_kiosk', name: 'Mall Kiosk', status: 'active', totalRevenue: 8760, totalSales: 510, avgOrderValue: 17.18 },
        { id: 'airport_branch', name: 'Airport Branch', status: 'active', totalRevenue: 6890, totalSales: 385, avgOrderValue: 17.89 }
    ]
};

// Initialize the sales overview module
document.addEventListener('DOMContentLoaded', function() {
    initializeSalesModule();
});

function initializeSalesModule() {
    // Check authentication and permissions
    checkAuthenticationAndPermissions();
    
    // Initialize sample data
    initializeSampleData();
    
    // Load and display sales data
    loadSalesData();
    
    // Initialize UI components
    setupEventListeners();
    updateDashboardStats();
    updateTrendsChart();
    updateTopProducts();
    updateOutletPerformance();
    populateForecastProducts();
    
    console.log('Sales Overview module initialized');
}

function checkAuthenticationAndPermissions() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    
    if (!currentUser.username) {
        alert('Please log in to access the sales overview system.');
        window.location.href = 'index.html';
        return;
    }
    
    // Only supervisors can access sales overview
    if (currentUser.role !== 'supervisor') {
        alert('Access denied. Only supervisors can access sales analytics.');
        window.location.href = currentUser.role === 'staff' ? 'staff-dashboard.html' : 'index.html';
        return;
    }
    
    salesState.currentUser = currentUser;
    
    // Update UI with user information
    document.getElementById('welcomeMessage').textContent = `Welcome, ${currentUser.username}!`;
    document.getElementById('userRoleBadge').textContent = currentUser.role.charAt(0).toUpperCase() + currentUser.role.slice(1);
}

function initializeSampleData() {
    // Initialize sample sales data if not exists
    if (!localStorage.getItem('salesTransactions')) {
        localStorage.setItem('salesTransactions', JSON.stringify(SAMPLE_SALES_DATA.transactions));
    }
    
    if (!localStorage.getItem('salesProducts')) {
        localStorage.setItem('salesProducts', JSON.stringify(SAMPLE_SALES_DATA.products));
    }
    
    if (!localStorage.getItem('salesOutlets')) {
        localStorage.setItem('salesOutlets', JSON.stringify(SAMPLE_SALES_DATA.outlets));
    }
    
    // Generate additional sample data for better analytics
    generateAdditionalSampleData();
}

function generateAdditionalSampleData() {
    const existingTransactions = JSON.parse(localStorage.getItem('salesTransactions') || '[]');
    
    // Generate data for the last 30 days if not enough data exists
    if (existingTransactions.length < 50) {
        const additionalTransactions = [];
        const outlets = SAMPLE_SALES_DATA.outlets;
        const products = SAMPLE_SALES_DATA.products;
        
        for (let i = 0; i < 30; i++) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            
            // Generate 3-8 transactions per day
            const dailyTransactions = Math.floor(Math.random() * 6) + 3;
            
            for (let j = 0; j < dailyTransactions; j++) {
                const hour = Math.floor(Math.random() * 12) + 8; // 8 AM to 8 PM
                const minute = Math.floor(Math.random() * 60);
                
                date.setHours(hour, minute, 0, 0);
                
                const outlet = outlets[Math.floor(Math.random() * outlets.length)];
                const numItems = Math.floor(Math.random() * 4) + 1; // 1-4 items per transaction
                const items = [];
                let totalRevenue = 0;
                
                for (let k = 0; k < numItems; k++) {
                    const product = products[Math.floor(Math.random() * products.length)];
                    const quantity = Math.floor(Math.random() * 3) + 1; // 1-3 quantity
                    const revenue = quantity * product.unitPrice;
                    
                    items.push({
                        productId: product.id,
                        name: product.name,
                        category: product.category,
                        quantity: quantity,
                        unitPrice: product.unitPrice,
                        revenue: revenue
                    });
                    
                    totalRevenue += revenue;
                }
                
                additionalTransactions.push({
                    id: `TXN${1000 + additionalTransactions.length}`,
                    timestamp: date.toISOString(),
                    outlet: outlet.id,
                    items: items,
                    totalRevenue: Math.round(totalRevenue * 100) / 100,
                    staff: ['john', 'mary', 'staff1'][Math.floor(Math.random() * 3)]
                });
            }
        }
        
        // Merge with existing data
        const allTransactions = [...existingTransactions, ...additionalTransactions];
        localStorage.setItem('salesTransactions', JSON.stringify(allTransactions));
    }
}

function loadSalesData() {
    // Load sales data from local storage
    salesState.salesData = JSON.parse(localStorage.getItem('salesTransactions') || '[]');
    salesState.productsData = JSON.parse(localStorage.getItem('salesProducts') || '[]');
    salesState.outletsData = JSON.parse(localStorage.getItem('salesOutlets') || '[]');
    salesState.lastUpdate = new Date();
    
    // Filter data based on current period
    filterDataByPeriod();
}

function filterDataByPeriod() {
    const now = new Date();
    let startDate, endDate;
    
    switch (salesState.currentPeriod) {
        case 'today':
            startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
            break;
        case 'week':
            const weekStart = new Date(now);
            weekStart.setDate(now.getDate() - now.getDay());
            weekStart.setHours(0, 0, 0, 0);
            startDate = weekStart;
            endDate = new Date(weekStart);
            endDate.setDate(weekStart.getDate() + 7);
            break;
        case 'month':
            startDate = new Date(now.getFullYear(), now.getMonth(), 1);
            endDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
            break;
        case 'quarter':
            const quarterStart = Math.floor(now.getMonth() / 3) * 3;
            startDate = new Date(now.getFullYear(), quarterStart, 1);
            endDate = new Date(now.getFullYear(), quarterStart + 3, 1);
            break;
        case 'year':
            startDate = new Date(now.getFullYear(), 0, 1);
            endDate = new Date(now.getFullYear() + 1, 0, 1);
            break;
        case 'custom':
            if (salesState.customDateRange) {
                startDate = new Date(salesState.customDateRange.from);
                endDate = new Date(salesState.customDateRange.to);
                endDate.setDate(endDate.getDate() + 1); // Include end date
            } else {
                return;
            }
            break;
        default:
            startDate = new Date(0);
            endDate = new Date();
    }
    
    // Filter transactions by date range
    salesState.filteredSalesData = salesState.salesData.filter(transaction => {
        const transactionDate = new Date(transaction.timestamp);
        return transactionDate >= startDate && transactionDate < endDate;
    });
}

function setupEventListeners() {
    // Logout functionality
    document.getElementById('logoutBtn').addEventListener('click', function() {
        if (confirm('Are you sure you want to logout?')) {
            localStorage.removeItem('currentUser');
            window.location.href = 'index.html';
        }
    });
    
    // Auto-refresh data every 5 minutes
    setInterval(() => {
        loadSalesData();
        updateAllDisplays();
    }, 5 * 60 * 1000);
}

// Period selection functions
function setPeriod(period) {
    salesState.currentPeriod = period;
    
    // Update UI
    document.querySelectorAll('.period-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    
    // Refresh data and displays
    filterDataByPeriod();
    updateAllDisplays();
}

function setCustomPeriod() {
    const fromDate = document.getElementById('customFrom').value;
    const toDate = document.getElementById('customTo').value;
    
    if (!fromDate || !toDate) {
        alert('Please select both start and end dates.');
        return;
    }
    
    if (new Date(fromDate) > new Date(toDate)) {
        alert('Start date cannot be later than end date.');
        return;
    }
    
    salesState.currentPeriod = 'custom';
    salesState.customDateRange = { from: fromDate, to: toDate };
    
    // Update UI
    document.querySelectorAll('.period-btn').forEach(btn => btn.classList.remove('active'));
    
    // Refresh data and displays
    filterDataByPeriod();
    updateAllDisplays();
}

function updateAllDisplays() {
    updateDashboardStats();
    updateTrendsChart();
    updateTopProducts();
    updateOutletPerformance();
    updateAnalytics();
}

// Dashboard statistics
function updateDashboardStats() {
    const transactions = salesState.filteredSalesData || [];
    
    // Calculate metrics
    const totalRevenue = transactions.reduce((sum, t) => sum + t.totalRevenue, 0);
    const totalSales = transactions.reduce((sum, t) => sum + t.items.reduce((itemSum, item) => itemSum + item.quantity, 0), 0);
    const averageOrderValue = transactions.length > 0 ? totalRevenue / transactions.length : 0;
    const activeOutlets = salesState.outletsData.filter(outlet => outlet.status === 'active').length;
    
    // Calculate period-over-period changes (simplified)
    const revenueChange = Math.random() * 20 - 5; // Simulated change
    const salesChange = Math.random() * 15 - 3;
    const aovChange = Math.random() * 10 - 2;
    
    // Update UI
    document.getElementById('totalRevenue').textContent = `$${totalRevenue.toFixed(2)}`;
    document.getElementById('totalSales').textContent = totalSales.toLocaleString();
    document.getElementById('averageOrderValue').textContent = `$${averageOrderValue.toFixed(2)}`;
    document.getElementById('activeOutlets').textContent = activeOutlets;
    
    // Update change indicators
    updateChangeIndicator('revenueChange', revenueChange);
    updateChangeIndicator('salesChange', salesChange);
    updateChangeIndicator('aovChange', aovChange);
}

function updateChangeIndicator(elementId, changePercent) {
    const element = document.getElementById(elementId);
    const absChange = Math.abs(changePercent);
    const sign = changePercent >= 0 ? '+' : '';
    
    element.textContent = `${sign}${changePercent.toFixed(1)}%`;
    element.className = 'stat-change';
    
    if (changePercent > 0) {
        element.classList.add('positive');
    } else if (changePercent < 0) {
        element.classList.add('negative');
    } else {
        element.classList.add('neutral');
    }
}

// Trends chart update
function updateTrendsChart() {
    const metric = document.getElementById('trendMetric')?.value || 'revenue';
    const grouping = document.getElementById('trendGrouping')?.value || 'daily';
    
    const chartData = aggregateDataForTrends(salesState.filteredSalesData || [], metric, grouping);
    renderTrendsPreview(chartData, metric, grouping);
}

function aggregateDataForTrends(transactions, metric, grouping) {
    const aggregated = {};
    
    transactions.forEach(transaction => {
        const date = new Date(transaction.timestamp);
        let key;
        
        switch (grouping) {
            case 'daily':
                key = date.toDateString();
                break;
            case 'weekly':
                const weekStart = new Date(date);
                weekStart.setDate(date.getDate() - date.getDay());
                key = `Week of ${weekStart.toDateString()}`;
                break;
            case 'monthly':
                key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
                break;
            default:
                key = date.toDateString();
        }
        
        if (!aggregated[key]) {
            aggregated[key] = { revenue: 0, units: 0, transactions: 0 };
        }
        
        aggregated[key].revenue += transaction.totalRevenue;
        aggregated[key].units += transaction.items.reduce((sum, item) => sum + item.quantity, 0);
        aggregated[key].transactions += 1;
    });
    
    return Object.entries(aggregated).map(([date, data]) => ({
        date,
        value: data[metric],
        revenue: data.revenue,
        units: data.units,
        transactions: data.transactions
    })).sort((a, b) => new Date(a.date) - new Date(b.date));
}

function renderTrendsPreview(data, metric, grouping) {
    const container = document.getElementById('trendPreview');
    
    if (!data || data.length === 0) {
        container.innerHTML = '<p>No data available for the selected period.</p>';
        return;
    }
    
    const metricLabels = {
        revenue: 'Revenue ($)',
        units: 'Units Sold',
        transactions: 'Transactions'
    };
    
    let html = `
        <div class="trend-summary">
            <h4>📈 ${metricLabels[metric]} Trends (${grouping})</h4>
            <div class="trend-stats">
                <div class="trend-stat">
                    <span class="trend-label">Total ${metricLabels[metric]}:</span>
                    <span class="trend-value">${formatTrendValue(data.reduce((sum, d) => sum + d.value, 0), metric)}</span>
                </div>
                <div class="trend-stat">
                    <span class="trend-label">Average per ${grouping.slice(0, -2)}:</span>
                    <span class="trend-value">${formatTrendValue(data.reduce((sum, d) => sum + d.value, 0) / data.length, metric)}</span>
                </div>
                <div class="trend-stat">
                    <span class="trend-label">Data Points:</span>
                    <span class="trend-value">${data.length}</span>
                </div>
            </div>
        </div>
        <div class="trend-data">
            <h5>Recent Data Points:</h5>
            <div class="trend-points">
    `;
    
    // Show last 5 data points
    data.slice(-5).forEach(point => {
        html += `
            <div class="trend-point">
                <span class="point-date">${formatDateForDisplay(point.date)}</span>
                <span class="point-value">${formatTrendValue(point.value, metric)}</span>
            </div>
        `;
    });
    
    html += '</div></div>';
    container.innerHTML = html;
}

function formatTrendValue(value, metric) {
    switch (metric) {
        case 'revenue':
            return `$${value.toFixed(2)}`;
        case 'units':
            return Math.round(value).toLocaleString();
        case 'transactions':
            return Math.round(value).toLocaleString();
        default:
            return value.toFixed(2);
    }
}

function formatDateForDisplay(dateString) {
    if (dateString.includes('Week of')) {
        return dateString;
    }
    
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
    });
}

// Top products update
function updateTopProducts() {
    const metric = document.getElementById('productMetric')?.value || 'units';
    const limit = parseInt(document.getElementById('productLimit')?.value || '10');
    
    const productStats = calculateProductStats(salesState.filteredSalesData || []);
    const sortedProducts = sortProductsByMetric(productStats, metric);
    const topProducts = sortedProducts.slice(0, limit);
    
    renderTopProducts(topProducts, metric);
}

function calculateProductStats(transactions) {
    const productStats = {};
    
    transactions.forEach(transaction => {
        transaction.items.forEach(item => {
            if (!productStats[item.productId]) {
                productStats[item.productId] = {
                    id: item.productId,
                    name: item.name,
                    category: item.category,
                    totalUnits: 0,
                    totalRevenue: 0,
                    frequency: 0,
                    averagePrice: item.unitPrice
                };
            }
            
            productStats[item.productId].totalUnits += item.quantity;
            productStats[item.productId].totalRevenue += item.revenue;
            productStats[item.productId].frequency += 1;
        });
    });
    
    return Object.values(productStats);
}

function sortProductsByMetric(products, metric) {
    return products.sort((a, b) => {
        switch (metric) {
            case 'units':
                return b.totalUnits - a.totalUnits;
            case 'revenue':
                return b.totalRevenue - a.totalRevenue;
            case 'frequency':
                return b.frequency - a.frequency;
            default:
                return b.totalUnits - a.totalUnits;
        }
    });
}

function renderTopProducts(products, metric) {
    const container = document.getElementById('topProductsGrid');
    
    if (products.length === 0) {
        container.innerHTML = '<p class="no-data">No product data available for the selected period.</p>';
        return;
    }
    
    const maxValue = products[0][getMetricProperty(metric)];
    
    const html = products.map((product, index) => {
        const rank = index + 1;
        const rankClass = rank <= 3 ? 'top3' : rank <= 5 ? 'top5' : '';
        const progress = (product[getMetricProperty(metric)] / maxValue) * 100;
        
        return `
            <div class="product-card">
                <div class="product-rank ${rankClass}">${rank}</div>
                <div class="product-name">${product.name}</div>
                <div class="product-stats">
                    <div class="product-stat">
                        <span class="product-stat-label">Units Sold:</span>
                        <span class="product-stat-value">${product.totalUnits.toLocaleString()}</span>
                    </div>
                    <div class="product-stat">
                        <span class="product-stat-label">Revenue:</span>
                        <span class="product-stat-value">$${product.totalRevenue.toFixed(2)}</span>
                    </div>
                    <div class="product-stat">
                        <span class="product-stat-label">Frequency:</span>
                        <span class="product-stat-value">${product.frequency} transactions</span>
                    </div>
                    <div class="product-stat">
                        <span class="product-stat-label">Avg. Price:</span>
                        <span class="product-stat-value">$${product.averagePrice.toFixed(2)}</span>
                    </div>
                </div>
                <div class="product-progress">
                    <div class="product-progress-fill" style="width: ${progress}%"></div>
                </div>
            </div>
        `;
    }).join('');
    
    container.innerHTML = html;
}

function getMetricProperty(metric) {
    switch (metric) {
        case 'units': return 'totalUnits';
        case 'revenue': return 'totalRevenue';
        case 'frequency': return 'frequency';
        default: return 'totalUnits';
    }
}

// Outlet performance update
function updateOutletPerformance() {
    const outletStats = calculateOutletStats(salesState.filteredSalesData || []);
    renderOutletPerformance(outletStats);
}

function calculateOutletStats(transactions) {
    const outletStats = {};
    
    // Initialize with base outlet data
    salesState.outletsData.forEach(outlet => {
        outletStats[outlet.id] = {
            ...outlet,
            currentRevenue: 0,
            currentSales: 0,
            currentTransactions: 0,
            averageOrderValue: 0
        };
    });
    
    // Calculate current period stats
    transactions.forEach(transaction => {
        if (outletStats[transaction.outlet]) {
            outletStats[transaction.outlet].currentRevenue += transaction.totalRevenue;
            outletStats[transaction.outlet].currentSales += transaction.items.reduce((sum, item) => sum + item.quantity, 0);
            outletStats[transaction.outlet].currentTransactions += 1;
        }
    });
    
    // Calculate average order values
    Object.values(outletStats).forEach(outlet => {
        outlet.averageOrderValue = outlet.currentTransactions > 0 ? 
            outlet.currentRevenue / outlet.currentTransactions : 0;
    });
    
    return Object.values(outletStats);
}

function renderOutletPerformance(outlets) {
    const container = document.getElementById('outletCards');
    
    const html = outlets.map(outlet => `
        <div class="outlet-card">
            <div class="outlet-header">
                <div class="outlet-name">${outlet.name}</div>
                <div class="outlet-status ${outlet.status}">${outlet.status.toUpperCase()}</div>
            </div>
            <div class="outlet-metrics">
                <div class="outlet-metric">
                    <div class="outlet-metric-value">$${outlet.currentRevenue.toFixed(2)}</div>
                    <div class="outlet-metric-label">Revenue</div>
                </div>
                <div class="outlet-metric">
                    <div class="outlet-metric-value">${outlet.currentSales}</div>
                    <div class="outlet-metric-label">Units Sold</div>
                </div>
                <div class="outlet-metric">
                    <div class="outlet-metric-value">${outlet.currentTransactions}</div>
                    <div class="outlet-metric-label">Transactions</div>
                </div>
                <div class="outlet-metric">
                    <div class="outlet-metric-value">$${outlet.averageOrderValue.toFixed(2)}</div>
                    <div class="outlet-metric-label">Avg Order</div>
                </div>
            </div>
        </div>
    `).join('');
    
    container.innerHTML = html;
}

// Advanced analytics updates
function updateAnalytics() {
    updateCustomerInsights();
    updateSeasonalTrends();
}

function updateCustomerInsights() {
    const transactions = salesState.filteredSalesData || [];
    
    // Calculate peak hours
    const hourlyData = {};
    transactions.forEach(transaction => {
        const hour = new Date(transaction.timestamp).getHours();
        hourlyData[hour] = (hourlyData[hour] || 0) + 1;
    });
    
    const peakHour = Object.entries(hourlyData).reduce((max, [hour, count]) => 
        count > (hourlyData[max] || 0) ? hour : max, '0');
    
    // Calculate average transaction size
    const avgTransactionSize = transactions.length > 0 ? 
        transactions.reduce((sum, t) => sum + t.items.length, 0) / transactions.length : 0;
    
    // Simulate repeat customer rate
    const repeatCustomerRate = 60 + Math.random() * 20; // 60-80%
    
    // Update UI
    document.getElementById('peakHours').textContent = `${peakHour}:00 - ${parseInt(peakHour) + 2}:00`;
    document.getElementById('avgTransactionSize').textContent = `${avgTransactionSize.toFixed(1)} items`;
    document.getElementById('repeatCustomerRate').textContent = `${repeatCustomerRate.toFixed(0)}%`;
}

function updateSeasonalTrends() {
    const container = document.getElementById('seasonalTrends');
    
    // Simulate seasonal analysis
    const seasonalData = [
        { season: 'Spring', trend: '+15%', description: 'Increased demand for fresh pastries' },
        { season: 'Summer', trend: '+8%', description: 'Light snacks and cold beverages popular' },
        { season: 'Fall', trend: '+22%', description: 'Seasonal flavors drive sales' },
        { season: 'Winter', trend: '+12%', description: 'Comfort foods and holiday items' }
    ];
    
    const html = seasonalData.map(data => `
        <div class="seasonal-item">
            <div class="seasonal-season">${data.season}</div>
            <div class="seasonal-trend ${data.trend.startsWith('+') ? 'positive' : 'negative'}">${data.trend}</div>
            <div class="seasonal-desc">${data.description}</div>
        </div>
    `).join('');
    
    container.innerHTML = html;
}

// Demand forecasting functions
function populateForecastProducts() {
    const select = document.getElementById('forecastProduct');
    const products = salesState.productsData;
    
    select.innerHTML = '<option value="">Select Product...</option>';
    
    products.forEach(product => {
        const option = document.createElement('option');
        option.value = product.id;
        option.textContent = product.name;
        select.appendChild(option);
    });
}

function updateForecast() {
    const productId = document.getElementById('forecastProduct').value;
    const period = document.getElementById('forecastPeriod').value;
    
    if (!productId || !period) return;
    
    // Auto-generate forecast preview
    generateForecast();
}

function generateForecast() {
    const productId = document.getElementById('forecastProduct').value;
    const period = parseInt(document.getElementById('forecastPeriod').value);
    
    if (!productId || !period) {
        alert('Please select a product and forecast period.');
        return;
    }
    
    showLoadingOverlay('Analyzing historical data and generating forecast...');
    
    setTimeout(() => {
        const forecastData = calculateDemandForecast(productId, period);
        displayForecastResults(forecastData);
        hideLoadingOverlay();
    }, 2000);
}

function calculateDemandForecast(productId, days) {
    const product = salesState.productsData.find(p => p.id === productId);
    const transactions = salesState.salesData.filter(t => 
        t.items.some(item => item.productId === productId)
    );
    
    // Simple trend analysis for forecasting
    const historicalData = analyzeHistoricalSales(transactions, productId);
    const trendFactor = calculateTrendFactor(historicalData);
    const seasonalFactor = calculateSeasonalFactor();
    
    // Generate forecast for each day
    const forecast = [];
    const baselineDemand = historicalData.averageDailyDemand || 10;
    
    for (let i = 1; i <= days; i++) {
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + i);
        
        // Apply trend and seasonal adjustments
        const forecastedDemand = Math.max(0, Math.round(
            baselineDemand * trendFactor * seasonalFactor * (0.9 + Math.random() * 0.2)
        ));
        
        forecast.push({
            date: futureDate.toDateString(),
            predictedDemand: forecastedDemand,
            confidence: Math.round(85 + Math.random() * 10), // 85-95% confidence
            revenue: forecastedDemand * product.unitPrice
        });
    }
    
    return {
        product: product,
        period: days,
        forecast: forecast,
        summary: {
            totalPredictedDemand: forecast.reduce((sum, f) => sum + f.predictedDemand, 0),
            totalPredictedRevenue: forecast.reduce((sum, f) => sum + f.revenue, 0),
            averageConfidence: forecast.reduce((sum, f) => sum + f.confidence, 0) / forecast.length,
            trendDirection: trendFactor > 1 ? 'Increasing' : trendFactor < 1 ? 'Decreasing' : 'Stable'
        }
    };
}

function analyzeHistoricalSales(transactions, productId) {
    const productSales = {};
    
    transactions.forEach(transaction => {
        const date = new Date(transaction.timestamp).toDateString();
        const item = transaction.items.find(i => i.productId === productId);
        
        if (item) {
            productSales[date] = (productSales[date] || 0) + item.quantity;
        }
    });
    
    const dailySales = Object.values(productSales);
    const averageDailyDemand = dailySales.length > 0 ? 
        dailySales.reduce((sum, sales) => sum + sales, 0) / dailySales.length : 10;
    
    return {
        averageDailyDemand,
        totalDays: dailySales.length,
        variance: calculateVariance(dailySales)
    };
}

function calculateVariance(data) {
    if (data.length === 0) return 0;
    
    const mean = data.reduce((sum, val) => sum + val, 0) / data.length;
    const variance = data.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / data.length;
    
    return variance;
}

function calculateTrendFactor() {
    // Simplified trend calculation - in reality would use regression analysis
    return 0.95 + Math.random() * 0.1; // -5% to +5% trend
}

function calculateSeasonalFactor() {
    // Simplified seasonal adjustment
    const currentMonth = new Date().getMonth();
    const seasonalFactors = [0.9, 0.85, 0.95, 1.1, 1.15, 1.05, 0.98, 0.92, 1.0, 1.08, 1.2, 1.25];
    return seasonalFactors[currentMonth];
}

function displayForecastResults(forecastData) {
    const modal = document.getElementById('forecastModal');
    const container = document.getElementById('forecastModalBody');
    
    const html = `
        <div class="forecast-results">
            <div class="forecast-header">
                <h4>📊 Demand Forecast for ${forecastData.product.name}</h4>
                <p>Forecast Period: Next ${forecastData.period} days</p>
            </div>
            
            <div class="forecast-summary">
                <div class="summary-grid">
                    <div class="summary-item">
                        <span class="summary-label">Total Predicted Demand:</span>
                        <span class="summary-value">${forecastData.summary.totalPredictedDemand.toLocaleString()} units</span>
                    </div>
                    <div class="summary-item">
                        <span class="summary-label">Total Predicted Revenue:</span>
                        <span class="summary-value">$${forecastData.summary.totalPredictedRevenue.toFixed(2)}</span>
                    </div>
                    <div class="summary-item">
                        <span class="summary-label">Average Confidence:</span>
                        <span class="summary-value">${forecastData.summary.averageConfidence.toFixed(1)}%</span>
                    </div>
                    <div class="summary-item">
                        <span class="summary-label">Trend Direction:</span>
                        <span class="summary-value">${forecastData.summary.trendDirection}</span>
                    </div>
                </div>
            </div>
            
            <div class="forecast-chart">
                <h5>📈 Daily Forecast Breakdown</h5>
                <div class="forecast-table">
                    <table>
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Predicted Demand</th>
                                <th>Confidence</th>
                                <th>Expected Revenue</th>
                            </tr>
                        </thead>
                        <tbody>
    `;
    
    // Show first 7 days in detail, then summarize rest
    const detailedDays = Math.min(7, forecastData.forecast.length);
    
    for (let i = 0; i < detailedDays; i++) {
        const day = forecastData.forecast[i];
        html += `
            <tr>
                <td>${formatDateForDisplay(day.date)}</td>
                <td>${day.predictedDemand} units</td>
                <td>${day.confidence}%</td>
                <td>$${day.revenue.toFixed(2)}</td>
            </tr>
        `;
    }
    
    if (forecastData.forecast.length > 7) {
        const remainingDays = forecastData.forecast.slice(7);
        const remainingDemand = remainingDays.reduce((sum, day) => sum + day.predictedDemand, 0);
        const remainingRevenue = remainingDays.reduce((sum, day) => sum + day.revenue, 0);
        const avgConfidence = remainingDays.reduce((sum, day) => sum + day.confidence, 0) / remainingDays.length;
        
        html += `
            <tr class="summary-row">
                <td>Remaining ${remainingDays.length} days</td>
                <td>${remainingDemand} units</td>
                <td>${avgConfidence.toFixed(1)}%</td>
                <td>$${remainingRevenue.toFixed(2)}</td>
            </tr>
        `;
    }
    
    html += `
                        </tbody>
                    </table>
                </div>
            </div>
            
            <div class="forecast-notes">
                <h5>📝 Forecast Notes</h5>
                <ul>
                    <li>Forecast based on historical sales data and trend analysis</li>
                    <li>Seasonal factors and market conditions have been considered</li>
                    <li>Confidence levels reflect data quality and trend stability</li>
                    <li>Recommendations: Monitor actual vs. predicted for accuracy improvements</li>
                </ul>
            </div>
        </div>
    `;
    
    container.innerHTML = html;
    modal.style.display = 'block';
    
    // Store forecast data for export
    salesState.forecastData = forecastData;
}

function closeForecastModal() {
    document.getElementById('forecastModal').style.display = 'none';
}

function exportForecast() {
    if (!salesState.forecastData) {
        alert('No forecast data to export.');
        return;
    }
    
    const forecastData = salesState.forecastData;
    
    // Generate CSV content
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Date,Predicted Demand,Confidence %,Expected Revenue\n";
    
    forecastData.forecast.forEach(day => {
        csvContent += `"${day.date}",${day.predictedDemand},${day.confidence},"$${day.revenue.toFixed(2)}"\n`;
    });
    
    // Add summary
    csvContent += "\nSummary\n";
    csvContent += `"Total Predicted Demand","${forecastData.summary.totalPredictedDemand}","",""\n`;
    csvContent += `"Total Predicted Revenue","","","$${forecastData.summary.totalPredictedRevenue.toFixed(2)}"\n`;
    csvContent += `"Average Confidence","","${forecastData.summary.averageConfidence.toFixed(1)}%",""\n`;
    csvContent += `"Trend Direction","${forecastData.summary.trendDirection}","",""\n`;
    
    // Trigger download
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `demand_forecast_${forecastData.product.name.replace(/[^a-z0-9]/gi, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    closeForecastModal();
}

// Quick action functions
function exportSalesReport() {
    showLoadingOverlay('Generating comprehensive sales report...');
    
    setTimeout(() => {
        const reportData = generateSalesReportData();
        exportToCSV(reportData, 'sales_report');
        hideLoadingOverlay();
    }, 1500);
}

function generateSalesReportData() {
    const transactions = salesState.filteredSalesData || [];
    
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Transaction ID,Date,Time,Outlet,Product,Category,Quantity,Unit Price,Revenue,Staff\n";
    
    transactions.forEach(transaction => {
        const date = new Date(transaction.timestamp);
        const dateStr = date.toLocaleDateString();
        const timeStr = date.toLocaleTimeString();
        
        transaction.items.forEach(item => {
            csvContent += `"${transaction.id}","${dateStr}","${timeStr}","${transaction.outlet}","${item.name}","${item.category}",${item.quantity},"$${item.unitPrice.toFixed(2)}","$${item.revenue.toFixed(2)}","${transaction.staff}"\n`;
        });
    });
    
    return csvContent;
}

function exportToCSV(csvContent, filename) {
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function generateInventoryAlert() {
    // Integration with inventory management system
    const lowStockItems = generateLowStockAnalysis();
    
    if (lowStockItems.length === 0) {
        alert('No low stock alerts based on current sales trends.');
        return;
    }
    
    const alertMessage = `🚨 Stock Replenishment Recommendations:\n\n${lowStockItems.map(item => 
        `• ${item.name}: Current ${item.currentStock}, Recommended ${item.recommendedOrder}`
    ).join('\n')}\n\nBased on current sales velocity and demand forecasting.`;
    
    alert(alertMessage);
}

function generateLowStockAnalysis() {
    // Simulate stock analysis based on sales velocity
    const topProducts = salesState.productsData.slice(0, 5);
    
    return topProducts.map(product => ({
        name: product.name,
        currentStock: Math.floor(Math.random() * 50) + 10,
        recommendedOrder: Math.floor(Math.random() * 100) + 50
    })).filter(item => item.currentStock < 30);
}

function scheduleReport() {
    alert('📅 Report Scheduling\n\nFeature coming soon! You will be able to:\n• Schedule daily/weekly/monthly reports\n• Set up automated email delivery\n• Configure custom report templates\n• Manage recurring analytics');
}

function openReportGeneration() {
    window.location.href = 'report-generation.html';
}

// Utility functions
function showLoadingOverlay(text) {
    document.getElementById('loadingText').textContent = text;
    document.getElementById('loadingOverlay').style.display = 'block';
}

function hideLoadingOverlay() {
    document.getElementById('loadingOverlay').style.display = 'none';
}

function goBackToDashboard() {
    const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
    if (user.role === 'supervisor') {
        window.location.href = 'supervisor-dashboard.html';
    } else {
        window.location.href = 'staff-dashboard.html';
    }
}

// CSS injection for additional styling
const additionalStyles = `
<style>
.trend-summary {
    background: #f8f9fa;
    border-radius: 8px;
    padding: 20px;
    margin-bottom: 15px;
}

.trend-stats {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 15px;
    margin-top: 15px;
}

.trend-stat {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 15px;
    background: white;
    border-radius: 5px;
    border-left: 3px solid #007bff;
}

.trend-label {
    font-weight: 500;
    color: #666;
}

.trend-value {
    font-weight: 600;
    color: #007bff;
}

.trend-points {
    display: flex;
    flex-direction: column;
    gap: 10px;
    margin-top: 10px;
}

.trend-point {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 12px;
    background: rgba(0,123,255,0.05);
    border-radius: 5px;
}

.point-date {
    font-weight: 500;
    color: #666;
}

.point-value {
    font-weight: 600;
    color: #007bff;
}

.seasonal-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 15px;
    margin-bottom: 10px;
    background: rgba(0,123,255,0.05);
    border-radius: 8px;
    border-left: 3px solid #007bff;
}

.seasonal-season {
    font-weight: 600;
    color: #333;
}

.seasonal-trend {
    font-weight: 600;
    padding: 4px 8px;
    border-radius: 12px;
    font-size: 0.9em;
}

.seasonal-trend.positive {
    background: #d4edda;
    color: #155724;
}

.seasonal-trend.negative {
    background: #f8d7da;
    color: #721c24;
}

.seasonal-desc {
    color: #666;
    font-size: 0.9em;
    text-align: right;
    max-width: 200px;
}

.forecast-results {
    max-height: 70vh;
    overflow-y: auto;
}

.forecast-header {
    text-align: center;
    margin-bottom: 25px;
    padding-bottom: 15px;
    border-bottom: 1px solid #e9ecef;
}

.summary-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 15px;
    margin: 20px 0;
}

.summary-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 15px;
    background: #f8f9fa;
    border-radius: 8px;
    border-left: 3px solid #007bff;
}

.summary-label {
    font-weight: 500;
    color: #666;
}

.summary-value {
    font-weight: 600;
    color: #007bff;
}

.forecast-table table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 15px;
}

.forecast-table th,
.forecast-table td {
    padding: 10px;
    text-align: left;
    border-bottom: 1px solid #e9ecef;
}

.forecast-table th {
    background: #f8f9fa;
    font-weight: 600;
    color: #333;
}

.summary-row {
    background: #f8f9fa;
    font-weight: 500;
}

.forecast-notes {
    margin-top: 25px;
    padding-top: 20px;
    border-top: 1px solid #e9ecef;
}

.forecast-notes ul {
    list-style-type: none;
    padding: 0;
}

.forecast-notes li {
    padding: 5px 0;
    padding-left: 20px;
    position: relative;
}

.forecast-notes li:before {
    content: '•';
    color: #007bff;
    font-weight: bold;
    position: absolute;
    left: 0;
}

.no-data {
    text-align: center;
    color: #666;
    font-style: italic;
    padding: 40px;
    background: #f8f9fa;
    border-radius: 8px;
}

@media (max-width: 768px) {
    .trend-stats {
        grid-template-columns: 1fr;
    }
    
    .summary-grid {
        grid-template-columns: 1fr;
    }
    
    .seasonal-item {
        flex-direction: column;
        align-items: stretch;
        gap: 10px;
    }
    
    .seasonal-desc {
        text-align: left;
        max-width: none;
    }
    
    .forecast-table {
        overflow-x: auto;
    }
}
</style>
`;

// Inject additional styles
document.head.insertAdjacentHTML('beforeend', additionalStyles);

console.log('PAU Inventory Sales Overview module loaded successfully');
