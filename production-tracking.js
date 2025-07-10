// Production Tracking System
let productionEntries = [];
let inventoryItems = [];
let currentUser = {};
let currentEntryType = 'inbound';
let pendingEntry = null;

// Initialize the system
document.addEventListener('DOMContentLoaded', function() {
    // Check authentication and role
    checkAuthAndRole();
    
    // Setup logout functionality
    setupLogout();
    
    // Update welcome message and role badge
    updateUserInfo();
    
    // Load inventory items
    loadInventoryItems();
    
    // Initialize production data
    initializeProductionData();
    
    // Setup form
    setupForm();
    
    // Set current date and time
    setCurrentDateTime();
    
    // Load and display production history
    displayProductionHistory();
    
    // Update statistics
    updateStatistics();
});

function checkAuthAndRole() {
    const isLoggedIn = sessionStorage.getItem('isLoggedIn');
    const userRole = sessionStorage.getItem('userRole');
    const username = sessionStorage.getItem('username');
    
    if (!isLoggedIn || isLoggedIn !== 'true') {
        window.location.href = 'index.html';
        return;
    }
    
    currentUser = {
        username: username,
        role: userRole
    };
}

function setupLogout() {
    const logoutBtn = document.getElementById('logoutBtn');
    logoutBtn.addEventListener('click', function() {
        if (confirm('Are you sure you want to logout?')) {
            sessionStorage.clear();
            window.location.href = 'index.html';
        }
    });
}

function updateUserInfo() {
    const welcomeMessage = document.getElementById('welcomeMessage');
    const roleBadge = document.getElementById('userRoleBadge');
    
    const displayName = currentUser.username.charAt(0).toUpperCase() + currentUser.username.slice(1);
    welcomeMessage.textContent = `Welcome, ${displayName}!`;
    
    if (currentUser.role === 'supervisor') {
        roleBadge.textContent = 'Supervisor';
        roleBadge.className = 'role-badge supervisor';
    } else {
        roleBadge.textContent = 'Staff';
        roleBadge.className = 'role-badge staff';
    }
}

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

function loadInventoryItems() {
    // Load from localStorage if available, otherwise use sample data
    const savedInventory = localStorage.getItem('inventoryItems');
    if (savedInventory) {
        inventoryItems = JSON.parse(savedInventory);
    } else {
        // Sample inventory data (same as inventory management)
        inventoryItems = [
            {
                id: 'INV001',
                name: 'All Purpose Flour',
                type: 'raw_ingredient',
                location: 'factory',
                quantity: 15,
                unit: 'kg'
            },
            {
                id: 'INV002',
                name: 'Sugar',
                type: 'raw_ingredient',
                location: 'factory',
                quantity: 22,
                unit: 'kg'
            },
            {
                id: 'INV003',
                name: 'Fresh Eggs',
                type: 'raw_ingredient',
                location: 'factory',
                quantity: 144,
                unit: 'pcs'
            },
            {
                id: 'INV007',
                name: 'Classic Bread',
                type: 'finished_product',
                location: 'factory',
                quantity: 25,
                unit: 'pcs'
            },
            {
                id: 'INV008',
                name: 'Chocolate Croissant',
                type: 'finished_product',
                location: 'factory',
                quantity: 18,
                unit: 'pcs'
            }
        ];
    }
    
    populateItemSelect();
}

function populateItemSelect() {
    const itemSelect = document.getElementById('itemSelect');
    itemSelect.innerHTML = '<option value="">Choose an inventory item...</option>';
    
    // Only show items that are in factory location for production tracking
    const factoryItems = inventoryItems.filter(item => item.location === 'factory');
    
    factoryItems.forEach(item => {
        const option = document.createElement('option');
        option.value = item.id;
        option.textContent = `${item.name} (${item.quantity} ${item.unit} available)`;
        option.dataset.currentStock = item.quantity;
        option.dataset.unit = item.unit;
        itemSelect.appendChild(option);
    });
}

function initializeProductionData() {
    // Sample production entries for demonstration
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    productionEntries = [
        {
            id: 'PE001',
            itemId: 'INV007',
            itemName: 'Classic Bread',
            type: 'inbound',
            quantity: 50,
            unit: 'pcs',
            timestamp: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 8, 30),
            staff: currentUser.username,
            notes: 'Morning production batch',
            batchNumber: 'B2025070201'
        },
        {
            id: 'PE002',
            itemId: 'INV008',
            itemName: 'Chocolate Croissant',
            type: 'inbound',
            quantity: 30,
            unit: 'pcs',
            timestamp: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 9, 15),
            staff: currentUser.username,
            notes: 'Fresh batch for morning rush',
            batchNumber: 'B2025070202'
        },
        {
            id: 'PE003',
            itemId: 'INV007',
            itemName: 'Classic Bread',
            type: 'outbound',
            quantity: 25,
            unit: 'pcs',
            timestamp: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 11, 0),
            destination: 'main_outlet',
            staff: currentUser.username,
            notes: 'Regular morning delivery',
            batchNumber: 'B2025070201'
        },
        {
            id: 'PE004',
            itemId: 'INV008',
            itemName: 'Chocolate Croissant',
            type: 'outbound',
            quantity: 12,
            unit: 'pcs',
            timestamp: new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate(), 16, 30),
            destination: 'downtown_branch',
            staff: 'john',
            notes: 'Afternoon delivery',
            batchNumber: 'B2025070102'
        }
    ];
}

function setupForm() {
    const form = document.getElementById('productionForm');
    const itemSelect = document.getElementById('itemSelect');
    const quantityInput = document.getElementById('quantity');
    
    // Item selection change handler
    itemSelect.addEventListener('change', function() {
        updateStockInfo();
    });
    
    // Quantity change handler
    quantityInput.addEventListener('input', function() {
        updateStockInfo();
    });
    
    // Form submission
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        handleFormSubmission();
    });
}

function setCurrentDateTime() {
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = now.toTimeString().slice(0, 5);
    
    document.getElementById('entryDate').value = dateStr;
    document.getElementById('entryTime').value = timeStr;
}

function switchEntryType(type) {
    currentEntryType = type;
    
    // Update tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-type="${type}"]`).classList.add('active');
    
    // Update form elements
    const outboundDestination = document.getElementById('outboundDestination');
    const destinationSelect = document.getElementById('destination');
    const submitBtn = document.getElementById('submitBtn');
    
    if (type === 'outbound') {
        outboundDestination.style.display = 'grid';
        destinationSelect.required = true;
        submitBtn.textContent = 'Record Outbound Entry';
    } else {
        outboundDestination.style.display = 'none';
        destinationSelect.required = false;
        submitBtn.textContent = 'Record Inbound Entry';
    }
    
    updateStockInfo();
}

function updateStockInfo() {
    const itemSelect = document.getElementById('itemSelect');
    const quantityInput = document.getElementById('quantity');
    const stockInfo = document.getElementById('stockInfo');
    const currentStockSpan = document.getElementById('currentStock');
    const afterStockSpan = document.getElementById('afterStock');
    const warningRow = document.getElementById('warningRow');
    const warningText = document.getElementById('warningText');
    
    if (!itemSelect.value || !quantityInput.value) {
        stockInfo.style.display = 'none';
        return;
    }
    
    const selectedOption = itemSelect.options[itemSelect.selectedIndex];
    const currentStock = parseFloat(selectedOption.dataset.currentStock);
    const unit = selectedOption.dataset.unit;
    const entryQuantity = parseFloat(quantityInput.value);
    
    let afterStock;
    if (currentEntryType === 'inbound') {
        afterStock = currentStock + entryQuantity;
    } else {
        afterStock = currentStock - entryQuantity;
    }
    
    currentStockSpan.textContent = `${currentStock} ${unit}`;
    afterStockSpan.textContent = `${afterStock} ${unit}`;
    
    // Show warnings for outbound entries
    if (currentEntryType === 'outbound') {
        if (afterStock < 0) {
            warningRow.style.display = 'flex';
            warningText.textContent = 'Insufficient stock for this outbound entry!';
            afterStockSpan.style.color = '#f44336';
        } else if (afterStock < currentStock * 0.2) {
            warningRow.style.display = 'flex';
            warningText.textContent = 'This will result in very low stock levels.';
            afterStockSpan.style.color = '#ff9800';
        } else {
            warningRow.style.display = 'none';
            afterStockSpan.style.color = '#4CAF50';
        }
    } else {
        warningRow.style.display = 'none';
        afterStockSpan.style.color = '#4CAF50';
    }
    
    stockInfo.style.display = 'block';
}

function handleFormSubmission() {
    const formData = new FormData(document.getElementById('productionForm'));
    const itemSelect = document.getElementById('itemSelect');
    const selectedOption = itemSelect.options[itemSelect.selectedIndex];
    const currentStock = parseFloat(selectedOption.dataset.currentStock);
    const entryQuantity = parseFloat(formData.get('quantity'));
    
    // Validate stock for outbound entries
    if (currentEntryType === 'outbound' && entryQuantity > currentStock) {
        alert('❌ Insufficient Stock\n\nCannot create outbound entry. The requested quantity exceeds available stock.');
        return;
    }
    
    // Create entry object
    const entry = {
        id: generateEntryId(),
        itemId: formData.get('itemSelect'),
        itemName: selectedOption.textContent.split(' (')[0],
        type: currentEntryType,
        quantity: entryQuantity,
        unit: selectedOption.dataset.unit,
        timestamp: new Date(`${formData.get('entryDate')}T${formData.get('entryTime')}`),
        staff: currentUser.username,
        notes: formData.get('notes') || '',
        batchNumber: formData.get('batchNumber') || ''
    };
    
    if (currentEntryType === 'outbound') {
        entry.destination = formData.get('destination');
    }
    
    // Store entry for confirmation
    pendingEntry = entry;
    
    // Show confirmation modal
    showConfirmationModal(entry);
}

function generateEntryId() {
    const nextId = productionEntries.length + 1;
    return `PE${String(nextId).padStart(3, '0')}`;
}

function showConfirmationModal(entry) {
    const modal = document.getElementById('confirmModal');
    const confirmationText = document.getElementById('confirmationText');
    const stockImpactText = document.getElementById('stockImpactText');
    
    const entryTypeText = entry.type === 'inbound' ? 'Add to Inventory' : 'Ship to Outlet';
    const destinationText = entry.destination ? ` to ${entry.destination.replace('_', ' ').toUpperCase()}` : '';
    
    confirmationText.innerHTML = `
        <div style="margin-bottom: 10px;"><strong>Type:</strong> ${entryTypeText}${destinationText}</div>
        <div style="margin-bottom: 10px;"><strong>Item:</strong> ${entry.itemName}</div>
        <div style="margin-bottom: 10px;"><strong>Quantity:</strong> ${entry.quantity} ${entry.unit}</div>
        <div style="margin-bottom: 10px;"><strong>Time:</strong> ${entry.timestamp.toLocaleString()}</div>
        ${entry.batchNumber ? `<div style="margin-bottom: 10px;"><strong>Batch:</strong> ${entry.batchNumber}</div>` : ''}
        ${entry.notes ? `<div><strong>Notes:</strong> ${entry.notes}</div>` : ''}
    `;
    
    const itemSelect = document.getElementById('itemSelect');
    const selectedOption = itemSelect.options[itemSelect.selectedIndex];
    const currentStock = parseFloat(selectedOption.dataset.currentStock);
    const afterStock = entry.type === 'inbound' ? 
        currentStock + entry.quantity : 
        currentStock - entry.quantity;
    
    stockImpactText.innerHTML = `
        <div style="margin-bottom: 5px;">Current Stock: ${currentStock} ${entry.unit}</div>
        <div style="color: ${entry.type === 'inbound' ? '#4CAF50' : '#2196F3'};">
            After Entry: ${afterStock} ${entry.unit}
        </div>
    `;
    
    modal.style.display = 'block';
}

function confirmEntry() {
    if (!pendingEntry) return;
    
    // Add entry to production history
    productionEntries.unshift(pendingEntry);
    
    // Update inventory quantities
    updateInventoryQuantity(pendingEntry);
    
    // Reset form
    resetForm();
    
    // Update displays
    displayProductionHistory();
    updateStatistics();
    populateItemSelect(); // Refresh with updated quantities
    
    // Close modal
    closeConfirmModal();
    
    // Show success notification
    showNotification(`${pendingEntry.type === 'inbound' ? 'Inbound' : 'Outbound'} entry recorded successfully!`, 'success');
    
    pendingEntry = null;
}

function updateInventoryQuantity(entry) {
    const item = inventoryItems.find(item => item.id === entry.itemId);
    if (item) {
        if (entry.type === 'inbound') {
            item.quantity += entry.quantity;
        } else {
            item.quantity -= entry.quantity;
        }
        
        // Save to localStorage
        localStorage.setItem('inventoryItems', JSON.stringify(inventoryItems));
    }
}

function closeConfirmModal() {
    document.getElementById('confirmModal').style.display = 'none';
    pendingEntry = null;
}

function resetForm() {
    document.getElementById('productionForm').reset();
    document.getElementById('stockInfo').style.display = 'none';
    setCurrentDateTime();
}

function displayProductionHistory() {
    const tableBody = document.getElementById('historyTableBody');
    tableBody.innerHTML = '';
    
    if (productionEntries.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="8" style="text-align: center; padding: 40px; color: #666;">
                    No production entries recorded yet
                </td>
            </tr>
        `;
        return;
    }
    
    const filteredEntries = getFilteredEntries();
    
    filteredEntries.forEach(entry => {
        const row = document.createElement('tr');
        
        const destinationText = entry.destination ? 
            entry.destination.replace('_', ' ').toUpperCase() : 
            (entry.type === 'inbound' ? 'Factory Production' : '-');
        
        row.innerHTML = `
            <td class="timestamp">${entry.timestamp.toLocaleString()}</td>
            <td><span class="entry-type ${entry.type}">${entry.type}</span></td>
            <td><strong>${entry.itemName}</strong></td>
            <td class="quantity">${entry.quantity} ${entry.unit}</td>
            <td>${destinationText}</td>
            <td>${entry.batchNumber || '-'}</td>
            <td>${entry.staff}</td>
            <td>${entry.notes || '-'}</td>
        `;
        
        tableBody.appendChild(row);
    });
}

function getFilteredEntries() {
    const filterDate = document.getElementById('filterDate').value;
    const filterType = document.getElementById('filterType').value;
    
    let filtered = [...productionEntries];
    
    // Filter by date
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);
    
    if (filterDate === 'today') {
        filtered = filtered.filter(entry => 
            entry.timestamp.toDateString() === today.toDateString()
        );
    } else if (filterDate === 'yesterday') {
        filtered = filtered.filter(entry => 
            entry.timestamp.toDateString() === yesterday.toDateString()
        );
    } else if (filterDate === 'week') {
        filtered = filtered.filter(entry => entry.timestamp >= weekAgo);
    }
    
    // Filter by type
    if (filterType) {
        filtered = filtered.filter(entry => entry.type === filterType);
    }
    
    return filtered;
}

function filterHistory() {
    displayProductionHistory();
}

function updateStatistics() {
    const today = new Date();
    const todayEntries = productionEntries.filter(entry => 
        entry.timestamp.toDateString() === today.toDateString()
    );
    
    const todayInbound = todayEntries.filter(entry => entry.type === 'inbound');
    const todayOutbound = todayEntries.filter(entry => entry.type === 'outbound');
    
    const totalProduction = todayInbound.reduce((sum, entry) => sum + entry.quantity, 0);
    const itemsShipped = todayOutbound.reduce((sum, entry) => sum + entry.quantity, 0);
    
    document.getElementById('todayInbound').textContent = todayInbound.length;
    document.getElementById('todayOutbound').textContent = todayOutbound.length;
    document.getElementById('totalProduction').textContent = totalProduction;
    document.getElementById('itemsShipped').textContent = itemsShipped;
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
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
    `;
    
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

// Close modal when clicking outside
window.addEventListener('click', function(e) {
    const modal = document.getElementById('confirmModal');
    if (e.target === modal) {
        closeConfirmModal();
    }
});

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
`;
document.head.appendChild(style);
