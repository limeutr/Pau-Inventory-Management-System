// PAU Inventory Management System - Report Generation Module
// Comprehensive reporting with data aggregation, filtering, export, and audit features

// Global state management
let reportState = {
    currentUser: null,
    selectedReportType: null,
    reportConfiguration: {},
    generatedReports: [],
    isGenerating: false,
    previewData: null
};

// Report type configurations
const REPORT_TYPES = {
    'pau-sales-summary': {
        title: 'PAU Sales Summary Report',
        description: 'Revenue analysis for Classic Pau ($3.50), Char Siew Pau ($4.50), Nai Wong Bao ($3.00), Red Bean Pau ($4.50), Lotus Bao ($5.00), Vegetarian Bao ($2.50)',
        icon: '💰',
        category: 'sales',
        dataSource: ['production', 'inventory'],
        filters: ['date', 'outlet', 'pau-type'],
        charts: ['revenue', 'topPauProducts', 'outletPerformance']
    },
    'ingredient-stock-levels': {
        title: 'Ingredient Stock Levels Report',
        description: 'Current levels of All Purpose Flour, Sugar, Yeast, Oil, Salt, Baking Powder, Char Siew, Red Bean Paste, Lotus Seed Paste, Custard Filling, Mushroom & Veg Mix',
        icon: '📦',
        category: 'inventory',
        dataSource: ['inventory'],
        filters: ['supplier', 'ingredient-type', 'date'],
        charts: ['stockLevels', 'lowStockAlerts', 'supplierDistribution']
    },
    'supplier-analysis': {
        title: 'Supplier Analysis Report',
        description: 'Performance analysis for Golden Wheat Co., Sweet Supply Ltd., and Filling Co. including costs and delivery schedules',
        icon: '🚚',
        category: 'financial',
        dataSource: ['inventory', 'suppliers'],
        filters: ['supplier', 'date', 'ingredient'],
        charts: ['supplierCosts', 'deliveryPerformance', 'qualityMetrics']
    },
    'pau-production-efficiency': {
        title: 'PAU Production Efficiency Report',
        description: 'Detailed PAU production metrics, steaming operations, filling preparation, and efficiency analysis',
        icon: '🏭',
        category: 'operational',
        dataSource: ['production'],
        filters: ['date', 'pau-type', 'shift'],
        charts: ['productionTrends', 'steamingEfficiency', 'fillingUtilization']
    },
    'filling-ingredient-usage': {
        title: 'Filling Ingredient Usage Report',
        description: 'Analysis of Char Siew ($12.00), Red Bean Paste ($6.00), Lotus Seed Paste ($8.00), Custard Filling ($7.50), Mushroom & Veg Mix ($6.00) consumption',
        icon: '🥟',
        category: 'inventory',
        dataSource: ['inventory', 'production'],
        filters: ['date', 'filling-type', 'outlet'],
        charts: ['fillingUsage', 'costAnalysis', 'wastageImpact']
    },
    'pau-wastage-analysis': {
        title: 'PAU Wastage Analysis Report',
        description: 'Comprehensive PAU wastage analysis by location, reason, and financial impact on finished products',
        icon: '�️',
        category: 'operational',
        dataSource: ['wastage'],
        filters: ['date', 'outlet', 'pau-type'],
        charts: ['wastageByReason', 'costImpact', 'trends']
    },
    'financial-pau-summary': {
        title: 'Financial PAU Summary Report',
        description: 'Profit margins on PAU products, ingredient costs analysis, and supplier payment tracking',
        icon: '�',
        category: 'financial',
        dataSource: ['inventory', 'production', 'suppliers'],
        filters: ['date', 'supplier', 'pau-type'],
        charts: ['profitMargins', 'ingredientCosts', 'supplierPayments']
    },
    'comprehensive-pau': {
        title: 'Comprehensive PAU Business Report',
        description: 'Complete PAU bakery overview including all products, ingredients, suppliers, and key performance indicators',
        icon: '📊',
        category: 'operational',
        dataSource: ['inventory', 'production', 'wastage', 'suppliers'],
        filters: ['date', 'outlet'],
        charts: ['systemOverview', 'kpiSummary', 'trendsAnalysis', 'supplierPerformance']
    }
};

// Initialize the report generation module
document.addEventListener('DOMContentLoaded', function() {
    initializeReportModule();
});

function initializeReportModule() {
    // Reset any stuck state
    reportState.isGenerating = false;
    
    // Check authentication and role permissions
    checkAuthenticationAndPermissions();
    
    // Initialize UI components
    initializeUI();
    
    // Load existing report history
    loadReportHistory();
    
    // Update statistics
    updateStatistics();
    
    // Start real-time clock
    updateCurrentTime();
    setInterval(updateCurrentTime, 1000);
    
    // Set up form validation and event listeners
    setupEventListeners();
    
    console.log('Report Generation module initialized');
}

function checkAuthenticationAndPermissions() {
    const isLoggedIn = sessionStorage.getItem('isLoggedIn');
    const userRole = sessionStorage.getItem('userRole');
    const username = sessionStorage.getItem('username');
    
    if (!isLoggedIn || isLoggedIn !== 'true') {
        alert('Please log in to access the report generation system.');
        window.location.href = 'index.html';
        return;
    }
    
    // Allow both admin and supervisor roles to access report generation
    if (userRole !== 'supervisor' && userRole !== 'admin') {
        alert('Access denied. Only supervisors and administrators can generate reports.');
        window.location.href = userRole === 'staff' ? 'staff-dashboard.html' : 'index.html';
        return;
    }
    
    // Create currentUser object for compatibility
    const currentUser = {
        username: username,
        role: userRole,
        isLoggedIn: true
    };
    
    reportState.currentUser = currentUser;
    
    // Update UI with user information
    document.getElementById('welcomeMessage').textContent = `Welcome, ${currentUser.username}!`;
    document.getElementById('userRoleBadge').textContent = currentUser.role.charAt(0).toUpperCase() + currentUser.role.slice(1);
}

function initializeUI() {
    // Set default date range (last 30 days)
    const today = new Date();
    const thirtyDaysAgo = new Date(today.getTime() - (30 * 24 * 60 * 60 * 1000));
    
    if (document.getElementById('dateTo')) {
        document.getElementById('dateTo').value = today.toISOString().split('T')[0];
    }
    if (document.getElementById('dateFrom')) {
        document.getElementById('dateFrom').value = thirtyDaysAgo.toISOString().split('T')[0];
    }
    
    // Update dashboard statistics
    updateStatistics();
}

function updateDashboardStats() {
    // This function is now an alias for updateStatistics for backward compatibility
    updateStatistics();
}

function updateCurrentTime() {
    const now = new Date();
    const timeString = now.toLocaleTimeString('en-US', { 
        hour12: false, 
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit' 
    });
    document.getElementById('currentTime').textContent = timeString;
}

function setupEventListeners() {
    // Logout functionality
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            if (confirm('Are you sure you want to logout?')) {
                sessionStorage.removeItem('isLoggedIn');
                sessionStorage.removeItem('userRole');
                sessionStorage.removeItem('username');
                window.location.href = 'index.html';
            }
        });
    }
    
    // Date validation for custom date range
    const startDate = document.getElementById('startDate');
    const endDate = document.getElementById('endDate');
    if (startDate) startDate.addEventListener('change', validateDateRange);
    if (endDate) endDate.addEventListener('change', validateDateRange);
    
    // Report category and type selection
    const reportCategory = document.getElementById('reportCategory');
    const reportType = document.getElementById('reportType');
    
    if (reportCategory) {
        reportCategory.addEventListener('change', updateReportTypes);
    }
    
    if (reportType) {
        reportType.addEventListener('change', updateReportDescription);
    }
    
    // Report period selection
    const reportPeriod = document.getElementById('reportPeriod');
    if (reportPeriod) {
        reportPeriod.addEventListener('change', updateDateRange);
    }
}

function validateDateRange() {
    const startDate = document.getElementById('startDate');
    const endDate = document.getElementById('endDate');
    
    if (!startDate || !endDate) return;
    
    const dateFrom = startDate.value;
    const dateTo = endDate.value;
    
    if (dateFrom && dateTo && new Date(dateFrom) > new Date(dateTo)) {
        showNotification('Start date cannot be later than end date.', 'error');
        startDate.value = '';
        endDate.value = '';
    }
}

// Report type selection
function selectReportType(reportType) {
    reportState.selectedReportType = reportType;
    const config = REPORT_TYPES[reportType];
    
    // Update configuration section
    document.getElementById('selectedReportTitle').textContent = config.title;
    document.getElementById('selectedReportDesc').textContent = config.description;
    
    // Set default report name
    document.getElementById('reportName').value = `${config.title} - ${new Date().toLocaleDateString()}`;
    
    // Show/hide filters based on report type
    toggleFilterVisibility(config.filters);
    
    // Show configuration section
    document.getElementById('configSection').style.display = 'block';
    document.getElementById('configSection').scrollIntoView({ behavior: 'smooth' });
    
    // Visual feedback for selected report card
    document.querySelectorAll('.report-card').forEach(card => card.classList.remove('selected'));
    event.target.closest('.report-card').classList.add('selected');
}

function toggleFilterVisibility(availableFilters) {
    // Show/hide category filter
    const categoryRow = document.getElementById('categoryFilterRow');
    if (availableFilters.includes('category')) {
        categoryRow.style.display = 'flex';
    } else {
        categoryRow.style.display = 'none';
    }
    
    // Show/hide outlet filter
    const outletGroup = document.getElementById('outletFilterGroup');
    if (availableFilters.includes('outlet')) {
        outletGroup.style.display = 'block';
    } else {
        outletGroup.style.display = 'none';
    }
}

function closeConfiguration() {
    document.getElementById('configSection').style.display = 'none';
    document.querySelectorAll('.report-card').forEach(card => card.classList.remove('selected'));
    reportState.selectedReportType = null;
}

// Report preview functionality
function previewReport() {
    if (!validateReportConfiguration()) {
        return;
    }
    
    const config = collectReportConfiguration();
    reportState.reportConfiguration = config;
    
    // Generate preview data
    const previewData = generateReportData(config);
    reportState.previewData = previewData;
    
    // Render preview
    renderReportPreview(previewData, config);
    
    // Show preview section
    document.getElementById('previewSection').style.display = 'block';
    document.getElementById('previewSection').scrollIntoView({ behavior: 'smooth' });
}

function validateReportConfiguration() {
    // Get form values directly from the form elements
    const reportCategory = document.getElementById('reportCategory')?.value;
    const reportType = document.getElementById('reportType')?.value;
    const reportPeriod = document.getElementById('reportPeriod')?.value;
    const reportFormat = document.getElementById('reportFormat')?.value;
    
    // Check required fields
    if (!reportCategory) {
        showNotification('Please select a report category.', 'error');
        return false;
    }
    
    if (!reportType) {
        showNotification('Please select a report type.', 'error');
        return false;
    }
    
    if (!reportPeriod) {
        showNotification('Please select a time period.', 'error');
        return false;
    }
    
    if (!reportFormat) {
        showNotification('Please select an output format.', 'error');
        return false;
    }
    
    // Validate custom date range if selected
    if (reportPeriod === 'custom') {
        const startDate = document.getElementById('startDate')?.value;
        const endDate = document.getElementById('endDate')?.value;
        
        if (!startDate || !endDate) {
            showNotification('Please select start and end dates for custom range.', 'error');
            return false;
        }
        
        const dateFrom = new Date(startDate);
        const dateTo = new Date(endDate);
        const today = new Date();
        
        if (dateFrom > today || dateTo > today) {
            showNotification('Dates cannot be in the future.', 'error');
            return false;
        }
        
        if (dateFrom > dateTo) {
            showNotification('Start date cannot be later than end date.', 'error');
            return false;
        }
    }
    
    return true;
}

function collectReportConfiguration() {
    // Get form values directly from the form elements
    const reportCategory = document.getElementById('reportCategory')?.value;
    const reportType = document.getElementById('reportType')?.value;
    const reportPeriod = document.getElementById('reportPeriod')?.value;
    const reportFormat = document.getElementById('reportFormat')?.value;
    
    // Generate report name based on type and date
    const today = new Date();
    const reportName = `${reportType || 'Report'}_${today.getFullYear()}-${(today.getMonth()+1).toString().padStart(2,'0')}-${today.getDate().toString().padStart(2,'0')}`;
    
    // Calculate date range based on period
    let dateFrom, dateTo;
    if (reportPeriod === 'custom') {
        dateFrom = document.getElementById('startDate')?.value;
        dateTo = document.getElementById('endDate')?.value;
    } else {
        const periodDays = {
            'today': 0,
            'yesterday': 1,
            'week': 7,
            'month': 30,
            'quarter': 90,
            'year': 365
        };
        
        const days = periodDays[reportPeriod] || 7;
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(endDate.getDate() - days);
        
        dateFrom = startDate.toISOString().split('T')[0];
        dateTo = endDate.toISOString().split('T')[0];
    }
    
    return {
        reportType: reportType,
        reportName: reportName,
        category: reportCategory,
        format: reportFormat,
        period: reportPeriod,
        dateFrom: dateFrom,
        dateTo: dateTo,
        categoryFilter: 'all',
        outletFilter: 'all',
        includeCharts: document.getElementById('includeCharts')?.checked || false,
        includeSummary: document.getElementById('includeSummary')?.checked || true,
        includeTimestamps: document.getElementById('includeTimestamps')?.checked || true,
        includeAuditTrail: document.getElementById('includeAuditTrail')?.checked || false,
        generatedBy: sessionStorage.getItem('username') || 'Unknown User',
        generatedAt: new Date().toISOString()
    };
}

// Data aggregation and report generation
function generateReportData(config) {
    try {
        console.log('Generating report data for config:', config);
        
        // Validate config
        if (!config.reportType) {
            throw new Error('Report type is not specified');
        }
        
        const reportType = REPORT_TYPES[config.reportType];
        if (!reportType) {
            throw new Error(`Unknown report type: ${config.reportType}`);
        }
        
        let aggregatedData = {
            summary: {
                title: reportType.title,
                dateRange: `${config.dateFrom} to ${config.dateTo}`,
                generatedBy: config.generatedBy,
                generatedAt: config.generatedAt
            },
            details: [],
            charts: {},
            audit: []
        };
        
        // Generate some mock data for demonstration
        aggregatedData.details = generateMockData(config, reportType);
        
        // Generate charts data if requested
        if (config.includeCharts) {
            aggregatedData.charts = generateChartsData(aggregatedData, config);
        }
        
        console.log('Report data generated successfully:', aggregatedData);
        return aggregatedData;
        
    } catch (error) {
        console.error('Error in generateReportData:', error);
        throw error;
    }
}

// Helper function to generate mock data for demonstration
function generateMockData(config, reportType) {
    const mockData = [];
    const categories = ['PAU Filling', 'Ingredient Storage', 'Production Line', 'Quality Control'];
    
    for (let i = 0; i < 10; i++) {
        mockData.push({
            id: `item_${i + 1}`,
            name: `Sample ${reportType.title} Item ${i + 1}`,
            category: categories[i % categories.length],
            value: Math.floor(Math.random() * 1000) + 100,
            status: i % 3 === 0 ? 'Active' : 'Normal',
            timestamp: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
        });
    }
    
    return mockData;
}

function mergeInventoryData(data, config) {
    const inventory = JSON.parse(localStorage.getItem('inventory') || '[]');
    const filtered = filterDataByDateAndCategory(inventory, config, 'lastUpdated');
    
    data.details.push(...filtered.map(item => ({
        type: 'inventory',
        id: item.id,
        name: item.name,
        category: item.category,
        quantity: item.quantity,
        unit: item.unit,
        location: item.location,
        status: item.quantity <= item.minStock ? 'Low Stock' : 'Normal',
        lastUpdated: item.lastUpdated,
        value: item.quantity * (item.unitCost || 0)
    })));
    
    // Add audit trail for inventory changes
    if (config.includeAuditTrail) {
        const auditTrail = JSON.parse(localStorage.getItem('inventoryAudit') || '[]');
        data.audit.push(...auditTrail.filter(entry => 
            isWithinDateRange(entry.timestamp, config.dateFrom, config.dateTo)
        ));
    }
    
    return data;
}

function mergeProductionData(data, config) {
    const production = JSON.parse(localStorage.getItem('productionHistory') || '[]');
    const filtered = filterDataByDateAndCategory(production, config, 'timestamp');
    
    data.details.push(...filtered.map(entry => ({
        type: 'production',
        id: entry.id,
        name: entry.productName || entry.itemName,
        category: entry.category,
        quantity: entry.quantity,
        unit: entry.unit,
        direction: entry.type,
        location: entry.location,
        timestamp: entry.timestamp,
        staff: entry.staff,
        batchNumber: entry.batchNumber,
        value: entry.quantity * (entry.unitValue || 0)
    })));
    
    return data;
}

function mergeWastageData(data, config) {
    const wastage = JSON.parse(localStorage.getItem('wastageHistory') || '[]');
    const filtered = filterDataByDateAndCategory(wastage, config, 'timestamp');
    
    data.details.push(...filtered.map(entry => ({
        type: 'wastage',
        id: entry.id,
        name: entry.itemName,
        category: entry.category,
        quantity: entry.quantity,
        unit: entry.unit,
        reason: entry.reason,
        location: entry.location,
        timestamp: entry.timestamp,
        staff: entry.staff,
        costImpact: entry.costImpact,
        value: entry.costImpact || 0
    })));
    
    return data;
}

function mergeIngredientsData(data, config) {
    const ingredients = JSON.parse(localStorage.getItem('ingredients') || '[]');
    const filtered = filterDataByDateAndCategory(ingredients, config, 'lastUpdated');
    
    data.details.push(...filtered.map(item => ({
        type: 'ingredient',
        id: item.id,
        name: item.name,
        category: 'ingredient',
        quantity: item.quantity,
        unit: item.unit,
        supplier: item.supplier,
        expiryDate: item.expiryDate,
        status: new Date(item.expiryDate) < new Date() ? 'Expired' : 'Active',
        lastUpdated: item.lastUpdated,
        value: item.quantity * (item.unitCost || 0)
    })));
    
    return data;
}

function filterDataByDateAndCategory(dataArray, config, dateField) {
    return dataArray.filter(item => {
        // Date filter
        if (!isWithinDateRange(item[dateField], config.dateFrom, config.dateTo)) {
            return false;
        }
        
        // Category filter
        if (config.categoryFilter !== 'all' && item.category !== config.categoryFilter) {
            return false;
        }
        
        // Outlet filter
        if (config.outletFilter !== 'all' && item.location !== config.outletFilter) {
            return false;
        }
        
        return true;
    });
}

function isWithinDateRange(dateString, startDate, endDate) {
    if (!dateString) return false;
    
    const date = new Date(dateString);
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    return date >= start && date <= end;
}

function generateChartsData(data, config) {
    const charts = {};
    
    // Generate different chart types based on report type
    switch (config.reportType) {
        case 'stock-levels':
            charts.stockDistribution = generateStockDistributionChart(data);
            charts.lowStockAlerts = generateLowStockChart(data);
            break;
            
        case 'production-output':
            charts.productionTrends = generateProductionTrendsChart(data);
            charts.inboundOutbound = generateInboundOutboundChart(data);
            break;
            
        case 'wastage-statistics':
            charts.wastageByReason = generateWastageByReasonChart(data);
            charts.costImpact = generateCostImpactChart(data);
            break;
            
        case 'inventory-movement':
            charts.movementFlow = generateMovementFlowChart(data);
            break;
            
        case 'sales-performance':
            charts.revenue = generateRevenueChart(data);
            charts.topProducts = generateTopProductsChart(data);
            break;
            
        case 'comprehensive':
            charts.systemOverview = generateSystemOverviewChart(data);
            charts.kpiSummary = generateKPISummaryChart(data);
            break;
    }
    
    return charts;
}

function generateStockDistributionChart(data) {
    const inventory = data.details.filter(item => item.type === 'inventory');
    const categories = {};
    
    inventory.forEach(item => {
        categories[item.category] = (categories[item.category] || 0) + item.quantity;
    });
    
    return {
        type: 'pie',
        title: 'Stock Distribution by Category',
        data: Object.entries(categories).map(([category, quantity]) => ({
            label: category,
            value: quantity
        }))
    };
}

function generateLowStockChart(data) {
    const inventory = data.details.filter(item => item.type === 'inventory');
    const lowStock = inventory.filter(item => item.status === 'Low Stock');
    
    return {
        type: 'bar',
        title: 'Low Stock Alerts',
        data: lowStock.map(item => ({
            label: item.name,
            value: item.quantity,
            status: 'critical'
        }))
    };
}

function generateProductionTrendsChart(data) {
    const production = data.details.filter(item => item.type === 'production');
    const trends = {};
    
    production.forEach(entry => {
        const date = new Date(entry.timestamp).toDateString();
        if (!trends[date]) trends[date] = { inbound: 0, outbound: 0 };
        
        if (entry.direction === 'inbound') {
            trends[date].inbound += entry.quantity;
        } else {
            trends[date].outbound += entry.quantity;
        }
    });
    
    return {
        type: 'line',
        title: 'Production Trends Over Time',
        data: Object.entries(trends).map(([date, values]) => ({
            date: date,
            inbound: values.inbound,
            outbound: values.outbound
        }))
    };
}

function generateWastageByReasonChart(data) {
    const wastage = data.details.filter(item => item.type === 'wastage');
    const reasons = {};
    
    wastage.forEach(entry => {
        reasons[entry.reason] = (reasons[entry.reason] || 0) + entry.quantity;
    });
    
    return {
        type: 'doughnut',
        title: 'Wastage by Reason',
        data: Object.entries(reasons).map(([reason, quantity]) => ({
            label: reason,
            value: quantity
        }))
    };
}

function generateSummaryStats(data, config) {
    const summary = {
        totalRecords: data.details.length,
        dateRange: `${config.dateFrom} to ${config.dateTo}`,
        generatedAt: new Date().toLocaleString(),
        reportType: REPORT_TYPES[config.reportType].title
    };
    
    // Calculate type-specific statistics
    const inventory = data.details.filter(item => item.type === 'inventory');
    const production = data.details.filter(item => item.type === 'production');
    const wastage = data.details.filter(item => item.type === 'wastage');
    
    if (inventory.length > 0) {
        summary.inventoryStats = {
            totalItems: inventory.length,
            totalValue: inventory.reduce((sum, item) => sum + (item.value || 0), 0),
            lowStockItems: inventory.filter(item => item.status === 'Low Stock').length
        };
    }
    
    if (production.length > 0) {
        summary.productionStats = {
            totalEntries: production.length,
            inboundQuantity: production.filter(p => p.direction === 'inbound').reduce((sum, p) => sum + p.quantity, 0),
            outboundQuantity: production.filter(p => p.direction === 'outbound').reduce((sum, p) => sum + p.quantity, 0)
        };
    }
    
    if (wastage.length > 0) {
        summary.wastageStats = {
            totalWastage: wastage.reduce((sum, w) => sum + w.quantity, 0),
            totalCostImpact: wastage.reduce((sum, w) => sum + (w.value || 0), 0),
            topReason: getMostFrequentReason(wastage)
        };
    }
    
    return summary;
}

function getMostFrequentReason(wastageData) {
    const reasons = {};
    wastageData.forEach(entry => {
        reasons[entry.reason] = (reasons[entry.reason] || 0) + 1;
    });
    
    return Object.entries(reasons).reduce((a, b) => reasons[a[0]] > reasons[b[0]] ? a : b)[0];
}

// Report preview rendering
function renderReportPreview(data, config) {
    const container = document.getElementById('previewContainer');
    
    let html = `
        <div class="preview-report">
            <div class="report-header">
                <h1>${config.reportName}</h1>
                <div class="report-meta">
                    <p><strong>Report Type:</strong> ${REPORT_TYPES[config.reportType].title}</p>
                    <p><strong>Date Range:</strong> ${config.dateFrom} to ${config.dateTo}</p>
                    <p><strong>Generated By:</strong> ${config.generatedBy}</p>
                    <p><strong>Generated At:</strong> ${new Date(config.generatedAt).toLocaleString()}</p>
                </div>
            </div>
    `;
    
    // Executive Summary
    if (config.includeSummary) {
        html += renderExecutiveSummary(data.summary);
    }
    
    // Charts
    if (config.includeCharts && Object.keys(data.charts).length > 0) {
        html += renderChartsSection(data.charts);
    }
    
    // Detailed Data
    html += renderDetailedDataSection(data.details, config);
    
    // Audit Trail
    if (config.includeAuditTrail && data.audit.length > 0) {
        html += renderAuditTrailSection(data.audit);
    }
    
    html += '</div>';
    container.innerHTML = html;
}

function renderExecutiveSummary(summary) {
    let html = `
        <div class="summary-section">
            <h2>📊 Executive Summary</h2>
            <div class="summary-stats">
                <div class="summary-stat">
                    <h3>Total Records</h3>
                    <p class="stat-value">${summary.totalRecords}</p>
                </div>
    `;
    
    if (summary.inventoryStats) {
        html += `
                <div class="summary-stat">
                    <h3>Inventory Items</h3>
                    <p class="stat-value">${summary.inventoryStats.totalItems}</p>
                    <p class="stat-label">Total Value: $${summary.inventoryStats.totalValue.toFixed(2)}</p>
                </div>
                <div class="summary-stat ${summary.inventoryStats.lowStockItems > 0 ? 'alert' : ''}">
                    <h3>Low Stock Alerts</h3>
                    <p class="stat-value">${summary.inventoryStats.lowStockItems}</p>
                </div>
        `;
    }
    
    if (summary.productionStats) {
        html += `
                <div class="summary-stat">
                    <h3>Production Entries</h3>
                    <p class="stat-value">${summary.productionStats.totalEntries}</p>
                    <p class="stat-label">In: ${summary.productionStats.inboundQuantity} | Out: ${summary.productionStats.outboundQuantity}</p>
                </div>
        `;
    }
    
    if (summary.wastageStats) {
        html += `
                <div class="summary-stat alert">
                    <h3>Total Wastage</h3>
                    <p class="stat-value">${summary.wastageStats.totalWastage}</p>
                    <p class="stat-label">Cost Impact: $${summary.wastageStats.totalCostImpact.toFixed(2)}</p>
                </div>
        `;
    }
    
    html += `
            </div>
        </div>
    `;
    
    return html;
}

function renderChartsSection(charts) {
    let html = `
        <div class="charts-section">
            <h2>📈 Visual Analytics</h2>
            <div class="charts-grid">
    `;
    
    Object.entries(charts).forEach(([chartKey, chartData]) => {
        html += `
            <div class="chart-container">
                <h3>${chartData.title}</h3>
                <div class="chart-placeholder">
                    <p>📊 ${chartData.type.toUpperCase()} Chart</p>
                    <p>Data points: ${chartData.data.length}</p>
                    <div class="chart-preview">
        `;
        
        // Simple text representation of chart data
        chartData.data.slice(0, 5).forEach(point => {
            html += `<p>• ${point.label || point.date}: ${point.value || point.inbound || point.outbound}</p>`;
        });
        
        if (chartData.data.length > 5) {
            html += `<p>... and ${chartData.data.length - 5} more data points</p>`;
        }
        
        html += `
                    </div>
                </div>
            </div>
        `;
    });
    
    html += `
            </div>
        </div>
    `;
    
    return html;
}

function renderDetailedDataSection(details, config) {
    let html = `
        <div class="details-section">
            <h2>📋 Detailed Data</h2>
            <div class="data-table-container">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Type</th>
                            <th>Name</th>
                            <th>Category</th>
                            <th>Quantity</th>
                            <th>Location</th>
                            <th>Status</th>
    `;
    
    if (config.includeTimestamps) {
        html += '<th>Timestamp</th>';
    }
    
    html += `
                        </tr>
                    </thead>
                    <tbody>
    `;
    
    details.slice(0, 50).forEach(item => {
        html += `
                        <tr class="data-row ${item.status === 'Low Stock' || item.status === 'Expired' ? 'alert' : ''}">
                            <td><span class="type-badge ${item.type}">${item.type}</span></td>
                            <td>${item.name}</td>
                            <td>${item.category}</td>
                            <td>${item.quantity} ${item.unit || ''}</td>
                            <td>${item.location}</td>
                            <td><span class="status-badge ${item.status?.toLowerCase().replace(' ', '-')}">${item.status || 'N/A'}</span></td>
        `;
        
        if (config.includeTimestamps) {
            const timestamp = item.timestamp || item.lastUpdated || 'N/A';
            html += `<td>${timestamp !== 'N/A' ? new Date(timestamp).toLocaleString() : 'N/A'}</td>`;
        }
        
        html += '</tr>';
    });
    
    if (details.length > 50) {
        html += `
                        <tr>
                            <td colspan="${config.includeTimestamps ? '7' : '6'}" class="truncated-notice">
                                ... and ${details.length - 50} more records (showing first 50 in preview)
                            </td>
                        </tr>
        `;
    }
    
    html += `
                    </tbody>
                </table>
            </div>
        </div>
    `;
    
    return html;
}

function renderAuditTrailSection(auditData) {
    let html = `
        <div class="audit-section">
            <h2>🔍 Audit Trail</h2>
            <div class="audit-table-container">
                <table class="audit-table">
                    <thead>
                        <tr>
                            <th>Timestamp</th>
                            <th>Action</th>
                            <th>User</th>
                            <th>Item</th>
                            <th>Details</th>
                        </tr>
                    </thead>
                    <tbody>
    `;
    
    auditData.slice(0, 20).forEach(entry => {
        html += `
                        <tr>
                            <td>${new Date(entry.timestamp).toLocaleString()}</td>
                            <td><span class="action-badge ${entry.action.toLowerCase()}">${entry.action}</span></td>
                            <td>${entry.user}</td>
                            <td>${entry.itemName || entry.item}</td>
                            <td>${entry.details || 'N/A'}</td>
                        </tr>
        `;
    });
    
    if (auditData.length > 20) {
        html += `
                        <tr>
                            <td colspan="5" class="truncated-notice">
                                ... and ${auditData.length - 20} more audit entries
                            </td>
                        </tr>
        `;
    }
    
    html += `
                    </tbody>
                </table>
            </div>
        </div>
    `;
    
    return html;
}

function editReport() {
    document.getElementById('previewSection').style.display = 'none';
    document.getElementById('configSection').scrollIntoView({ behavior: 'smooth' });
}

function closePreview() {
    document.getElementById('previewSection').style.display = 'none';
}

// Main report generation with progress tracking
async function handleReportGeneration(event) {
    event.preventDefault();
    
    if (reportState.isGenerating) {
        alert('A report is already being generated. Please wait.');
        return;
    }
    
    if (!validateReportConfiguration()) {
        return;
    }
    
    const config = collectReportConfiguration();
    reportState.isGenerating = true;
    
    // Show loading modal
    showLoadingModal();
    
    try {
        // Simulate report generation with progress updates
        await generateReportWithProgress(config);
        
        // Generate the actual report
        const reportData = generateReportData(config);
        
        // Export the report
        await exportReport(reportData, config);
        
        // Save to history
        saveReportToHistory(config, reportData);
        
        // Update UI
        updateReportHistory();
        updateDashboardStats();
        
        // Show success message
        hideLoadingModal();
        showSuccessMessage(`Report "${config.reportName}" generated successfully!`);
        
        // Close configuration section
        closeConfiguration();
        
    } catch (error) {
        console.error('Report generation failed:', error);
        console.error('Error details:', {
            message: error.message,
            stack: error.stack,
            config: config
        });
        hideLoadingModal();
        showNotification(`Report generation failed: ${error.message}`, 'error');
    } finally {
        reportState.isGenerating = false;
    }
}

async function generateReportWithProgress(config) {
    const progressSteps = [
        { text: 'Initializing report generation...', duration: 500 },
        { text: 'Collecting inventory data...', duration: 800 },
        { text: 'Processing production records...', duration: 700 },
        { text: 'Analyzing wastage statistics...', duration: 600 },
        { text: 'Generating charts and analytics...', duration: 900 },
        { text: 'Compiling final report...', duration: 700 },
        { text: 'Formatting and exporting...', duration: 600 }
    ];
    
    let progress = 0;
    const progressIncrement = 100 / progressSteps.length;
    
    for (const step of progressSteps) {
        const loadingText = document.getElementById('loadingText');
        if (loadingText) {
            loadingText.textContent = step.text;
        }
        
        // Animate progress
        const targetProgress = Math.min(progress + progressIncrement, 100);
        await animateProgress(progress, targetProgress);
        progress = targetProgress;
        
        await new Promise(resolve => setTimeout(resolve, step.duration));
    }
}

async function animateProgress(start, end) {
    return new Promise(resolve => {
        const duration = 300;
        const startTime = Date.now();
        
        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const current = start + (end - start) * progress;
            
            const progressFill = document.getElementById('progressFill');
            const progressPercent = document.getElementById('progressPercent');
            
            if (progressFill) {
                progressFill.style.width = `${current}%`;
            }
            if (progressPercent) {
                progressPercent.textContent = Math.round(current);
            }
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                resolve();
            }
        };
        
        animate();
    });
}

function showLoadingModal() {
    const loadingModal = document.getElementById('loadingModal');
    if (loadingModal) {
        loadingModal.style.display = 'flex';
        const progressFill = document.getElementById('progressFill');
        const progressPercent = document.getElementById('progressPercent');
        if (progressFill) progressFill.style.width = '0%';
        if (progressPercent) progressPercent.textContent = '0';
    } else {
        // Show a simple notification instead
        showNotification('Generating report, please wait...', 'info');
    }
}

function hideLoadingModal() {
    const loadingModal = document.getElementById('loadingModal');
    if (loadingModal) {
        loadingModal.style.display = 'none';
    }
}

function showSuccessMessage(message) {
    // Create temporary success notification
    const notification = document.createElement('div');
    notification.className = 'success-notification';
    notification.innerHTML = `
        <div class="notification-content">
            <span class="success-icon">✅</span>
            <span class="success-message">${message}</span>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    }, 3000);
}

// Export functionality
async function exportReport(reportData, config) {
    try {
        console.log('Exporting report with format:', config.format);
        
        const format = config.format;
        
        switch (format) {
            case 'pdf':
                await exportToPDF(reportData, config);
                break;
            case 'csv':
                await exportToCSV(reportData, config);
                break;
            case 'html':
                await exportToHTML(reportData, config);
                break;
            default:
                // Default to CSV if format is not recognized
                await exportToCSV(reportData, config);
        }
        
        console.log('Report exported successfully');
    } catch (error) {
        console.error('Export error:', error);
        throw new Error(`Failed to export report as ${config.format}: ${error.message}`);
    }
}

function generateExportContent(reportData, config) {
    // Generate comprehensive report content
    let content = {
        header: {
            title: config.reportName,
            reportType: REPORT_TYPES[config.reportType].title,
            dateRange: `${config.dateFrom} to ${config.dateTo}`,
            generatedBy: config.generatedBy,
            generatedAt: new Date(config.generatedAt).toLocaleString()
        },
        summary: reportData.summary,
        details: reportData.details,
        charts: config.includeCharts ? reportData.charts : null,
        audit: config.includeAuditTrail ? reportData.audit : null
    };
    
    return content;
}

async function exportToPDF(reportData, config) {
    try {
        console.log('Starting PDF export...', { reportData, config });
        
        // Check if jsPDF is available
        if (typeof window.jsPDF === 'undefined') {
            console.warn('jsPDF not available, using fallback');
            return exportPDFFallback(reportData, config);
        }
        
        // Create new PDF document
        const { jsPDF } = window.jsPDF;
        const doc = new jsPDF();
        
        // Set font
        doc.setFont('helvetica');
        
        // Add title
        doc.setFontSize(20);
        doc.text(config.reportName, 20, 30);
        
        // Add metadata
        doc.setFontSize(12);
        let yPos = 50;
        doc.text(`Generated: ${new Date(config.generatedAt).toLocaleString()}`, 20, yPos);
        yPos += 10;
        doc.text(`Period: ${config.dateFrom} to ${config.dateTo}`, 20, yPos);
        yPos += 10;
        doc.text(`Generated by: ${config.generatedBy}`, 20, yPos);
        yPos += 20;
        
        // Add summary section
        doc.setFontSize(16);
        doc.text('Summary', 20, yPos);
        yPos += 15;
        
        doc.setFontSize(12);
        doc.text(`Total Items: ${reportData.summary.totalItems || 0}`, 20, yPos);
        yPos += 10;
        doc.text(`Categories: ${reportData.summary.categories || 0}`, 20, yPos);
        yPos += 10;
        doc.text(`Active Items: ${reportData.summary.activeItems || 0}`, 20, yPos);
        yPos += 20;
        
        // Add data section
        doc.setFontSize(16);
        doc.text('Data Details', 20, yPos);
        yPos += 15;
        
        // Table headers
        doc.setFontSize(10);
        doc.text('Name', 20, yPos);
        doc.text('Category', 80, yPos);
        doc.text('Status', 140, yPos);
        yPos += 10;
        
        // Draw line under headers
        doc.line(20, yPos - 2, 180, yPos - 2);
        yPos += 5;
        
        // Add data rows
        reportData.details.forEach((item, index) => {
            if (yPos > 270) { // Check if we need a new page
                doc.addPage();
                yPos = 30;
            }
            
            doc.text(String(item.name || ''), 20, yPos);
            doc.text(String(item.category || ''), 80, yPos);
            doc.text(String(item.status || ''), 140, yPos);
            yPos += 8;
        });
        
        // Save the PDF
        const filename = `${config.reportName.replace(/[^a-z0-9]/gi, '_')}.pdf`;
        doc.save(filename);
        
        console.log('PDF export completed successfully');
        
    } catch (error) {
        console.error('PDF export failed:', error);
        return exportPDFFallback(reportData, config);
    }
}

// Fallback function for when PDF generation fails
function exportPDFFallback(reportData, config) {
    console.log('Using PDF fallback method');
    
    const htmlContent = `<!DOCTYPE html>
<html>
<head>
    <title>${config.reportName}</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { border-bottom: 2px solid #333; padding-bottom: 15px; margin-bottom: 20px; }
        .summary { margin: 20px 0; }
        .summary-item { display: inline-block; margin-right: 30px; padding: 10px; border: 1px solid #ddd; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
        .print-info { background: #f0f8ff; padding: 15px; margin: 20px 0; border-radius: 5px; }
        @media print {
            .print-info { display: none; }
        }
    </style>
</head>
<body>
    <div class="print-info">
        <strong>📄 To save as PDF:</strong> Use your browser's Print function (Ctrl+P) and select "Save as PDF"
    </div>
    
    <div class="header">
        <h1>${config.reportName}</h1>
        <p><strong>Generated:</strong> ${new Date(config.generatedAt).toLocaleString()}</p>
        <p><strong>Period:</strong> ${config.dateFrom} to ${config.dateTo}</p>
        <p><strong>Generated by:</strong> ${config.generatedBy}</p>
    </div>
    
    <div class="summary">
        <h2>Summary</h2>
        <div class="summary-item">
            <strong>Total Items:</strong> ${reportData.summary.totalItems || 0}
        </div>
        <div class="summary-item">
            <strong>Categories:</strong> ${reportData.summary.categories || 0}
        </div>
        <div class="summary-item">
            <strong>Active Items:</strong> ${reportData.summary.activeItems || 0}
        </div>
    </div>
    
    <div>
        <h2>Detailed Data</h2>
        <table>
            <thead>
                <tr>
                    <th>Name</th>
                    <th>Category</th>
                    <th>Status</th>
                    <th>Value</th>
                </tr>
            </thead>
            <tbody>
                ${reportData.details.map(item => `
                    <tr>
                        <td>${item.name || ''}</td>
                        <td>${item.category || ''}</td>
                        <td>${item.status || ''}</td>
                        <td>${item.value || ''}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    </div>
</body>
</html>`;
    
    // Create and download HTML file
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${config.reportName.replace(/[^a-z0-9]/gi, '_')}_print.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

async function exportToCSV(reportData, config) {
    let csvContent = "data:text/csv;charset=utf-8,";
    
    // CSV Header
    const headers = ['Type', 'Name', 'Category', 'Quantity', 'Unit', 'Location', 'Status'];
    if (config.includeTimestamps) {
        headers.push('Timestamp');
    }
    csvContent += headers.join(',') + '\n';
    
    // CSV Data
    reportData.details.forEach(item => {
        const row = [
            item.type,
            `"${item.name}"`,
            item.category,
            item.quantity,
            item.unit || '',
            item.location,
            item.status || ''
        ];
        
        if (config.includeTimestamps) {
            const timestamp = item.timestamp || item.lastUpdated || '';
            row.push(timestamp ? new Date(timestamp).toLocaleString() : '');
        }
        
        csvContent += row.join(',') + '\n';
    });
    
    // Trigger download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `${config.reportName.replace(/[^a-z0-9]/gi, '_')}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    } else {
        throw new Error('Browser does not support file download');
    }
}

async function exportToHTML(reportData, config) {
    try {
        const htmlContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>${config.reportName}</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 20px; }
                    .header { border-bottom: 2px solid #333; padding-bottom: 10px; margin-bottom: 20px; }
                    .data-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                    .data-table th, .data-table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                    .data-table th { background-color: #f2f2f2; }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>${config.reportName}</h1>
                    <p><strong>Generated:</strong> ${new Date(config.generatedAt).toLocaleString()}</p>
                    <p><strong>Period:</strong> ${config.dateFrom} to ${config.dateTo}</p>
                    <p><strong>Generated by:</strong> ${config.generatedBy}</p>
                </div>
                
                <h2>Report Data</h2>
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Name</th>
                            <th>Category</th>
                            <th>Value</th>
                            <th>Status</th>
                            <th>Timestamp</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${reportData.details.map(item => `
                            <tr>
                                <td>${item.id || ''}</td>
                                <td>${item.name || ''}</td>
                                <td>${item.category || ''}</td>
                                <td>${item.value || ''}</td>
                                <td>${item.status || ''}</td>
                                <td>${item.timestamp ? new Date(item.timestamp).toLocaleString() : ''}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </body>
            </html>
        `;
        
        // Create and download file
        const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8;' });
        const link = document.createElement('a');
        
        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', `${config.reportName.replace(/[^a-z0-9]/gi, '_')}.html`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        } else {
            throw new Error('Browser does not support file download');
        }
        
    } catch (error) {
        console.error('HTML export error:', error);
        throw error;
    }
}

function downloadReport(reportData) {
    // Simulate file download
    console.log('Downloading report:', reportData.filename);
    
    // In a real implementation, this would trigger an actual file download
    // For demo purposes, we'll just log the action
}

// Main Report Generation Function (called from UI)
function generateReport(quickConfig = null) {
    // Reset generation state first to handle any stuck states
    reportState.isGenerating = false;
    
    if (quickConfig) {
        // Handle quick report generation
        const mockEvent = { preventDefault: () => {} };
        reportState.selectedReportType = quickConfig.type;
        reportState.reportConfiguration = quickConfig;
        handleReportGeneration(mockEvent);
    } else {
        // Handle standard report generation
        const form = document.getElementById('reportForm');
        if (form && form.style.display !== 'none') {
            // Create a mock form submit event since we don't have an actual form element
            const mockEvent = { preventDefault: () => {} };
            handleReportGeneration(mockEvent);
        } else {
            showNotification('Please select a report category first by clicking on one of the category cards above', 'error');
        }
    }
}

// Notification System
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-icon">${getNotificationIcon(type)}</span>
            <span class="notification-message">${message}</span>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Auto-remove after 3 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    }, 3000);
}

function getNotificationIcon(type) {
    switch (type) {
        case 'success': return '✅';
        case 'error': return '❌';
        case 'warning': return '⚠️';
        default: return 'ℹ️';
    }
}

// Statistics Update Functions
function updateStatistics() {
    const reports = JSON.parse(localStorage.getItem('generatedReports') || '[]');
    const templates = JSON.parse(localStorage.getItem('reportTemplates') || '[]');
    const today = new Date().toDateString();
    
    // Update total reports
    document.getElementById('totalReports').textContent = reports.length;
    
    // Update today's reports
    const todayReports = reports.filter(report => 
        new Date(report.generatedAt).toDateString() === today
    );
    document.getElementById('reportsToday').textContent = todayReports.length;
    
    // Update scheduled reports (mock data for now)
    document.getElementById('scheduledReports').textContent = '0';
    
    // Update templates count
    document.getElementById('totalTemplates').textContent = templates.length;
}

// Report history management
function saveReportToHistory(config, data) {
    const reports = JSON.parse(localStorage.getItem('generatedReports') || '[]');
    
    const reportRecord = {
        id: Date.now().toString(),
        name: config.reportName,
        type: config.reportType,
        dateRange: `${config.dateFrom} to ${config.dateTo}`,
        generatedAt: config.generatedAt,
        generatedBy: config.generatedBy,
        format: config.format,
        status: 'completed',
        recordCount: data.details.length
    };
    
    reports.push(reportRecord);
    
    // Keep only the last 50 reports
    if (reports.length > 50) {
        reports.splice(0, reports.length - 50);
    }
    
    localStorage.setItem('generatedReports', JSON.stringify(reports));
}

function loadReportHistory() {
    updateReportHistory();
}

function updateReportHistory() {
    const reports = JSON.parse(localStorage.getItem('generatedReports') || '[]');
    const tbody = document.getElementById('recentReportsBody');
    
    if (reports.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="no-data">No reports generated yet</td>
            </tr>
        `;
        return;
    }
    
    // Show most recent reports first
    const recentReports = reports.slice(-10).reverse();
    
    tbody.innerHTML = recentReports.map(report => `
        <tr>
            <td>${report.name}</td>
            <td><span class="type-badge ${report.type}">${REPORT_TYPES[report.type]?.title || report.type}</span></td>
            <td>${report.dateRange}</td>
            <td>${new Date(report.generatedAt).toLocaleString()}</td>
            <td><span class="format-badge ${report.format}">${report.format.toUpperCase()}</span></td>
            <td><span class="status-badge ${report.status}">${report.status}</span></td>
            <td>
                <button onclick="regenerateReport('${report.id}')" class="action-btn regenerate" title="Regenerate">🔄</button>
                <button onclick="deleteReport('${report.id}')" class="action-btn delete" title="Delete">🗑️</button>
            </td>
        </tr>
    `).join('');
}

function regenerateReport(reportId) {
    const reports = JSON.parse(localStorage.getItem('generatedReports') || '[]');
    const report = reports.find(r => r.id === reportId);
    
    if (!report) {
        alert('Report not found.');
        return;
    }
    
    if (confirm(`Regenerate report "${report.name}"?`)) {
        // Auto-fill the form with the previous configuration
        selectReportType(report.type);
        document.getElementById('reportName').value = `${report.name} (Regenerated)`;
        
        // Note: We can't restore all previous settings without storing them
        alert('Report configuration loaded. Please review settings and generate the report.');
    }
}

function deleteReport(reportId) {
    if (confirm('Are you sure you want to delete this report record?')) {
        const reports = JSON.parse(localStorage.getItem('generatedReports') || '[]');
        const updatedReports = reports.filter(r => r.id !== reportId);
        localStorage.setItem('generatedReports', JSON.stringify(updatedReports));
        
        updateReportHistory();
        updateDashboardStats();
    }
}

function clearReportHistory() {
    if (confirm('Are you sure you want to clear all report history? This action cannot be undone.')) {
        localStorage.removeItem('generatedReports');
        updateReportHistory();
        updateDashboardStats();
    }
}

// Quick Report Modal Functions
function showQuickReportModal() {
    document.getElementById('quickReportModal').style.display = 'flex';
}

function closeQuickReportModal() {
    document.getElementById('quickReportModal').style.display = 'none';
}

function generateQuickReport() {
    const reportType = document.getElementById('quickReportType').value;
    const format = document.getElementById('quickReportFormat').value;
    const emailReport = document.getElementById('quickReportEmail').checked;
    
    if (!reportType) {
        showNotification('Please select a report type', 'error');
        return;
    }
    
    // Set up quick report configuration
    const quickReportConfig = {
        type: reportType,
        format: format,
        emailAfterGeneration: emailReport,
        dateRange: 'today',
        quickGeneration: true
    };
    
    closeQuickReportModal();
    generateReport(quickReportConfig);
}

// Search and Filter Functions
function searchReports() {
    const searchTerm = document.getElementById('searchReports').value.toLowerCase();
    const reportRows = document.querySelectorAll('#recentReportsBody tr');
    
    reportRows.forEach(row => {
        const reportName = row.cells[0].textContent.toLowerCase();
        const category = row.cells[1].textContent.toLowerCase();
        const shouldShow = reportName.includes(searchTerm) || category.includes(searchTerm);
        row.style.display = shouldShow ? '' : 'none';
    });
}

function filterReports() {
    const categoryFilter = document.getElementById('filterCategory').value;
    const statusFilter = document.getElementById('filterStatus').value;
    const reportRows = document.querySelectorAll('#recentReportsBody tr');
    
    reportRows.forEach(row => {
        const category = row.cells[1].textContent.toLowerCase();
        const status = row.cells[4].textContent.toLowerCase();
        
        const categoryMatch = !categoryFilter || category.includes(categoryFilter);
        const statusMatch = !statusFilter || status.includes(statusFilter);
        
        row.style.display = (categoryMatch && statusMatch) ? '' : 'none';
    });
}

function refreshReports() {
    showNotification('Refreshing reports...', 'info');
    loadRecentReports();
    updateStatistics();
}

function importTemplate() {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.json';
    fileInput.onchange = function(event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                try {
                    const template = JSON.parse(e.target.result);
                    // Validate template structure
                    if (template.name && template.configuration) {
                        // Add template to local storage
                        const templates = JSON.parse(localStorage.getItem('reportTemplates') || '[]');
                        templates.push(template);
                        localStorage.setItem('reportTemplates', JSON.stringify(templates));
                        
                        showNotification('Template imported successfully', 'success');
                        loadReportTemplates();
                        updateStatistics();
                    } else {
                        showNotification('Invalid template file format', 'error');
                    }
                } catch (error) {
                    showNotification('Error reading template file', 'error');
                }
            };
            reader.readAsText(file);
        }
    };
    fileInput.click();
}

// CSS for dynamic content (inject into page)
const dynamicStyles = `
<style>
.success-notification {
    position: fixed;
    top: 20px;
    right: 20px;
    background: #4CAF50;
    color: white;
    padding: 15px 20px;
    border-radius: 5px;
    box-shadow: 0 4px 8px rgba(0,0,0,0.2);
    z-index: 10000;
    animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
    from { transform: translateX(100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
}

.notification-content {
    display: flex;
    align-items: center;
    gap: 10px;
}

.report-card.selected {
    border-color: #2196F3;
    background: linear-gradient(135deg, #E3F2FD 0%, #BBDEFB 100%);
    transform: scale(1.02);
}

.preview-report {
    background: white;
    border-radius: 8px;
    padding: 30px;
    box-shadow: 0 4px 8px rgba(0,0,0,0.1);
}

.report-header {
    border-bottom: 2px solid #e0e0e0;
    padding-bottom: 20px;
    margin-bottom: 30px;
}

.report-meta p {
    margin: 5px 0;
    color: #666;
}

.summary-stats {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 20px;
    margin: 20px 0;
}

.summary-stat {
    padding: 20px;
    border-radius: 8px;
    border: 1px solid #e0e0e0;
    background: #f9f9f9;
}

.summary-stat.alert {
    border-color: #f44336;
    background: #ffebee;
}

.stat-value {
    font-size: 2em;
    font-weight: bold;
    color: #333;
    margin: 10px 0;
}

.stat-label {
    color: #666;
    font-size: 0.9em;
}

.charts-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 20px;
    margin: 20px 0;
}

.chart-container {
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    padding: 20px;
    background: white;
}

.chart-placeholder {
    text-align: center;
    padding: 40px 20px;
    background: #f5f5f5;
    border-radius: 5px;
    margin-top: 10px;
}

.chart-preview {
    text-align: left;
    margin-top: 15px;
    font-size: 0.9em;
}

.data-table {
    width: 100%;
    border-collapse: collapse;
    margin: 20px 0;
    font-size: 0.9em;
}

.data-table th,
.data-table td {
    border: 1px solid #ddd;
    padding: 12px 8px;
    text-align: left;
}

.data-table th {
    background: #f2f2f2;
    font-weight: bold;
}

.data-row.alert {
    background: #fff3cd;
}

.type-badge,
.status-badge,
.action-badge,
.format-badge {
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 0.8em;
    font-weight: bold;
    text-transform: uppercase;
}

.type-badge.inventory { background: #e3f2fd; color: #1976d2; }
.type-badge.production { background: #e8f5e8; color: #388e3c; }
.type-badge.wastage { background: #ffebee; color: #d32f2f; }
.type-badge.ingredient { background: #f3e5f5; color: #7b1fa2; }

.status-badge.normal { background: #e8f5e8; color: #388e3c; }
.status-badge.low-stock { background: #fff3cd; color: #f57c00; }
.status-badge.expired { background: #ffebee; color: #d32f2f; }
.status-badge.completed { background: #e8f5e8; color: #388e3c; }

.format-badge.pdf { background: #ffebee; color: #d32f2f; }
.format-badge.csv { background: #e8f5e8; color: #388e3c; }
.format-badge.html { background: #e3f2fd; color: #1976d2; }

.truncated-notice {
    text-align: center;
    font-style: italic;
    color: #666;
    background: #f9f9f9;
}

.action-btn {
    background: none;
    border: none;
    cursor: pointer;
    font-size: 1.2em;
    padding: 5px;
    border-radius: 3px;
    margin: 0 2px;
}

.action-btn:hover {
    background: #f0f0f0;
}

.action-btn.delete:hover {
    background: #ffebee;
    color: #d32f2f;
}

.action-btn.regenerate:hover {
    background: #e3f2fd;
    color: #1976d2;
}

.no-data {
    text-align: center;
    color: #666;
    font-style: italic;
    padding: 40px;
}
</style>
`;

// Inject dynamic styles
document.head.insertAdjacentHTML('beforeend', dynamicStyles);

console.log('PAU Inventory Report Generation module loaded successfully');

// Navigation Functions
function goBackToDashboard() {
    const userRole = sessionStorage.getItem('userRole');
    if (userRole === 'admin') {
        window.location.href = 'supervisor-dashboard.html'; // Admin uses supervisor dashboard
    } else if (userRole === 'supervisor') {
        window.location.href = 'supervisor-dashboard.html';
    } else {
        window.location.href = 'staff-dashboard.html';
    }
}

// Category selection and report type mapping functions
function selectCategory(category) {
    // Show the report form
    const reportForm = document.getElementById('reportForm');
    if (reportForm) {
        reportForm.style.display = 'block';
        reportForm.scrollIntoView({ behavior: 'smooth' });
    }
    
    // Set the category in the dropdown
    const reportCategorySelect = document.getElementById('reportCategory');
    if (reportCategorySelect) {
        reportCategorySelect.value = category;
        updateReportTypes();
    }
}

function updateReportTypes() {
    const categorySelect = document.getElementById('reportCategory');
    const typeSelect = document.getElementById('reportType');
    
    if (!categorySelect || !typeSelect) return;
    
    const selectedCategory = categorySelect.value;
    typeSelect.innerHTML = '<option value="">Select Report Type</option>';
    
    // Filter report types by category
    Object.entries(REPORT_TYPES).forEach(([key, reportType]) => {
        if (!selectedCategory || reportType.category === selectedCategory) {
            const option = document.createElement('option');
            option.value = key;
            option.textContent = reportType.title;
            typeSelect.appendChild(option);
        }
    });
}

function updateReportDescription() {
    const typeSelect = document.getElementById('reportType');
    const previewContent = document.getElementById('previewContent');
    
    if (!typeSelect) return;
    
    const selectedType = typeSelect.value;
    
    // Update the report state
    if (selectedType) {
        reportState.selectedReportType = selectedType;
    }
    
    if (previewContent) {
        if (selectedType && REPORT_TYPES[selectedType]) {
            const reportType = REPORT_TYPES[selectedType];
            previewContent.innerHTML = `
                <div class="report-preview-header">
                    <h5>${reportType.icon} ${reportType.title}</h5>
                    <p>${reportType.description}</p>
                </div>
                <div class="report-preview-details">
                    <h6>Data Sources:</h6>
                    <ul>
                        ${reportType.dataSource.map(source => `<li>${source.charAt(0).toUpperCase() + source.slice(1)}</li>`).join('')}
                    </ul>
                    <h6>Available Charts:</h6>
                    <ul>
                        ${reportType.charts.map(chart => `<li>${chart.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</li>`).join('')}
                    </ul>
                </div>
            `;
        } else {
            previewContent.innerHTML = '<p>Select a report type to see preview</p>';
        }
    }
}

function updateDateRange() {
    const periodSelect = document.getElementById('reportPeriod');
    const customDateRange = document.getElementById('customDateRange');
    
    if (!periodSelect || !customDateRange) return;
    
    if (periodSelect.value === 'custom') {
        customDateRange.style.display = 'block';
    } else {
        customDateRange.style.display = 'none';
    }
}

function resetForm() {
    const form = document.getElementById('reportForm');
    if (form) {
        form.style.display = 'none';
    }
    
    // Reset all form inputs
    const inputs = ['reportCategory', 'reportType', 'reportPeriod', 'reportFormat'];
    inputs.forEach(id => {
        const element = document.getElementById(id);
        if (element) element.selectedIndex = 0;
    });
    
    // Reset preview
    const previewContent = document.getElementById('previewContent');
    if (previewContent) {
        previewContent.innerHTML = '<p>Select a report type to see preview</p>';
    }
    
    // Hide custom date range
    const customDateRange = document.getElementById('customDateRange');
    if (customDateRange) {
        customDateRange.style.display = 'none';
    }
}

// Template management functions
function saveTemplate() {
    const categorySelect = document.getElementById('reportCategory');
    const typeSelect = document.getElementById('reportType');
    const periodSelect = document.getElementById('reportPeriod');
    const formatSelect = document.getElementById('reportFormat');
    
    if (!categorySelect?.value || !typeSelect?.value) {
        alert('Please select at least a category and report type before saving as template.');
        return;
    }
    
    const templateName = prompt('Enter template name:');
    if (!templateName) return;
    
    const template = {
        id: 'TPL' + Date.now(),
        name: templateName,
        category: categorySelect.value,
        reportType: typeSelect.value,
        period: periodSelect.value,
        format: formatSelect.value,
        createdAt: new Date().toISOString()
    };
    
    // Save to localStorage
    const templates = JSON.parse(localStorage.getItem('reportTemplates') || '[]');
    templates.push(template);
    localStorage.setItem('reportTemplates', JSON.stringify(templates));
    
    alert(`Template "${templateName}" saved successfully!`);
    updateStatistics();
}

function showCreateTemplateModal() {
    const modal = document.getElementById('createTemplateModal');
    if (modal) {
        modal.style.display = 'block';
    }
}

function closeCreateTemplateModal() {
    const modal = document.getElementById('createTemplateModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

function saveReportTemplate() {
    const nameInput = document.getElementById('templateName');
    const descInput = document.getElementById('templateDescription');
    
    if (!nameInput?.value) {
        alert('Please enter a template name.');
        return;
    }
    
    const template = {
        id: 'TPL' + Date.now(),
        name: nameInput.value,
        description: descInput.value,
        createdAt: new Date().toISOString()
    };
    
    const templates = JSON.parse(localStorage.getItem('reportTemplates') || '[]');
    templates.push(template);
    localStorage.setItem('reportTemplates', JSON.stringify(templates));
    
    closeCreateTemplateModal();
    alert(`Template "${template.name}" created successfully!`);
    updateStatistics();
}
