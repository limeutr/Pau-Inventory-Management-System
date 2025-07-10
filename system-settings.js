// PAU Inventory Management System - System Settings Module
// Comprehensive system configuration and management

// Global state management
let settingsState = {
    currentUser: null,
    settings: {},
    originalSettings: {},
    hasUnsavedChanges: false,
    autoSaveEnabled: true,
    lastSavedTime: null
};

// Default system settings
const DEFAULT_SETTINGS = {
    general: {
        systemName: 'PAU Inventory Management System',
        organizationName: 'PAU University',
        systemVersion: '1.0.0',
        timezone: 'UTC',
        dateFormat: 'MM/DD/YYYY',
        currency: 'USD',
        businessStart: '08:00',
        businessEnd: '17:00',
        lowStockThreshold: 20,
        autoReorder: false
    },
    security: {
        minPasswordLength: 8,
        requireUppercase: true,
        requireNumbers: true,
        requireSpecialChars: false,
        sessionTimeout: 30,
        maxLoginAttempts: 5,
        lockoutDuration: 15,
        enableAuditLog: true,
        enableTwoFactor: false,
        restrictIPAccess: false
    },
    database: {
        dbHost: 'localhost',
        dbPort: 5432,
        dbName: 'pau_inventory',
        autoVacuum: true,
        logRetention: 30
    },
    notifications: {
        smtpServer: 'smtp.gmail.com',
        smtpPort: 587,
        emailFrom: 'noreply@pau.edu',
        lowStockAlerts: true,
        expiryAlerts: true,
        systemAlerts: true
    },
    backup: {
        enableBackup: true,
        backupFrequency: 'daily',
        backupTime: '02:00',
        backupRetention: 30
    },
    advanced: {
        enableCaching: true,
        cacheSize: 100,
        maxConcurrentUsers: 50,
        enableDebugMode: false,
        logLevel: 'info'
    }
};

// Initialize the system settings module
document.addEventListener('DOMContentLoaded', function() {
    initializeSettingsModule();
});

function initializeSettingsModule() {
    // Check authentication and permissions
    checkAuthenticationAndPermissions();
    
    // Load system settings
    loadSystemSettings();
    
    // Initialize UI components
    initializeUI();
    
    // Set up event listeners
    setupEventListeners();
    
    // Start auto-save timer
    startAutoSave();
    
    console.log('System Settings module initialized');
}

function checkAuthenticationAndPermissions() {
    const isLoggedIn = sessionStorage.getItem('isLoggedIn');
    const userRole = sessionStorage.getItem('userRole');
    const username = sessionStorage.getItem('username');
    
    if (!isLoggedIn || isLoggedIn !== 'true') {
        alert('Please log in to access system settings.');
        window.location.href = 'index.html';
        return;
    }
    
    // Only admin can access system settings
    if (userRole !== 'admin') {
        alert('Access denied. Only administrators can access system settings.');
        if (userRole === 'supervisor') {
            window.location.href = 'supervisor-dashboard.html';
        } else if (userRole === 'staff') {
            window.location.href = 'staff-dashboard.html';
        } else {
            window.location.href = 'index.html';
        }
        return;
    }
    
    // Create currentUser object
    const currentUser = {
        username: username,
        role: userRole,
        isLoggedIn: true
    };
    
    settingsState.currentUser = currentUser;
    
    // Update UI with user information
    document.getElementById('welcomeMessage').textContent = `Welcome, ${currentUser.username}!`;
    document.getElementById('userRoleBadge').textContent = currentUser.role.charAt(0).toUpperCase() + currentUser.role.slice(1);
}

function loadSystemSettings() {
    // Load settings from localStorage or use defaults
    const savedSettings = localStorage.getItem('systemSettings');
    
    if (savedSettings) {
        try {
            settingsState.settings = JSON.parse(savedSettings);
            // Merge with defaults to ensure all settings exist
            settingsState.settings = mergeWithDefaults(settingsState.settings, DEFAULT_SETTINGS);
        } catch (error) {
            console.error('Error loading settings:', error);
            settingsState.settings = { ...DEFAULT_SETTINGS };
        }
    } else {
        settingsState.settings = { ...DEFAULT_SETTINGS };
    }
    
    // Store original settings for comparison
    settingsState.originalSettings = JSON.parse(JSON.stringify(settingsState.settings));
    
    // Get last saved time
    const lastSaved = localStorage.getItem('settingsLastSaved');
    if (lastSaved) {
        settingsState.lastSavedTime = new Date(lastSaved);
        updateLastSavedDisplay();
    }
}

function mergeWithDefaults(current, defaults) {
    const merged = { ...defaults };
    
    for (const category in current) {
        if (merged[category]) {
            merged[category] = { ...merged[category], ...current[category] };
        }
    }
    
    return merged;
}

function initializeUI() {
    // Populate form fields with current settings
    populateFormFields();
    
    // Update statistics
    updateStatistics();
    
    // Show general settings by default
    showCategory('general');
}

function populateFormFields() {
    const settings = settingsState.settings;
    
    // General settings
    setFieldValue('systemName', settings.general.systemName);
    setFieldValue('organizationName', settings.general.organizationName);
    setFieldValue('systemVersion', settings.general.systemVersion);
    setFieldValue('timezone', settings.general.timezone);
    setFieldValue('dateFormat', settings.general.dateFormat);
    setFieldValue('currency', settings.general.currency);
    setFieldValue('businessStart', settings.general.businessStart);
    setFieldValue('businessEnd', settings.general.businessEnd);
    setFieldValue('lowStockThreshold', settings.general.lowStockThreshold);
    setFieldValue('autoReorder', settings.general.autoReorder);
    
    // Security settings
    setFieldValue('minPasswordLength', settings.security.minPasswordLength);
    setFieldValue('requireUppercase', settings.security.requireUppercase);
    setFieldValue('requireNumbers', settings.security.requireNumbers);
    setFieldValue('requireSpecialChars', settings.security.requireSpecialChars);
    setFieldValue('sessionTimeout', settings.security.sessionTimeout);
    setFieldValue('maxLoginAttempts', settings.security.maxLoginAttempts);
    setFieldValue('lockoutDuration', settings.security.lockoutDuration);
    setFieldValue('enableAuditLog', settings.security.enableAuditLog);
    setFieldValue('enableTwoFactor', settings.security.enableTwoFactor);
    setFieldValue('restrictIPAccess', settings.security.restrictIPAccess);
    
    // Database settings
    setFieldValue('dbHost', settings.database.dbHost);
    setFieldValue('dbPort', settings.database.dbPort);
    setFieldValue('dbName', settings.database.dbName);
    setFieldValue('autoVacuum', settings.database.autoVacuum);
    setFieldValue('logRetention', settings.database.logRetention);
    
    // Notification settings
    setFieldValue('smtpServer', settings.notifications.smtpServer);
    setFieldValue('smtpPort', settings.notifications.smtpPort);
    setFieldValue('emailFrom', settings.notifications.emailFrom);
    setFieldValue('lowStockAlerts', settings.notifications.lowStockAlerts);
    setFieldValue('expiryAlerts', settings.notifications.expiryAlerts);
    setFieldValue('systemAlerts', settings.notifications.systemAlerts);
    
    // Backup settings
    setFieldValue('enableBackup', settings.backup.enableBackup);
    setFieldValue('backupFrequency', settings.backup.backupFrequency);
    setFieldValue('backupTime', settings.backup.backupTime);
    setFieldValue('backupRetention', settings.backup.backupRetention);
    
    // Advanced settings
    setFieldValue('enableCaching', settings.advanced.enableCaching);
    setFieldValue('cacheSize', settings.advanced.cacheSize);
    setFieldValue('maxConcurrentUsers', settings.advanced.maxConcurrentUsers);
    setFieldValue('enableDebugMode', settings.advanced.enableDebugMode);
    setFieldValue('logLevel', settings.advanced.logLevel);
}

function setFieldValue(fieldId, value) {
    const field = document.getElementById(fieldId);
    if (!field) return;
    
    if (field.type === 'checkbox') {
        field.checked = value;
    } else {
        field.value = value;
    }
}

function updateStatistics() {
    // Count total settings
    let totalSettings = 0;
    let modifiedSettings = 0;
    
    for (const category in settingsState.settings) {
        const categorySettings = settingsState.settings[category];
        const originalCategory = settingsState.originalSettings[category];
        
        for (const key in categorySettings) {
            totalSettings++;
            if (originalCategory && categorySettings[key] !== originalCategory[key]) {
                modifiedSettings++;
            }
        }
    }
    
    document.getElementById('totalSettings').textContent = totalSettings;
    document.getElementById('modifiedSettings').textContent = modifiedSettings;
    
    // Mock data for other stats
    document.getElementById('activeUsers').textContent = '3';
    document.getElementById('totalBackups').textContent = '12';
    
    // Update backup info
    updateBackupInfo();
}

function updateBackupInfo() {
    const lastBackup = localStorage.getItem('lastBackupDate');
    const backupSize = localStorage.getItem('lastBackupSize') || '2.5';
    
    document.getElementById('lastBackupDate').textContent = lastBackup ? 
        new Date(lastBackup).toLocaleString() : 'Never';
    document.getElementById('backupSize').textContent = `${backupSize} MB`;
}

function setupEventListeners() {
    // Logout functionality
    document.getElementById('logoutBtn').addEventListener('click', function() {
        if (settingsState.hasUnsavedChanges) {
            if (!confirm('You have unsaved changes. Are you sure you want to logout?')) {
                return;
            }
        }
        sessionStorage.removeItem('isLoggedIn');
        sessionStorage.removeItem('userRole');
        sessionStorage.removeItem('username');
        window.location.href = 'index.html';
    });
    
    // Add change listeners to all form inputs
    const formInputs = document.querySelectorAll('input, select');
    formInputs.forEach(input => {
        input.addEventListener('change', handleSettingChange);
        input.addEventListener('input', handleSettingChange);
    });
    
    // Prevent page unload with unsaved changes
    window.addEventListener('beforeunload', function(e) {
        if (settingsState.hasUnsavedChanges) {
            e.preventDefault();
            e.returnValue = '';
        }
    });
}

function handleSettingChange(event) {
    settingsState.hasUnsavedChanges = true;
    updateAutoSaveStatus();
    
    // Auto-save after 2 seconds of inactivity
    clearTimeout(settingsState.autoSaveTimer);
    if (settingsState.autoSaveEnabled) {
        settingsState.autoSaveTimer = setTimeout(() => {
            saveSettings(true); // Auto-save
        }, 2000);
    }
}

function startAutoSave() {
    // Auto-save every 30 seconds if there are changes
    setInterval(() => {
        if (settingsState.hasUnsavedChanges && settingsState.autoSaveEnabled) {
            saveSettings(true);
        }
    }, 30000);
}

// Category Management
function showCategory(categoryName) {
    // Hide all categories
    const categories = document.querySelectorAll('.settings-category');
    categories.forEach(cat => cat.classList.remove('active'));
    
    // Show selected category
    const selectedCategory = document.getElementById(categoryName + 'Settings');
    if (selectedCategory) {
        selectedCategory.classList.add('active');
    }
    
    // Update tab buttons
    const tabs = document.querySelectorAll('.tab-btn');
    tabs.forEach(tab => tab.classList.remove('active'));
    
    const activeTab = Array.from(tabs).find(tab => 
        tab.textContent.toLowerCase().includes(categoryName)
    );
    if (activeTab) {
        activeTab.classList.add('active');
    }
}

// Search and Filter Functions
function searchSettings() {
    const searchTerm = document.getElementById('searchSettings').value.toLowerCase();
    const settingCards = document.querySelectorAll('.setting-card');
    
    settingCards.forEach(card => {
        const title = card.querySelector('h4').textContent.toLowerCase();
        const content = card.querySelector('.setting-content').textContent.toLowerCase();
        const shouldShow = title.includes(searchTerm) || content.includes(searchTerm);
        
        card.style.display = shouldShow ? 'block' : 'none';
    });
}

function filterSettings() {
    const filterCategory = document.getElementById('filterCategory').value;
    
    if (!filterCategory) {
        // Show all categories
        document.querySelectorAll('.settings-category').forEach(cat => {
            cat.style.display = 'block';
        });
        return;
    }
    
    // Show only selected category
    showCategory(filterCategory);
}

// Settings Management
function saveSettings(isAutoSave = false) {
    try {
        // Collect all form data
        const newSettings = collectFormData();
        
        // Validate settings
        const validation = validateSettings(newSettings);
        if (!validation.isValid) {
            if (!isAutoSave) {
                showNotification(validation.message, 'error');
            }
            return false;
        }
        
        // Save to localStorage
        localStorage.setItem('systemSettings', JSON.stringify(newSettings));
        localStorage.setItem('settingsLastSaved', new Date().toISOString());
        
        // Update state
        settingsState.settings = newSettings;
        settingsState.originalSettings = JSON.parse(JSON.stringify(newSettings));
        settingsState.hasUnsavedChanges = false;
        settingsState.lastSavedTime = new Date();
        
        // Update UI
        updateLastSavedDisplay();
        updateAutoSaveStatus();
        updateStatistics();
        
        if (!isAutoSave) {
            showNotification('Settings saved successfully!', 'success');
        }
        
        return true;
    } catch (error) {
        console.error('Error saving settings:', error);
        if (!isAutoSave) {
            showNotification('Error saving settings. Please try again.', 'error');
        }
        return false;
    }
}

function collectFormData() {
    const settings = {
        general: {
            systemName: getFieldValue('systemName'),
            organizationName: getFieldValue('organizationName'),
            systemVersion: getFieldValue('systemVersion'),
            timezone: getFieldValue('timezone'),
            dateFormat: getFieldValue('dateFormat'),
            currency: getFieldValue('currency'),
            businessStart: getFieldValue('businessStart'),
            businessEnd: getFieldValue('businessEnd'),
            lowStockThreshold: parseInt(getFieldValue('lowStockThreshold')),
            autoReorder: getFieldValue('autoReorder')
        },
        security: {
            minPasswordLength: parseInt(getFieldValue('minPasswordLength')),
            requireUppercase: getFieldValue('requireUppercase'),
            requireNumbers: getFieldValue('requireNumbers'),
            requireSpecialChars: getFieldValue('requireSpecialChars'),
            sessionTimeout: parseInt(getFieldValue('sessionTimeout')),
            maxLoginAttempts: parseInt(getFieldValue('maxLoginAttempts')),
            lockoutDuration: parseInt(getFieldValue('lockoutDuration')),
            enableAuditLog: getFieldValue('enableAuditLog'),
            enableTwoFactor: getFieldValue('enableTwoFactor'),
            restrictIPAccess: getFieldValue('restrictIPAccess')
        },
        database: {
            dbHost: getFieldValue('dbHost'),
            dbPort: parseInt(getFieldValue('dbPort')),
            dbName: getFieldValue('dbName'),
            autoVacuum: getFieldValue('autoVacuum'),
            logRetention: parseInt(getFieldValue('logRetention'))
        },
        notifications: {
            smtpServer: getFieldValue('smtpServer'),
            smtpPort: parseInt(getFieldValue('smtpPort')),
            emailFrom: getFieldValue('emailFrom'),
            lowStockAlerts: getFieldValue('lowStockAlerts'),
            expiryAlerts: getFieldValue('expiryAlerts'),
            systemAlerts: getFieldValue('systemAlerts')
        },
        backup: {
            enableBackup: getFieldValue('enableBackup'),
            backupFrequency: getFieldValue('backupFrequency'),
            backupTime: getFieldValue('backupTime'),
            backupRetention: parseInt(getFieldValue('backupRetention'))
        },
        advanced: {
            enableCaching: getFieldValue('enableCaching'),
            cacheSize: parseInt(getFieldValue('cacheSize')),
            maxConcurrentUsers: parseInt(getFieldValue('maxConcurrentUsers')),
            enableDebugMode: getFieldValue('enableDebugMode'),
            logLevel: getFieldValue('logLevel')
        }
    };
    
    return settings;
}

function getFieldValue(fieldId) {
    const field = document.getElementById(fieldId);
    if (!field) return null;
    
    if (field.type === 'checkbox') {
        return field.checked;
    } else if (field.type === 'number') {
        return parseInt(field.value) || 0;
    } else {
        return field.value;
    }
}

function validateSettings(settings) {
    // General validation
    if (!settings.general.systemName || settings.general.systemName.trim() === '') {
        return { isValid: false, message: 'System name is required' };
    }
    
    if (!settings.general.organizationName || settings.general.organizationName.trim() === '') {
        return { isValid: false, message: 'Organization name is required' };
    }
    
    if (settings.general.lowStockThreshold < 0 || settings.general.lowStockThreshold > 100) {
        return { isValid: false, message: 'Low stock threshold must be between 0 and 100' };
    }
    
    // Security validation
    if (settings.security.minPasswordLength < 4 || settings.security.minPasswordLength > 20) {
        return { isValid: false, message: 'Password length must be between 4 and 20 characters' };
    }
    
    if (settings.security.sessionTimeout < 5 || settings.security.sessionTimeout > 480) {
        return { isValid: false, message: 'Session timeout must be between 5 and 480 minutes' };
    }
    
    // Database validation
    if (!settings.database.dbHost || settings.database.dbHost.trim() === '') {
        return { isValid: false, message: 'Database host is required' };
    }
    
    if (settings.database.dbPort < 1 || settings.database.dbPort > 65535) {
        return { isValid: false, message: 'Database port must be between 1 and 65535' };
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(settings.notifications.emailFrom)) {
        return { isValid: false, message: 'Please enter a valid email address' };
    }
    
    return { isValid: true, message: 'Settings are valid' };
}

function discardChanges() {
    if (!settingsState.hasUnsavedChanges) {
        showNotification('No changes to discard', 'info');
        return;
    }
    
    if (confirm('Are you sure you want to discard all unsaved changes?')) {
        // Restore original settings
        settingsState.settings = JSON.parse(JSON.stringify(settingsState.originalSettings));
        settingsState.hasUnsavedChanges = false;
        
        // Repopulate form fields
        populateFormFields();
        
        // Update UI
        updateAutoSaveStatus();
        updateStatistics();
        
        showNotification('Changes discarded', 'info');
    }
}

function updateLastSavedDisplay() {
    const lastSavedElement = document.getElementById('lastSavedTime');
    if (settingsState.lastSavedTime) {
        lastSavedElement.textContent = settingsState.lastSavedTime.toLocaleString();
    } else {
        lastSavedElement.textContent = 'Never';
    }
}

function updateAutoSaveStatus() {
    const statusElement = document.getElementById('autoSaveStatus');
    if (settingsState.hasUnsavedChanges) {
        statusElement.textContent = 'Auto-save: Pending';
        statusElement.style.color = '#ff9800';
    } else {
        statusElement.textContent = 'Auto-save: On';
        statusElement.style.color = '#4CAF50';
    }
}

// Export/Import Functions
function exportSettings() {
    try {
        const settings = settingsState.settings;
        const exportData = {
            version: '1.0',
            exportDate: new Date().toISOString(),
            exportedBy: settingsState.currentUser.username,
            settings: settings
        };
        
        const dataStr = JSON.stringify(exportData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `pau_system_settings_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        showNotification('Settings exported successfully!', 'success');
    } catch (error) {
        console.error('Export error:', error);
        showNotification('Error exporting settings', 'error');
    }
}

function importSettings() {
    document.getElementById('importModal').style.display = 'flex';
}

function closeImportModal() {
    document.getElementById('importModal').style.display = 'none';
    document.getElementById('importFile').value = '';
}

function processImport() {
    const fileInput = document.getElementById('importFile');
    const overwrite = document.getElementById('overwriteExisting').checked;
    const createBackup = document.getElementById('createBackupBeforeImport').checked;
    
    if (!fileInput.files[0]) {
        showNotification('Please select a file to import', 'error');
        return;
    }
    
    const file = fileInput.files[0];
    const reader = new FileReader();
    
    reader.onload = function(e) {
        try {
            const importData = JSON.parse(e.target.result);
            
            // Validate import data
            if (!importData.settings) {
                throw new Error('Invalid settings file format');
            }
            
            // Create backup if requested
            if (createBackup) {
                exportSettings();
            }
            
            // Import settings
            if (overwrite) {
                settingsState.settings = importData.settings;
            } else {
                settingsState.settings = mergeWithDefaults(importData.settings, settingsState.settings);
            }
            
            // Update UI
            populateFormFields();
            settingsState.hasUnsavedChanges = true;
            updateAutoSaveStatus();
            updateStatistics();
            
            closeImportModal();
            showNotification('Settings imported successfully!', 'success');
            
        } catch (error) {
            console.error('Import error:', error);
            showNotification('Error importing settings: ' + error.message, 'error');
        }
    };
    
    reader.readAsText(file);
}

function resetToDefaults() {
    showConfirmModal(
        'Reset to Defaults',
        'Are you sure you want to reset all settings to their default values? This action cannot be undone.',
        () => {
            // Reset to default settings
            settingsState.settings = JSON.parse(JSON.stringify(DEFAULT_SETTINGS));
            settingsState.hasUnsavedChanges = true;
            
            // Update UI
            populateFormFields();
            updateAutoSaveStatus();
            updateStatistics();
            
            showNotification('Settings reset to defaults', 'success');
        }
    );
}

// System Actions
function testConnection() {
    const host = getFieldValue('dbHost');
    const port = getFieldValue('dbPort');
    const dbName = getFieldValue('dbName');
    
    showNotification('Testing database connection...', 'info');
    
    // Simulate connection test
    setTimeout(() => {
        const success = Math.random() > 0.2; // 80% success rate for demo
        if (success) {
            showNotification('Database connection successful!', 'success');
        } else {
            showNotification('Database connection failed. Please check your settings.', 'error');
        }
    }, 2000);
}

function optimizeDatabase() {
    showConfirmModal(
        'Optimize Database',
        'This will optimize the database for better performance. The process may take a few minutes.',
        () => {
            showNotification('Starting database optimization...', 'info');
            
            // Simulate optimization
            setTimeout(() => {
                showNotification('Database optimization completed successfully!', 'success');
            }, 3000);
        }
    );
}

function testEmail() {
    const smtpServer = getFieldValue('smtpServer');
    const smtpPort = getFieldValue('smtpPort');
    const emailFrom = getFieldValue('emailFrom');
    
    showNotification('Sending test email...', 'info');
    
    // Simulate email test
    setTimeout(() => {
        const success = Math.random() > 0.3; // 70% success rate for demo
        if (success) {
            showNotification('Test email sent successfully!', 'success');
        } else {
            showNotification('Failed to send test email. Please check your SMTP settings.', 'error');
        }
    }, 2000);
}

function createBackup() {
    showNotification('Creating system backup...', 'info');
    
    // Simulate backup creation
    setTimeout(() => {
        const backupDate = new Date().toISOString();
        const backupSize = (Math.random() * 5 + 1).toFixed(1); // Random size between 1-6 MB
        
        localStorage.setItem('lastBackupDate', backupDate);
        localStorage.setItem('lastBackupSize', backupSize);
        
        updateBackupInfo();
        updateStatistics();
        
        showNotification('System backup created successfully!', 'success');
    }, 3000);
}

function restoreBackup() {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.zip,.sql,.json';
    
    fileInput.onchange = function(event) {
        const file = event.target.files[0];
        if (file) {
            showConfirmModal(
                'Restore Backup',
                `Are you sure you want to restore from backup "${file.name}"? This will overwrite all current data.`,
                () => {
                    showNotification('Restoring from backup...', 'info');
                    
                    // Simulate restore process
                    setTimeout(() => {
                        showNotification('System restored from backup successfully!', 'success');
                    }, 4000);
                }
            );
        }
    };
    
    fileInput.click();
}

function clearLogs() {
    showConfirmModal(
        'Clear System Logs',
        'Are you sure you want to clear all system logs? This action cannot be undone.',
        () => {
            showNotification('Clearing system logs...', 'info');
            
            // Simulate log clearing
            setTimeout(() => {
                showNotification('System logs cleared successfully!', 'success');
            }, 1500);
        }
    );
}

function downloadLogs() {
    showNotification('Preparing log files for download...', 'info');
    
    // Simulate log file preparation
    setTimeout(() => {
        const logData = generateMockLogData();
        const dataBlob = new Blob([logData], { type: 'text/plain' });
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `pau_system_logs_${new Date().toISOString().split('T')[0]}.log`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        showNotification('Log files downloaded successfully!', 'success');
    }, 2000);
}

function generateMockLogData() {
    const logs = [];
    const logLevels = ['INFO', 'WARNING', 'ERROR', 'DEBUG'];
    const actions = ['User login', 'Data backup', 'System update', 'Database query', 'File upload'];
    
    for (let i = 0; i < 100; i++) {
        const timestamp = new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000);
        const level = logLevels[Math.floor(Math.random() * logLevels.length)];
        const action = actions[Math.floor(Math.random() * actions.length)];
        
        logs.push(`${timestamp.toISOString()} [${level}] ${action} - Operation completed successfully`);
    }
    
    return logs.join('\n');
}

// Modal Functions
function showConfirmModal(title, message, onConfirm) {
    document.getElementById('confirmTitle').textContent = title;
    document.getElementById('confirmMessage').textContent = message;
    document.getElementById('confirmModal').style.display = 'flex';
    
    // Store the confirm action
    window.currentConfirmAction = onConfirm;
}

function closeConfirmModal() {
    document.getElementById('confirmModal').style.display = 'none';
    window.currentConfirmAction = null;
}

function executeConfirmAction() {
    if (window.currentConfirmAction) {
        window.currentConfirmAction();
    }
    closeConfirmModal();
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
    
    // Add styles for notification
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: white;
        border-radius: 8px;
        padding: 15px 20px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.15);
        z-index: 10000;
        animation: slideIn 0.3s ease-out;
        min-width: 300px;
        max-width: 500px;
        border-left: 4px solid ${getNotificationColor(type)};
    `;
    
    document.body.appendChild(notification);
    
    // Auto-remove after 4 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.animation = 'slideOut 0.3s ease-in';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }
    }, 4000);
}

function getNotificationIcon(type) {
    switch (type) {
        case 'success': return '✅';
        case 'error': return '❌';
        case 'warning': return '⚠️';
        default: return 'ℹ️';
    }
}

function getNotificationColor(type) {
    switch (type) {
        case 'success': return '#4CAF50';
        case 'error': return '#f44336';
        case 'warning': return '#ff9800';
        default: return '#2196F3';
    }
}

// Navigation Functions
function goBackToDashboard() {
    if (settingsState.hasUnsavedChanges) {
        if (!confirm('You have unsaved changes. Are you sure you want to leave?')) {
            return;
        }
    }
    
    const userRole = sessionStorage.getItem('userRole');
    if (userRole === 'admin') {
        window.location.href = 'supervisor-dashboard.html'; // Admin uses supervisor dashboard
    } else if (userRole === 'supervisor') {
        window.location.href = 'supervisor-dashboard.html';
    } else {
        window.location.href = 'staff-dashboard.html';
    }
}

// Add custom CSS for animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
    
    .notification-content {
        display: flex;
        align-items: center;
        gap: 10px;
    }
    
    .notification-icon {
        font-size: 1.2em;
        flex-shrink: 0;
    }
    
    .notification-message {
        font-size: 0.9em;
        color: #333;
        line-height: 1.4;
    }
`;
document.head.appendChild(style);

console.log('PAU Inventory System Settings module loaded successfully');
