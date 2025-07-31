// Wastage Logging System
let wastageEntries = [];
let inventoryItems = [];
let currentUser = {};
let currentLocation = 'factory';
let pendingWastage = null;

// Initialize the system
document.addEventListener('DOMContentLoaded', function () {
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

    // Initialize searchable dropdowns
    initializeSearchableDropdowns();

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
    logoutBtn.addEventListener('click', function () {
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

// Load inventory items from API
async function loadInventoryItems() {
    try {
        const response = await fetch('/api/inventory');
        if (!response.ok) {
            throw new Error('Failed to fetch inventory items');
        }

        inventoryItems = await response.json();
        populateItemSelect();
    } catch (error) {
        console.error('Error loading inventory items:', error);
        showNotification('Failed to load inventory items. Please refresh the page.', 'error');
        // Fallback to empty array
        inventoryItems = [];
    }
}

// Load wastage entries from API with optional filters
async function loadWastageEntriesFromAPI(dateFilter = '', locationFilter = '', reasonFilter = '') {
    try {
        // Build query parameters
        const params = new URLSearchParams();
        if (dateFilter) params.append('date_filter', dateFilter);
        if (locationFilter) params.append('location', locationFilter);
        if (reasonFilter) params.append('reason', reasonFilter);

        const url = '/api/wastage' + (params.toString() ? '?' + params.toString() : '');
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error('Failed to fetch wastage entries');
        }

        wastageEntries = await response.json();
        displayWastageHistory();
        updateStatistics();
    } catch (error) {
        console.error('Error loading wastage entries:', error);
        showNotification('Failed to load wastage history. Please refresh the page.', 'error');
        wastageEntries = [];
    }
}

// Add wastage entry to API
async function addWastageEntryToAPI(wastageEntry) {
    try {
        const response = await fetch('/api/wastage', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(wastageEntry)
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to add wastage entry');
        }

        return await response.json();
    } catch (error) {
        console.error('Error adding wastage entry:', error);
        throw error;
    }
}

// Load statistics from API
async function loadStatisticsFromAPI() {
    try {
        const response = await fetch('/api/wastage/stats');
        if (!response.ok) {
            throw new Error('Failed to fetch statistics');
        }

        const stats = await response.json();

        // Update display
        document.getElementById('todayWastage').textContent = stats.todayTotal || 0;
        document.getElementById('factoryWastage').textContent = stats.todayFactory || 0;
        document.getElementById('outletWastage').textContent = stats.todayOutlet || 0;
        document.getElementById('totalValueLost').textContent = `$${(parseFloat(stats.todayValue) || 0).toFixed(2)}`;
    } catch (error) {
        console.error('Error loading statistics:', error);
        // Set default values on error
        document.getElementById('todayWastage').textContent = '0';
        document.getElementById('factoryWastage').textContent = '0';
        document.getElementById('outletWastage').textContent = '0';
        document.getElementById('totalValueLost').textContent = '$0.00';
    }
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

    // Refresh the searchable dropdown if it exists
    if (window.itemSelectDropdown) {
        const newOptions = Array.from(itemSelect.options).slice(1);
        window.itemSelectDropdown.refresh(newOptions);
    }
}

function initializeWastageData() {
    // Load wastage entries from API instead of localStorage
    loadWastageEntriesFromAPI();
}

function setupForm() {
    const form = document.getElementById('wastageForm');
    const itemSelect = document.getElementById('itemSelect');
    const quantityInput = document.getElementById('quantity');
    const wasteReason = document.getElementById('wasteReason');
    const customReasonGroup = document.getElementById('customReasonGroup');

    form.addEventListener('submit', handleFormSubmit);

    // Show/hide custom reason field
    wasteReason.addEventListener('change', function () {
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
    // Get current Singapore time using proper timezone conversion
    const now = new Date();
    const singaporeTime = new Date(now.toLocaleString("en-US", {timeZone: "Asia/Singapore"}));
    
    // Format date and time for Singapore timezone
    const year = singaporeTime.getFullYear();
    const month = String(singaporeTime.getMonth() + 1).padStart(2, '0');
    const day = String(singaporeTime.getDate()).padStart(2, '0');
    const date = `${year}-${month}-${day}`;
    
    const hours = String(singaporeTime.getHours()).padStart(2, '0');
    const minutes = String(singaporeTime.getMinutes()).padStart(2, '0');
    const time = `${hours}:${minutes}`;

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
    const standardPrice = 1.75; // Standardized price per unit
    const valueLost = wasteQuantity * standardPrice;

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
        valueLost: quantity * 1.75 // Standardized value calculation
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
            'airport_branch': 'Airport Branch',
            'pau_central_outlet': 'PAU Central Outlet',
            'airport_food_court': 'Airport Food Court'
        };
        const outletName = outletNames[pendingWastage.outletLocation] || pendingWastage.outletLocation;
        confirmText += `<strong>Outlet:</strong> ${outletName}<br>`;
    }

    // Format reason for confirmation
    let reasonForDisplay;
    if (pendingWastage.reason === 'other' && pendingWastage.customReason) {
        reasonForDisplay = pendingWastage.customReason;
    } else if (pendingWastage.reason === 'other' && !pendingWastage.customReason) {
        reasonForDisplay = 'Other (no details provided)';
    } else {
        reasonForDisplay = getReasonText(pendingWastage.reason);
    }

    confirmText += `
        <strong>Reason:</strong> ${reasonForDisplay}<br>
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

// Searchable Dropdown Component
class SearchableDropdown {
    constructor(selectElement) {
        this.originalSelect = selectElement;
        this.options = Array.from(selectElement.options).slice(1); // Skip first empty option
        this.selectedValue = '';
        this.filteredOptions = [...this.options];
        this.highlightedIndex = -1;
        this.isOpen = false;

        this.createDropdown();
        this.bindEvents();
    }

    createDropdown() {
        // Create wrapper
        this.wrapper = document.createElement('div');
        this.wrapper.className = 'searchable-dropdown';

        // Create input
        this.input = document.createElement('input');
        this.input.type = 'text';
        this.input.className = 'dropdown-input';
        this.input.placeholder = this.originalSelect.options[0].text;
        this.input.setAttribute('autocomplete', 'off');

        // Create arrow
        this.arrow = document.createElement('span');
        this.arrow.className = 'dropdown-arrow';
        this.arrow.innerHTML = '▼';

        // Create dropdown list
        this.dropdownList = document.createElement('div');
        this.dropdownList.className = 'dropdown-list';

        // Insert wrapper after original select
        this.originalSelect.parentNode.insertBefore(this.wrapper, this.originalSelect.nextSibling);

        // Hide original select
        this.originalSelect.style.display = 'none';

        // Append elements
        this.wrapper.appendChild(this.input);
        this.wrapper.appendChild(this.arrow);
        this.wrapper.appendChild(this.dropdownList);

        this.renderOptions();
    }

    bindEvents() {
        // Input events
        this.input.addEventListener('input', (e) => this.handleInput(e));
        this.input.addEventListener('focus', () => this.open());
        this.input.addEventListener('keydown', (e) => this.handleKeydown(e));

        // Click outside to close
        document.addEventListener('click', (e) => {
            if (!this.wrapper.contains(e.target)) {
                this.close();
            }
        });

        // Arrow click
        this.arrow.addEventListener('click', () => {
            if (this.isOpen) {
                this.close();
            } else {
                this.open();
                this.input.focus();
            }
        });
    }

    handleInput(e) {
        const query = e.target.value.toLowerCase();
        this.filteredOptions = this.options.filter(option =>
            option.text.toLowerCase().includes(query)
        );
        this.highlightedIndex = -1;
        this.renderOptions();
        if (!this.isOpen) this.open();
    }

    handleKeydown(e) {
        if (!this.isOpen) return;

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                this.highlightedIndex = Math.min(this.highlightedIndex + 1, this.filteredOptions.length - 1);
                this.updateHighlight();
                break;
            case 'ArrowUp':
                e.preventDefault();
                this.highlightedIndex = Math.max(this.highlightedIndex - 1, -1);
                this.updateHighlight();
                break;
            case 'Enter':
                e.preventDefault();
                if (this.highlightedIndex >= 0) {
                    this.selectOption(this.filteredOptions[this.highlightedIndex]);
                }
                break;
            case 'Escape':
                this.close();
                break;
        }
    }

    renderOptions() {
        this.dropdownList.innerHTML = '';

        if (this.filteredOptions.length === 0) {
            const noResults = document.createElement('div');
            noResults.className = 'no-results';
            noResults.textContent = 'No results found';
            this.dropdownList.appendChild(noResults);
            return;
        }

        this.filteredOptions.forEach((option, index) => {
            const optionElement = document.createElement('div');
            optionElement.className = 'dropdown-option';
            optionElement.textContent = option.text;
            optionElement.setAttribute('data-value', option.value);

            optionElement.addEventListener('click', () => {
                this.selectOption(option);
            });

            this.dropdownList.appendChild(optionElement);
        });
    }

    updateHighlight() {
        const options = this.dropdownList.querySelectorAll('.dropdown-option');
        options.forEach((option, index) => {
            option.classList.toggle('highlighted', index === this.highlightedIndex);
        });

        // Scroll highlighted option into view
        if (this.highlightedIndex >= 0) {
            options[this.highlightedIndex].scrollIntoView({
                block: 'nearest'
            });
        }
    }

    selectOption(option) {
        this.selectedValue = option.value;
        this.input.value = option.text;
        this.originalSelect.value = option.value;

        // Trigger change event on original select
        const event = new Event('change', { bubbles: true });
        this.originalSelect.dispatchEvent(event);

        this.close();
    }

    open() {
        if (this.isOpen) return;

        this.isOpen = true;
        this.input.classList.add('active');
        this.dropdownList.classList.add('show');
        this.filteredOptions = [...this.options];
        this.renderOptions();
    }

    close() {
        if (!this.isOpen) return;

        this.isOpen = false;
        this.input.classList.remove('active');
        this.dropdownList.classList.remove('show');
        this.highlightedIndex = -1;
    }

    setValue(value) {
        const option = this.options.find(opt => opt.value === value);
        if (option) {
            this.selectOption(option);
        } else {
            this.input.value = '';
            this.selectedValue = '';
            this.originalSelect.value = '';
        }
    }

    refresh(newOptions) {
        this.options = newOptions;
        this.filteredOptions = [...this.options];
        if (this.isOpen) {
            this.renderOptions();
        }
    }
}

function initializeSearchableDropdowns() {
    // Initialize searchable dropdowns for form selects
    window.itemSelectDropdown = new SearchableDropdown(document.getElementById('itemSelect'));
    window.outletLocationDropdown = new SearchableDropdown(document.getElementById('outletLocation'));
    window.wasteReasonDropdown = new SearchableDropdown(document.getElementById('wasteReason'));
}

// Function to convert to Singapore time
function toSingaporeTime(date, time) {
    // Create a date object from the local date and time inputs
    const localDateTime = new Date(`${date}T${time}`);
    
    // Convert to Singapore timezone (UTC+8)
    const singaporeTime = new Date(localDateTime.toLocaleString("en-US", {timeZone: "Asia/Singapore"}));
    
    // Format as ISO string with Singapore timezone offset
    const year = singaporeTime.getFullYear();
    const month = String(singaporeTime.getMonth() + 1).padStart(2, '0');
    const day = String(singaporeTime.getDate()).padStart(2, '0');
    const hours = String(singaporeTime.getHours()).padStart(2, '0');
    const minutes = String(singaporeTime.getMinutes()).padStart(2, '0');
    const seconds = String(singaporeTime.getSeconds()).padStart(2, '0');
    
    // Return as Singapore time string in ISO format with proper timezone offset
    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}+08:00`;
}

async function confirmWastage() {
    if (!pendingWastage) return;

    try {
        // Generate unique ID
        const wastageId = 'WASTE' + String(Date.now()).slice(-6);

        // Create final wastage entry for API
        const wastageEntry = {
            id: wastageId,
            item_id: pendingWastage.itemId,
            item_name: pendingWastage.itemName,
            quantity: pendingWastage.quantity,
            location: pendingWastage.location,
            outlet_location: pendingWastage.outletLocation || null,
            reason: pendingWastage.reason,
            custom_reason: pendingWastage.customReason || null,
            notes: pendingWastage.notes || '',
            timestamp: toSingaporeTime(pendingWastage.date, pendingWastage.time),
            logged_by: currentUser.username,
            reported_by: pendingWastage.reportedBy || null,
            value_lost: Number(pendingWastage.valueLost) || 0
        };

        console.log('Sending wastage entry to API:', wastageEntry); // Debug log
        console.log('Required fields check:', {
            id: !!wastageEntry.id,
            item_id: !!wastageEntry.item_id,
            item_name: !!wastageEntry.item_name,
            quantity: !!wastageEntry.quantity,
            location: !!wastageEntry.location,
            reason: !!wastageEntry.reason,
            timestamp: !!wastageEntry.timestamp,
            logged_by: !!wastageEntry.logged_by,
            value_lost: (wastageEntry.value_lost !== undefined)
        });

        // Add wastage entry to database
        const result = await addWastageEntryToAPI(wastageEntry);
        
        // Get unit information before updating inventory (in case item gets removed)
        const itemBeforeUpdate = inventoryItems.find(item => item.id === pendingWastage.itemId);
        const itemUnit = itemBeforeUpdate ? itemBeforeUpdate.unit : 'units';
        
        // Update local inventory based on server response
        const itemIndex = inventoryItems.findIndex(item => item.id === pendingWastage.itemId);
        let inventoryUpdateSuccess = false;
        
        if (itemIndex !== -1) {
          if (result.inventory_action === 'item_removed') {
            // Remove the item from local inventory array
            inventoryItems.splice(itemIndex, 1);
            inventoryUpdateSuccess = true;
            console.log(`Item ${pendingWastage.itemId} removed from local inventory (depleted)`);
          } else if (result.remaining_quantity !== undefined) {
            // Update with the exact quantity from server response
            inventoryItems[itemIndex].quantity = result.remaining_quantity;
            inventoryUpdateSuccess = true;
            console.log(`Item ${pendingWastage.itemId} quantity updated from server. New quantity: ${result.remaining_quantity} ${itemUnit}`);
          } else {
            // Fallback: manually subtract the wasted quantity
            const newQuantity = Math.max(0, inventoryItems[itemIndex].quantity - pendingWastage.quantity);
            inventoryItems[itemIndex].quantity = newQuantity;
            inventoryUpdateSuccess = true;
            console.log(`Item ${pendingWastage.itemId} quantity updated manually. New quantity: ${newQuantity} ${itemUnit}`);
            
            // If quantity becomes 0, remove from local array (though server should handle this)
            if (newQuantity === 0) {
              inventoryItems.splice(itemIndex, 1);
              console.log(`Item ${pendingWastage.itemId} removed from local inventory (quantity reached 0)`);
            }
          }
        } else {
          console.warn(`Item ${pendingWastage.itemId} not found in local inventory for update`);
        }

        // Close modal and reset form
        closeConfirmModal();
        resetForm();

        // Reload data to ensure consistency with database
        await loadInventoryItems(); // This will refresh the dropdown and sync with database
        await loadWastageEntriesFromAPI(); // Reload wastage entries to show the new entry
        await loadStatisticsFromAPI(); // Update statistics

        // Show success notification with inventory action info
        let successMessage = 'Wastage entry logged successfully!';
        
        if (result.inventory_action === 'item_removed') {
            successMessage += ' Item has been removed from inventory (stock depleted).';
        } else if (result.inventory_action === 'quantity_updated' && result.remaining_quantity !== undefined) {
            successMessage += ` Remaining stock: ${result.remaining_quantity} ${itemUnit}.`;
        } else if (result.remaining_quantity !== undefined) {
            // Handle any case where remaining_quantity is provided
            successMessage += ` Remaining stock: ${result.remaining_quantity} ${itemUnit}.`;
        } else if (inventoryUpdateSuccess) {
            // Show updated quantity from local calculation as fallback
            const updatedItem = inventoryItems.find(item => item.id === pendingWastage.itemId);
            if (updatedItem && updatedItem.quantity > 0) {
                successMessage += ` Remaining stock: ${updatedItem.quantity} ${itemUnit}.`;
            } else {
                successMessage += ' Item stock has been updated.';
            }
        }
        
        console.log('Server response:', result); // Debug log
        showNotification(successMessage, 'success');

    } catch (error) {
        console.error('Error confirming wastage:', error);
        let errorMessage = 'Failed to log wastage entry. Please try again.';
        if (error.message.includes('Missing required fields')) {
            errorMessage = 'Missing required information. Please check all fields are filled correctly.';
        } else if (error.message.includes('Failed to fetch')) {
            errorMessage = 'Connection error. Please check your internet connection and try again.';
        }
        showNotification(errorMessage, 'error');
    }
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
        'overproduction': 'Overproduction',
        'overproduce': 'Overproduction',
        'equipment_failure': 'Equipment Failure',
        'other': 'Other/Custom Reason'
    };
    return reasons[reason] || reason;
}

function displayWastageHistory() {
    const tableBody = document.getElementById('historyTableBody');

    // Sort by timestamp (newest first) - API should already handle this, but just in case
    const sortedEntries = [...wastageEntries].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    // Populate table
    tableBody.innerHTML = '';

    if (sortedEntries.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="8" style="text-align: center; color: #666; padding: 2rem;">No wastage entries found</td></tr>';
        return;
    }

    sortedEntries.forEach(entry => {
        const row = document.createElement('tr');

        // Format timestamp for Singapore time display
        let date;
        if (entry.timestamp.includes('+08:00')) {
            // If it's already in Singapore time format, parse it directly
            date = new Date(entry.timestamp);
        } else {
            // If it's in UTC format, convert to Singapore time
            const utcDate = new Date(entry.timestamp);
            date = new Date(utcDate.toLocaleString("en-US", {timeZone: "Asia/Singapore"}));
        }
        
        // Format using Singapore locale
        const formattedDate = date.toLocaleDateString('en-SG', {
            timeZone: 'Asia/Singapore',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        }) + ' ' + date.toLocaleTimeString('en-SG', {
            timeZone: 'Asia/Singapore',
            hour: '2-digit',
            minute: '2-digit'
        });

        // Get unit from inventory database for this entry
        const inventoryItem = inventoryItems.find(item => item.id === entry.item_id);
        const itemUnit = inventoryItem ? inventoryItem.unit : 'units'; // Fallback to 'units' if not found

        // Format location
        let locationDisplay = entry.location === 'factory' ? 'Factory' : 'Outlet';

        if (entry.outlet_location) {
            const outletNames = {
                'main_outlet': 'Main Outlet',
                'downtown_branch': 'Downtown Branch',
                'mall_kiosk': 'Mall Kiosk',
                'airport_branch': 'Airport Branch',
                'pau_central_outlet': 'PAU Central Outlet',
                'airport_food_court': 'Airport Food Court'
            };
            const outletName = outletNames[entry.outlet_location] || entry.outlet_location;
            locationDisplay = outletName; // Show outlet name instead of "Outlet"
        }

        // Format reason - handle custom reasons properly
        let reasonText;
        if (entry.reason === 'other' && entry.custom_reason) {
            reasonText = entry.custom_reason;
        } else if (entry.reason === 'other' && !entry.custom_reason) {
            reasonText = 'Other (no details provided)';
        } else {
            reasonText = getReasonText(entry.reason);
        }
        const reasonDisplay = `<span class="reason-badge">${reasonText}</span>`;

        // Format value (only for supervisors)
        const valueDisplay = currentUser.role === 'supervisor' ?
            `<span class="value-display">$${parseFloat(entry.value_lost).toFixed(2)}</span>` :
            '<span style="color: #999;">Hidden</span>';

        row.innerHTML = `
            <td>${formattedDate}</td>
            <td>${locationDisplay}</td>
            <td>${entry.item_name}<br><small>${entry.id}</small></td>
            <td>${entry.quantity} ${itemUnit}</td>
            <td>${reasonDisplay}</td>
            <td>${valueDisplay}</td>
            <td>${entry.logged_by}${entry.reported_by ? `<br><small>Reported by: ${entry.reported_by}</small>` : ''}</td>
            <td>${entry.notes || '-'}</td>
        `;

        tableBody.appendChild(row);
    });
}

function filterHistory() {
    // Get filter values
    const dateFilter = document.getElementById('filterDate').value;
    const locationFilter = document.getElementById('filterLocation').value;
    const reasonFilter = document.getElementById('filterReason').value;

    // Load filtered data from API
    loadWastageEntriesFromAPI(dateFilter, locationFilter, reasonFilter);
}

function updateStatistics() {
    // Use the API statistics function instead of local calculation
    loadStatisticsFromAPI();
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
window.onclick = function (event) {
    const modal = document.getElementById('confirmModal');
    if (event.target === modal) {
        closeConfirmModal();
    }
}
