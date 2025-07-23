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
    // Force update to PAU Bakery inventory data (override any cached data)
    inventoryItems = [
            // Raw Ingredients
            {
                id: 'INV001',
                name: 'All Purpose Flour',
                type: 'raw_ingredient',
                location: 'factory',
                quantity: 15,
                unit: 'kg',
                price: 2.50,
                minStock: 50,
                supplier: 'Golden Wheat Co.',
                expiryDate: '2025-12-31'
            },
            {
                id: 'INV002',
                name: 'Sugar',
                type: 'raw_ingredient',
                location: 'factory',
                quantity: 22,
                unit: 'kg',
                price: 1.80,
                minStock: 20,
                supplier: 'Sweet Supply Ltd.',
                expiryDate: '2026-06-15'
            },
            {
                id: 'INV003',
                name: 'Instant Dry Yeast',
                type: 'raw_ingredient',
                location: 'factory',
                quantity: 3.2,
                unit: 'kg',
                price: 10.00,
                minStock: 3,
                supplier: 'Golden Wheat Co.',
                expiryDate: '2025-09-30'
            },
            {
                id: 'INV004',
                name: 'Cooking Oil',
                type: 'raw_ingredient',
                location: 'factory',
                quantity: 8,
                unit: 'L',
                price: 4.50,
                minStock: 5,
                supplier: 'Golden Wheat Co.',
                expiryDate: '2025-11-20'
            },
            {
                id: 'INV005',
                name: 'Salt',
                type: 'raw_ingredient',
                location: 'factory',
                quantity: 10,
                unit: 'kg',
                price: 1.20,
                minStock: 5,
                supplier: 'Sweet Supply Ltd.',
                expiryDate: '2027-01-01'
            },
            {
                id: 'INV006',
                name: 'Baking Powder',
                type: 'raw_ingredient',
                location: 'factory',
                quantity: 2.5,
                unit: 'kg',
                price: 1.20,
                minStock: 2,
                supplier: 'Sweet Supply Ltd.',
                expiryDate: '2025-10-15'
            },
            {
                id: 'INV007',
                name: 'Char Siew',
                type: 'raw_ingredient',
                location: 'factory',
                quantity: 5,
                unit: 'kg',
                price: 12.00,
                minStock: 3,
                supplier: 'Filling Co.',
                expiryDate: '2025-07-23'
            },
            {
                id: 'INV008',
                name: 'Red Bean Paste',
                type: 'raw_ingredient',
                location: 'factory',
                quantity: 8,
                unit: 'kg',
                price: 6.00,
                minStock: 5,
                supplier: 'Filling Co.',
                expiryDate: '2025-08-30'
            },
            {
                id: 'INV009',
                name: 'Lotus Seed Paste',
                type: 'raw_ingredient',
                location: 'factory',
                quantity: 6,
                unit: 'kg',
                price: 8.00,
                minStock: 4,
                supplier: 'Filling Co.',
                expiryDate: '2025-08-15'
            },
            {
                id: 'INV010',
                name: 'Custard Filling',
                type: 'raw_ingredient',
                location: 'factory',
                quantity: 4,
                unit: 'kg',
                price: 7.50,
                minStock: 3,
                supplier: 'Filling Co.',
                expiryDate: '2025-07-28'
            },
            {
                id: 'INV011',
                name: 'Mushroom & Veg Mix',
                type: 'raw_ingredient',
                location: 'factory',
                quantity: 7,
                unit: 'kg',
                price: 6.00,
                minStock: 5,
                supplier: 'Filling Co.',
                expiryDate: '2025-07-25'
            },
            // Finished PAU Products
            {
                id: 'INV012',
                name: 'Classic Pau',
                type: 'finished_product',
                location: 'outlet',
                quantity: 45,
                unit: 'pcs',
                price: 3.50,
                minStock: 20,
                supplier: 'In-house Production',
                expiryDate: '2025-07-23'
            },
            {
                id: 'INV013',
                name: 'Char Siew Pau',
                type: 'finished_product',
                location: 'outlet',
                quantity: 32,
                unit: 'pcs',
                price: 4.50,
                minStock: 15,
                supplier: 'In-house Production',
                expiryDate: '2025-07-23'
            },
            {
                id: 'INV014',
                name: 'Nai Wong Bao',
                type: 'finished_product',
                location: 'outlet',
                quantity: 28,
                unit: 'pcs',
                price: 3.00,
                minStock: 15,
                supplier: 'In-house Production',
                expiryDate: '2025-07-23'
            },
            {
                id: 'INV015',
                name: 'Red Bean Pau',
                type: 'finished_product',
                location: 'outlet',
                quantity: 22,
                unit: 'pcs',
                price: 4.50,
                minStock: 12,
                supplier: 'In-house Production',
                expiryDate: '2025-07-23'
            },
            {
                id: 'INV016',
                name: 'Lotus Bao',
                type: 'finished_product',
                location: 'outlet',
                quantity: 18,
                unit: 'pcs',
                price: 5.00,
                minStock: 10,
                supplier: 'In-house Production',
                expiryDate: '2025-07-23'
            },
            {
                id: 'INV017',
                name: 'Vegetarian Bao',
                type: 'finished_product',
                location: 'outlet',
                quantity: 35,
                unit: 'pcs',
                price: 2.50,
                minStock: 18,
                supplier: 'In-house Production',
                expiryDate: '2025-07-23'
            }
        ];
    
    // Force update and save to localStorage
    localStorage.setItem('inventoryItems', JSON.stringify(inventoryItems));
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
    
    // Refresh the searchable dropdown if it exists
    if (window.itemSelectDropdown) {
        const newOptions = Array.from(itemSelect.options).slice(1);
        window.itemSelectDropdown.refresh(newOptions);
    }
}

function initializeWastageData() {
    // Load from localStorage if available, otherwise initialize empty
    const savedWastage = localStorage.getItem('wastageEntries');
    if (savedWastage) {
        wastageEntries = JSON.parse(savedWastage);
    } else {
        // Sample PAU wastage data for demonstration
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        
        wastageEntries = [
            {
                id: 'WASTE001',
                itemId: 'INV013',
                itemName: 'Char Siew Pau',
                quantity: 8,
                unit: 'pcs',
                location: 'outlet',
                outletLocation: 'pau_central_outlet',
                reason: 'expired',
                customReason: null,
                notes: 'End of day unsold PAU - passed optimal freshness for sale',
                timestamp: yesterday.toISOString(),
                loggedBy: currentUser.username,
                reportedBy: 'Outlet Manager',
                valueLost: 36.00
            },
            {
                id: 'WASTE002',
                itemId: 'INV007',
                itemName: 'Char Siew',
                quantity: 0.5,
                unit: 'kg',
                location: 'factory',
                outletLocation: null,
                reason: 'contaminated',
                customReason: null,
                notes: 'Foreign material found during inspection - discarded entire batch as precaution',
                timestamp: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 9, 15).toISOString(),
                loggedBy: 'production_supervisor',
                reportedBy: null,
                valueLost: 6.00
            },
            {
                id: 'WASTE003',
                itemId: 'INV012',
                itemName: 'Classic Pau',
                quantity: 12,
                unit: 'pcs',
                location: 'outlet',
                outletLocation: 'shopping_mall_kiosk',
                reason: 'damaged',
                customReason: null,
                notes: 'Damaged during delivery transport - steamer container shifted',
                timestamp: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 11, 30).toISOString(),
                loggedBy: 'delivery_staff',
                reportedBy: 'Mall Kiosk Staff',
                valueLost: 42.00
            },
            {
                id: 'WASTE004',
                itemId: 'INV016',
                itemName: 'Lotus Bao',
                quantity: 6,
                unit: 'pcs',
                location: 'outlet',
                outletLocation: 'downtown_pau_branch',
                reason: 'quality_issues',
                customReason: null,
                notes: 'Filling not properly sealed - lotus paste leaking from several units',
                timestamp: yesterday.toISOString(),
                loggedBy: 'quality_controller',
                reportedBy: 'Branch Staff',
                valueLost: 30.00
            },
            {
                id: 'WASTE005',
                itemId: 'INV010',
                itemName: 'Custard Filling',
                quantity: 0.3,
                unit: 'kg',
                location: 'factory',
                outletLocation: null,
                reason: 'production_error',
                customReason: null,
                notes: 'Overcooking during preparation - texture became grainy and unusable',
                timestamp: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 7, 45).toISOString(),
                loggedBy: 'baker_jane',
                reportedBy: null,
                valueLost: 2.25
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
        
        switch(e.key) {
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
