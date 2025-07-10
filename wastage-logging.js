// Wastage Logging System
let wastageEntries = [];
let inventoryItems = [];
let currentUser = {};
let currentLocation = 'factory';
let pendingWastage = null;

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
    
    // Initialize wastage data
    initializeWastageData();
    
    // Setup form
    setupForm();
    
    // Set current date and time
    setCurrentDateTime();
    
    // Load and display wastage history
    displayWastageHistory();
    
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
    
    // Hide value information for staff users
    if (userRole === 'staff') {
        const valueCard = document.getElementById('totalValueCard');
        const valueRow = document.getElementById('valueRow');
        if (valueCard) valueCard.style.display = 'none';
        if (valueRow) valueRow.style.display = 'none';
    }
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
        // Sample inventory data
        inventoryItems = [
            {
                id: 'INV001',
                name: 'All Purpose Flour',
                type: 'raw_ingredient',
                location: 'factory',
                quantity: 500,
                unit: 'kg',
                price: 2.50,
                minStock: 50,
                supplier: 'Local Mills Ltd',
                expiryDate: '2025-08-15'
            },
            {
                id: 'INV002',
                name: 'Sugar',
                type: 'raw_ingredient',
                location: 'factory',
                quantity: 200,
                unit: 'kg',
                price: 1.20,
                minStock: 30,
                supplier: 'Sweet Supply Co',
                expiryDate: '2025-12-31'
            },
            {
                id: 'INV003',
                name: 'Bread Loaves',
                type: 'finished_product',
                location: 'factory',
                quantity: 150,
                unit: 'units',
                price: 3.50,
                minStock: 20,
                supplier: 'Internal Production',
                expiryDate: '2025-07-05'
            },
            {
                id: 'INV004',
                name: 'Pastries',
                type: 'finished_product',
                location: 'factory',
                quantity: 75,
                unit: 'units',
                price: 5.00,
                minStock: 10,
                supplier: 'Internal Production',
                expiryDate: '2025-07-04'
            },
            {
                id: 'INV005',
                name: 'Cooking Oil',
                type: 'raw_ingredient',
                location: 'factory',
                quantity: 100,
                unit: 'liters',
                price: 4.75,
                minStock: 15,
                supplier: 'Oil Works Inc',
                expiryDate: '2025-09-20'
            }
        ];
        localStorage.setItem('inventoryItems', JSON.stringify(inventoryItems));
    }
    
    populateItemSelect();
}

function populateItemSelect() {
    const itemSelect = document.getElementById('itemSelect');
    itemSelect.innerHTML = '<option value="">Choose an inventory item...</option>';
    
    inventoryItems.forEach(item => {
        const option = document.createElement('option');
        option.value = item.id;
        option.textContent = `${item.name} (${item.id}) - ${item.quantity} ${item.unit}`;
        itemSelect.appendChild(option);
    });
}

function initializeWastageData() {
    // Load from localStorage if available, otherwise initialize empty
    const savedWastage = localStorage.getItem('wastageEntries');
    if (savedWastage) {
        wastageEntries = JSON.parse(savedWastage);
    } else {
        // Sample wastage data for demonstration
        wastageEntries = [
            {
                id: 'WASTE001',
                itemId: 'INV003',
                itemName: 'Bread Loaves',
                quantity: 5,
                unit: 'units',
                location: 'factory',
                outletLocation: null,
                reason: 'expired',
                customReason: null,
                notes: 'Past expiry date, discarded for safety',
                timestamp: new Date('2025-07-01T08:30:00').toISOString(),
                loggedBy: 'staff1',
                reportedBy: null,
                valueLost: 17.50
            },
            {
                id: 'WASTE002',
                itemId: 'INV004',
                itemName: 'Pastries',
                quantity: 3,
                unit: 'units',
                location: 'outlet',
                outletLocation: 'main_outlet',
                reason: 'damaged',
                customReason: null,
                notes: 'Dropped during transport',
                timestamp: new Date('2025-07-01T14:15:00').toISOString(),
                loggedBy: 'mary',
                reportedBy: 'John Smith',
                valueLost: 15.00
            }
        ];
        localStorage.setItem('wastageEntries', JSON.stringify(wastageEntries));
    }
}

function setupForm() {
    const form = document.getElementById('wastageForm');
    const itemSelect = document.getElementById('itemSelect');
    const quantityInput = document.getElementById('quantity');
    const wasteReason = document.getElementById('wasteReason');
    const customReasonGroup = document.getElementById('customReasonGroup');
    
    form.addEventListener('submit', handleFormSubmit);
    
    // Show/hide custom reason field
    wasteReason.addEventListener('change', function() {
        if (this.value === 'other') {
            customReasonGroup.style.display = 'flex';
            document.getElementById('customReason').required = true;
        } else {
            customReasonGroup.style.display = 'none';
            document.getElementById('customReason').required = false;
        }
    });
    
    // Update stock info when item or quantity changes
    itemSelect.addEventListener('change', updateStockInfo);
    quantityInput.addEventListener('input', updateStockInfo);
}

function setCurrentDateTime() {
    const now = new Date();
    const date = now.toISOString().split('T')[0];
    const time = now.toTimeString().slice(0, 5);
    
    document.getElementById('wasteDate').value = date;
    document.getElementById('wasteTime').value = time;
}

function switchLocation(location) {
    currentLocation = location;
    
    // Update tab appearance
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-location="${location}"]`).classList.add('active');
    
    // Show/hide outlet details
    const outletDetails = document.getElementById('outletDetails');
    const submitBtn = document.getElementById('submitBtn');
    
    if (location === 'outlet') {
        outletDetails.style.display = 'grid';
        document.getElementById('outletLocation').required = true;
        submitBtn.textContent = 'Log Outlet Wastage';
    } else {
        outletDetails.style.display = 'none';
        document.getElementById('outletLocation').required = false;
        submitBtn.textContent = 'Log Factory Wastage';
    }
    
    updateStockInfo();
}

function updateStockInfo() {
    const itemSelect = document.getElementById('itemSelect');
    const quantityInput = document.getElementById('quantity');
    const stockInfo = document.getElementById('stockInfo');
    const currentStockEl = document.getElementById('currentStock');
    const afterStockEl = document.getElementById('afterStock');
    const valueLostEl = document.getElementById('valueLost');
    const valueRow = document.getElementById('valueRow');
    const warningRow = document.getElementById('warningRow');
    const warningText = document.getElementById('warningText');
    
    if (!itemSelect.value || !quantityInput.value) {
        stockInfo.style.display = 'none';
        return;
    }
    
    const selectedItem = inventoryItems.find(item => item.id === itemSelect.value);
    const wasteQuantity = parseFloat(quantityInput.value);
    
    if (!selectedItem || wasteQuantity <= 0) {
        stockInfo.style.display = 'none';
        return;
    }
    
    stockInfo.style.display = 'block';
    
    const currentStock = selectedItem.quantity;
    const afterStock = currentStock - wasteQuantity;
    const valueLost = wasteQuantity * selectedItem.price;
    
    currentStockEl.textContent = `${currentStock} ${selectedItem.unit}`;
    afterStockEl.textContent = `${afterStock} ${selectedItem.unit}`;
    
    // Show value information only for supervisors
    if (currentUser.role === 'supervisor') {
        valueRow.style.display = 'flex';
        valueLostEl.textContent = `$${valueLost.toFixed(2)}`;
    }
    
    // Show warnings
    if (afterStock < 0) {
        warningRow.style.display = 'flex';
        warningText.textContent = 'Insufficient stock for this wastage amount!';
        afterStockEl.classList.add('warning-text');
    } else if (afterStock < selectedItem.minStock) {
        warningRow.style.display = 'flex';
        warningText.textContent = 'Stock will fall below minimum level after this wastage.';
        afterStockEl.classList.remove('warning-text');
    } else {
        warningRow.style.display = 'none';
        afterStockEl.classList.remove('warning-text');
    }
}

function handleFormSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const itemId = formData.get('itemSelect');
    const quantity = parseFloat(formData.get('quantity'));
    
    // Validate item exists
    const selectedItem = inventoryItems.find(item => item.id === itemId);
    if (!selectedItem) {
        alert('❌ Invalid Item\n\nPlease select a valid inventory item.');
        return;
    }
    
    // Validate stock availability
    if (quantity > selectedItem.quantity) {
        alert('❌ Insufficient Stock\n\nCannot waste more than available stock. Current stock: ' + 
              selectedItem.quantity + ' ' + selectedItem.unit);
        return;
    }
    
    // Validate outlet location for outlet wastage
    if (currentLocation === 'outlet' && !formData.get('outletLocation')) {
        alert('❌ Missing Information\n\nPlease select the outlet location for outlet wastage.');
        return;
    }
    
    // Get reason
    let reason = formData.get('wasteReason');
    let customReason = null;
    if (reason === 'other') {
        customReason = formData.get('customReason');
        if (!customReason || customReason.trim() === '') {
            alert('❌ Missing Information\n\nPlease specify the custom reason for wastage.');
            return;
        }
    }
    
    // Create wastage entry
    const wastageEntry = {
        itemId: itemId,
        itemName: selectedItem.name,
        quantity: quantity,
        unit: selectedItem.unit,
        location: currentLocation,
        outletLocation: currentLocation === 'outlet' ? formData.get('outletLocation') : null,
        reason: reason,
        customReason: customReason,
        notes: formData.get('notes') || '',
        date: formData.get('wasteDate'),
        time: formData.get('wasteTime'),
        reportedBy: formData.get('reportedBy') || null,
        valueLost: quantity * selectedItem.price
    };
    
    pendingWastage = wastageEntry;
    showConfirmationModal();
}

function showConfirmationModal() {
    const modal = document.getElementById('confirmModal');
    const confirmationText = document.getElementById('confirmationText');
    const stockImpactText = document.getElementById('stockImpactText');
    
    const selectedItem = inventoryItems.find(item => item.id === pendingWastage.itemId);
    const afterStock = selectedItem.quantity - pendingWastage.quantity;
    
    // Build confirmation text
    let confirmText = `
        <strong>Item:</strong> ${pendingWastage.itemName}<br>
        <strong>Quantity:</strong> ${pendingWastage.quantity} ${pendingWastage.unit}<br>
        <strong>Location:</strong> ${pendingWastage.location === 'factory' ? 'Factory' : 'Outlet'}<br>
    `;
    
    if (pendingWastage.location === 'outlet') {
        const outletNames = {
            'main_outlet': 'Main Outlet',
            'downtown_branch': 'Downtown Branch',
            'mall_kiosk': 'Mall Kiosk',
            'airport_branch': 'Airport Branch'
        };
        confirmText += `<strong>Outlet:</strong> ${outletNames[pendingWastage.outletLocation]}<br>`;
    }
    
    confirmText += `
        <strong>Reason:</strong> ${pendingWastage.reason === 'other' ? pendingWastage.customReason : getReasonText(pendingWastage.reason)}<br>
        <strong>Date/Time:</strong> ${pendingWastage.date} at ${pendingWastage.time}<br>
    `;
    
    if (pendingWastage.reportedBy) {
        confirmText += `<strong>Reported By:</strong> ${pendingWastage.reportedBy}<br>`;
    }
    
    if (pendingWastage.notes) {
        confirmText += `<strong>Notes:</strong> ${pendingWastage.notes}<br>`;
    }
    
    confirmationText.innerHTML = confirmText;
    
    // Build stock impact text
    let impactText = `
        <strong>Current Stock:</strong> ${selectedItem.quantity} ${selectedItem.unit}<br>
        <strong>After Wastage:</strong> ${afterStock} ${selectedItem.unit}<br>
    `;
    
    if (currentUser.role === 'supervisor') {
        impactText += `<strong>Value Lost:</strong> $${pendingWastage.valueLost.toFixed(2)}<br>`;
    }
    
    if (afterStock < selectedItem.minStock) {
        impactText += `<br><span class="warning-text">⚠️ Stock will be below minimum level (${selectedItem.minStock} ${selectedItem.unit})</span>`;
    }
    
    stockImpactText.innerHTML = impactText;
    
    modal.style.display = 'block';
}

function closeConfirmModal() {
    document.getElementById('confirmModal').style.display = 'none';
    pendingWastage = null;
}

function confirmWastage() {
    if (!pendingWastage) return;
    
    // Generate unique ID
    const wastageId = 'WASTE' + String(Date.now()).slice(-6);
    
    // Create final wastage entry
    const wastageEntry = {
        id: wastageId,
        ...pendingWastage,
        timestamp: new Date(`${pendingWastage.date}T${pendingWastage.time}`).toISOString(),
        loggedBy: currentUser.username
    };
    
    // Update inventory
    const itemIndex = inventoryItems.findIndex(item => item.id === pendingWastage.itemId);
    if (itemIndex !== -1) {
        inventoryItems[itemIndex].quantity -= pendingWastage.quantity;
        localStorage.setItem('inventoryItems', JSON.stringify(inventoryItems));
    }
    
    // Add to wastage entries
    wastageEntries.unshift(wastageEntry);
    localStorage.setItem('wastageEntries', JSON.stringify(wastageEntries));
    
    // Close modal and reset form
    closeConfirmModal();
    resetForm();
    
    // Update displays
    populateItemSelect();
    displayWastageHistory();
    updateStatistics();
    
    // Show success notification
    showNotification('Wastage entry logged successfully!', 'success');
}

function resetForm() {
    document.getElementById('wastageForm').reset();
    setCurrentDateTime();
    document.getElementById('stockInfo').style.display = 'none';
    document.getElementById('customReasonGroup').style.display = 'none';
}

function getReasonText(reason) {
    const reasons = {
        'expired': 'Expired/Past Due Date',
        'damaged': 'Damaged/Broken',
        'contaminated': 'Contaminated',
        'quality_issues': 'Quality Issues',
        'spoiled': 'Spoiled',
        'production_error': 'Production Error',
        'customer_return': 'Customer Return',
        'overproduce': 'Overproduction',
        'equipment_failure': 'Equipment Failure'
    };
    return reasons[reason] || reason;
}

function displayWastageHistory() {
    const tableBody = document.getElementById('historyTableBody');
    let filteredEntries = [...wastageEntries];
    
    // Apply filters
    const dateFilter = document.getElementById('filterDate').value;
    const locationFilter = document.getElementById('filterLocation').value;
    const reasonFilter = document.getElementById('filterReason').value;
    
    // Date filter
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
    const weekStart = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthStart = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    filteredEntries = filteredEntries.filter(entry => {
        const entryDate = new Date(entry.timestamp);
        
        switch (dateFilter) {
            case 'today':
                return entryDate >= today;
            case 'yesterday':
                return entryDate >= yesterday && entryDate < today;
            case 'week':
                return entryDate >= weekStart;
            case 'month':
                return entryDate >= monthStart;
            default:
                return true;
        }
    });
    
    // Location filter
    if (locationFilter) {
        filteredEntries = filteredEntries.filter(entry => entry.location === locationFilter);
    }
    
    // Reason filter
    if (reasonFilter) {
        filteredEntries = filteredEntries.filter(entry => entry.reason === reasonFilter);
    }
    
    // Sort by timestamp (newest first)
    filteredEntries.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    // Populate table
    tableBody.innerHTML = '';
    
    if (filteredEntries.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="8" style="text-align: center; color: #666; padding: 2rem;">No wastage entries found</td></tr>';
        return;
    }
    
    filteredEntries.forEach(entry => {
        const row = document.createElement('tr');
        
        // Format timestamp
        const date = new Date(entry.timestamp);
        const formattedDate = date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        
        // Format location
        let locationDisplay = entry.location === 'factory' ? 
            '<span class="status-badge status-factory">Factory</span>' : 
            '<span class="status-badge status-outlet">Outlet</span>';
        
        if (entry.outletLocation) {
            const outletNames = {
                'main_outlet': 'Main Outlet',
                'downtown_branch': 'Downtown Branch',
                'mall_kiosk': 'Mall Kiosk',
                'airport_branch': 'Airport Branch'
            };
            locationDisplay += `<br><small>${outletNames[entry.outletLocation]}</small>`;
        }
        
        // Format reason
        const reasonText = entry.reason === 'other' ? entry.customReason : getReasonText(entry.reason);
        const reasonDisplay = `<span class="reason-badge">${reasonText}</span>`;
        
        // Format value (only for supervisors)
        const valueDisplay = currentUser.role === 'supervisor' ? 
            `<span class="value-display">$${entry.valueLost.toFixed(2)}</span>` : 
            '<span style="color: #999;">Hidden</span>';
        
        row.innerHTML = `
            <td>${formattedDate}</td>
            <td>${locationDisplay}</td>
            <td>${entry.itemName}<br><small>${entry.id}</small></td>
            <td>${entry.quantity} ${entry.unit}</td>
            <td>${reasonDisplay}</td>
            <td>${valueDisplay}</td>
            <td>${entry.loggedBy}${entry.reportedBy ? `<br><small>Reported by: ${entry.reportedBy}</small>` : ''}</td>
            <td>${entry.notes || '-'}</td>
        `;
        
        tableBody.appendChild(row);
    });
}

function filterHistory() {
    displayWastageHistory();
}

function updateStatistics() {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    // Filter today's entries
    const todayEntries = wastageEntries.filter(entry => {
        const entryDate = new Date(entry.timestamp);
        return entryDate >= today;
    });
    
    // Calculate statistics
    const todayTotal = todayEntries.length;
    const todayFactory = todayEntries.filter(entry => entry.location === 'factory').length;
    const todayOutlet = todayEntries.filter(entry => entry.location === 'outlet').length;
    const todayValueLost = todayEntries.reduce((sum, entry) => sum + entry.valueLost, 0);
    
    // Update display
    document.getElementById('todayWastage').textContent = todayTotal;
    document.getElementById('factoryWastage').textContent = todayFactory;
    document.getElementById('outletWastage').textContent = todayOutlet;
    
    if (currentUser.role === 'supervisor') {
        document.getElementById('totalValueLost').textContent = `$${todayValueLost.toFixed(2)}`;
    }
}

function showNotification(message, type) {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('confirmModal');
    if (event.target === modal) {
        closeConfirmModal();
    }
}
