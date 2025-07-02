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
    'stock-levels': {
        title: 'Stock Levels Report',
        description: 'Current inventory levels, low stock alerts, and stock movement analysis',
        icon: '📦',
        dataSource: ['inventory'],
        filters: ['category', 'outlet', 'date'],
        charts: ['stockLevels', 'lowStockAlerts', 'categoryDistribution']
    },
    'production-output': {
        title: 'Production Output Report',
        description: 'Detailed production metrics, inbound/outbound tracking, and efficiency analysis',
        icon: '🏭',
        dataSource: ['production'],
        filters: ['date', 'category', 'outlet'],
        charts: ['productionTrends', 'inboundOutbound', 'efficiency']
    },
    'wastage-statistics': {
        title: 'Wastage Statistics Report',
        description: 'Comprehensive wastage analysis by location, reason, and financial impact',
        icon: '🗑️',
        dataSource: ['wastage'],
        filters: ['date', 'outlet', 'category'],
        charts: ['wastageByReason', 'costImpact', 'trends']
    },
    'inventory-movement': {
        title: 'Inventory Movement Report',
        description: 'Track all inventory transactions, transfers, and stock adjustments',
        icon: '🔄',
        dataSource: ['inventory', 'production', 'wastage'],
        filters: ['date', 'category', 'outlet'],
        charts: ['movementFlow', 'transactionTypes', 'reconciliation']
    },
    'sales-performance': {
        title: 'Sales Performance Report',
        description: 'Revenue analysis, top-selling products, and outlet performance metrics',
        icon: '💰',
        dataSource: ['production', 'inventory'],
        filters: ['date', 'outlet', 'category'],
        charts: ['revenue', 'topProducts', 'outletPerformance']
    },
    'comprehensive': {
        title: 'Comprehensive System Report',
        description: 'Complete system overview including all modules and key performance indicators',
        icon: '📊',
        dataSource: ['inventory', 'production', 'wastage', 'ingredients'],
        filters: ['date', 'outlet'],
        charts: ['systemOverview', 'kpiSummary', 'trendsAnalysis']
    }
};

// Initialize the report generation module
document.addEventListener('DOMContentLoaded', function() {
    initializeReportModule();
});

function initializeReportModule() {
    // Check authentication and role permissions
    checkAuthenticationAndPermissions();
    
    // Initialize UI components
    initializeUI();
    
    // Load existing report history
    loadReportHistory();
    
    // Start real-time clock
    updateCurrentTime();
    setInterval(updateCurrentTime, 1000);
    
    // Set up form validation and event listeners
    setupEventListeners();
    
    console.log('Report Generation module initialized');
}

function checkAuthenticationAndPermissions() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    
    if (!currentUser.username) {
        alert('Please log in to access the report generation system.');
        window.location.href = 'index.html';
        return;
    }
    
    // Only supervisors can access report generation
    if (currentUser.role !== 'supervisor') {
        alert('Access denied. Only supervisors can generate reports.');
        window.location.href = currentUser.role === 'staff' ? 'staff-dashboard.html' : 'index.html';
        return;
    }
    
    reportState.currentUser = currentUser;
    
    // Update UI with user information
    document.getElementById('welcomeMessage').textContent = `Welcome, ${currentUser.username}!`;
    document.getElementById('userRoleBadge').textContent = currentUser.role.charAt(0).toUpperCase() + currentUser.role.slice(1);
}

function initializeUI() {
    // Set default date range (last 30 days)
    const today = new Date();
    const thirtyDaysAgo = new Date(today.getTime() - (30 * 24 * 60 * 60 * 1000));
    
    document.getElementById('dateTo').value = today.toISOString().split('T')[0];
    document.getElementById('dateFrom').value = thirtyDaysAgo.toISOString().split('T')[0];
    
    // Update dashboard statistics
    updateDashboardStats();
}

function updateDashboardStats() {
    const reports = JSON.parse(localStorage.getItem('generatedReports') || '[]');
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    // Count reports generated this month
    const thisMonthReports = reports.filter(report => {
        const reportDate = new Date(report.generatedAt);
        return reportDate.getMonth() === currentMonth && reportDate.getFullYear() === currentYear;
    });
    
    document.getElementById('totalReports').textContent = thisMonthReports.length;
    
    // Last report date
    if (reports.length > 0) {
        const lastReport = reports[reports.length - 1];
        document.getElementById('lastReportDate').textContent = new Date(lastReport.generatedAt).toLocaleDateString();
    }
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
    // Report configuration form submission
    document.getElementById('reportConfigForm').addEventListener('submit', handleReportGeneration);
    
    // Logout functionality
    document.getElementById('logoutBtn').addEventListener('click', function() {
        if (confirm('Are you sure you want to logout?')) {
            localStorage.removeItem('currentUser');
            window.location.href = 'index.html';
        }
    });
    
    // Date validation
    document.getElementById('dateFrom').addEventListener('change', validateDateRange);
    document.getElementById('dateTo').addEventListener('change', validateDateRange);
}

function validateDateRange() {
    const dateFrom = document.getElementById('dateFrom').value;
    const dateTo = document.getElementById('dateTo').value;
    
    if (dateFrom && dateTo && new Date(dateFrom) > new Date(dateTo)) {
        alert('Start date cannot be later than end date.');
        document.getElementById('dateFrom').value = '';
        document.getElementById('dateTo').value = '';
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
    const form = document.getElementById('reportConfigForm');
    const formData = new FormData(form);
    
    // Check required fields
    if (!formData.get('reportName') || !formData.get('reportFormat') || 
        !formData.get('dateFrom') || !formData.get('dateTo')) {
        alert('Please fill in all required fields.');
        return false;
    }
    
    // Validate date range
    const dateFrom = new Date(formData.get('dateFrom'));
    const dateTo = new Date(formData.get('dateTo'));
    const today = new Date();
    
    if (dateFrom > today || dateTo > today) {
        alert('Dates cannot be in the future.');
        return false;
    }
    
    if (dateFrom > dateTo) {
        alert('Start date cannot be later than end date.');
        return false;
    }
    
    return true;
}

function collectReportConfiguration() {
    const form = document.getElementById('reportConfigForm');
    const formData = new FormData(form);
    
    return {
        reportType: reportState.selectedReportType,
        reportName: formData.get('reportName'),
        format: formData.get('reportFormat'),
        dateFrom: formData.get('dateFrom'),
        dateTo: formData.get('dateTo'),
        categoryFilter: formData.get('categoryFilter') || 'all',
        outletFilter: formData.get('outletFilter') || 'all',
        includeCharts: formData.get('includeCharts') === 'on',
        includeSummary: formData.get('includeSummary') === 'on',
        includeTimestamps: formData.get('includeTimestamps') === 'on',
        includeAuditTrail: formData.get('includeAuditTrail') === 'on',
        generatedBy: reportState.currentUser.username,
        generatedAt: new Date().toISOString()
    };
}

// Data aggregation and report generation
function generateReportData(config) {
    const reportType = REPORT_TYPES[config.reportType];
    let aggregatedData = {
        summary: {},
        details: [],
        charts: {},
        audit: []
    };
    
    // Collect data from different sources based on report type
    if (reportType.dataSource.includes('inventory')) {
        aggregatedData = mergeInventoryData(aggregatedData, config);
    }
    
    if (reportType.dataSource.includes('production')) {
        aggregatedData = mergeProductionData(aggregatedData, config);
    }
    
    if (reportType.dataSource.includes('wastage')) {
        aggregatedData = mergeWastageData(aggregatedData, config);
    }
    
    if (reportType.dataSource.includes('ingredients')) {
        aggregatedData = mergeIngredientsData(aggregatedData, config);
    }
    
    // Generate charts data if requested
    if (config.includeCharts) {
        aggregatedData.charts = generateChartsData(aggregatedData, config);
    }
    
    // Generate summary statistics
    aggregatedData.summary = generateSummaryStats(aggregatedData, config);
    
    return aggregatedData;
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
        hideLoadingModal();
        alert('Failed to generate report. Please try again.');
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
        document.getElementById('loadingText').textContent = step.text;
        
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
            
            document.getElementById('progressFill').style.width = `${current}%`;
            document.getElementById('progressPercent').textContent = Math.round(current);
            
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
    document.getElementById('loadingModal').style.display = 'flex';
    document.getElementById('progressFill').style.width = '0%';
    document.getElementById('progressPercent').textContent = '0';
}

function hideLoadingModal() {
    document.getElementById('loadingModal').style.display = 'none';
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
    const format = config.format;
    const reportContent = generateExportContent(reportData, config);
    
    switch (format) {
        case 'pdf':
            await exportToPDF(reportContent, config);
            break;
        case 'csv':
            await exportToCSV(reportData, config);
            break;
        case 'html':
            await exportToHTML(reportContent, config);
            break;
        default:
            throw new Error('Unsupported export format');
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

async function exportToPDF(content, config) {
    // Simulate PDF generation (in real implementation, would use a PDF library)
    const pdfData = {
        filename: `${config.reportName.replace(/[^a-z0-9]/gi, '_')}.pdf`,
        content: content,
        format: 'pdf'
    };
    
    // Trigger download simulation
    downloadReport(pdfData);
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
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${config.reportName.replace(/[^a-z0-9]/gi, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

async function exportToHTML(content, config) {
    const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>${content.header.title}</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                .header { border-bottom: 2px solid #333; padding-bottom: 10px; margin-bottom: 20px; }
                .summary-stats { display: flex; gap: 20px; margin: 20px 0; }
                .summary-stat { border: 1px solid #ddd; padding: 15px; border-radius: 5px; }
                .data-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                .data-table th, .data-table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                .data-table th { background-color: #f2f2f2; }
                .alert { background-color: #ffe6e6; }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>${content.header.title}</h1>
                <p><strong>Report Type:</strong> ${content.header.reportType}</p>
                <p><strong>Date Range:</strong> ${content.header.dateRange}</p>
                <p><strong>Generated By:</strong> ${content.header.generatedBy}</p>
                <p><strong>Generated At:</strong> ${content.header.generatedAt}</p>
            </div>
            ${renderExecutiveSummary(content.summary)}
            ${renderDetailedDataSection(content.details, config)}
            ${content.audit ? renderAuditTrailSection(content.audit) : ''}
        </body>
        </html>
    `;
    
    // Trigger download
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${config.reportName.replace(/[^a-z0-9]/gi, '_')}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

function downloadReport(reportData) {
    // Simulate file download
    console.log('Downloading report:', reportData.filename);
    
    // In a real implementation, this would trigger an actual file download
    // For demo purposes, we'll just log the action
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

// Navigation functions
function goBackToDashboard() {
    const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
    if (user.role === 'supervisor') {
        window.location.href = 'supervisor-dashboard.html';
    } else {
        window.location.href = 'staff-dashboard.html';
    }
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
