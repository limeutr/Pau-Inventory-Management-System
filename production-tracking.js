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
    
    // Initialize searchable dropdowns
    initializeSearchableDropdowns();
    
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
    // Force update to PAU Bakery inventory data (override any cached data)
    inventoryItems = [
            // Raw Ingredients
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
                name: 'Instant Dry Yeast',
                type: 'raw_ingredient',
                location: 'factory',
                quantity: 3.2,
                unit: 'kg'
            },
            {
                id: 'INV004',
                name: 'Cooking Oil',
                type: 'raw_ingredient',
                location: 'factory',
                quantity: 8,
                unit: 'L'
            },
            {
                id: 'INV005',
                name: 'Salt',
                type: 'raw_ingredient',
                location: 'factory',
                quantity: 10,
                unit: 'kg'
            },
            {
                id: 'INV006',
                name: 'Baking Powder',
                type: 'raw_ingredient',
                location: 'factory',
                quantity: 2.5,
                unit: 'kg'
            },
            {
                id: 'INV007',
                name: 'Char Siew',
                type: 'raw_ingredient',
                location: 'factory',
                quantity: 5,
                unit: 'kg'
            },
            {
                id: 'INV008',
                name: 'Red Bean Paste',
                type: 'raw_ingredient',
                location: 'factory',
                quantity: 8,
                unit: 'kg'
            },
            {
                id: 'INV009',
                name: 'Lotus Seed Paste',
                type: 'raw_ingredient',
                location: 'factory',
                quantity: 6,
                unit: 'kg'
            },
            {
                id: 'INV010',
                name: 'Custard Filling',
                type: 'raw_ingredient',
                location: 'factory',
                quantity: 4,
                unit: 'kg'
            },
            {
                id: 'INV011',
                name: 'Mushroom & Veg Mix',
                type: 'raw_ingredient',
                location: 'factory',
                quantity: 7,
                unit: 'kg'
            },
            // Finished Products - Factory stock ready for shipping
            {
                id: 'INV012',
                name: 'Classic Pau',
                type: 'finished_product',
                location: 'factory',
                quantity: 45,
                unit: 'pcs'
            },
            {
                id: 'INV013',
                name: 'Char Siew Pau',
                type: 'finished_product',
                location: 'factory',
                quantity: 32,
                unit: 'pcs'
            },
            {
                id: 'INV014',
                name: 'Nai Wong Bao',
                type: 'finished_product',
                location: 'factory',
                quantity: 28,
                unit: 'pcs'
            },
            {
                id: 'INV015',
                name: 'Red Bean Pau',
                type: 'finished_product',
                location: 'factory',
                quantity: 22,
                unit: 'pcs'
            },
            {
                id: 'INV016',
                name: 'Lotus Bao',
                type: 'finished_product',
                location: 'factory',
                quantity: 18,
                unit: 'pcs'
            },
            {
                id: 'INV017',
                name: 'Vegetarian Bao',
                type: 'finished_product',
                location: 'factory',
                quantity: 35,
                unit: 'pcs'
            }
        ];
    
    // Force update and save to localStorage
    localStorage.setItem('inventoryItems', JSON.stringify(inventoryItems));
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
    
    // Refresh the searchable dropdown if it exists
    if (window.itemSelectDropdown) {
        const newOptions = Array.from(itemSelect.options).slice(1);
        window.itemSelectDropdown.refresh(newOptions);
    }
}

function initializeProductionData() {
    // Sample production entries for PAU bakery demonstration
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    productionEntries = [
        {
            id: 'PE001',
            itemId: 'INV012',
            itemName: 'Classic Pau',
            type: 'inbound',
            quantity: 60,
            unit: 'pcs',
            timestamp: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 6, 30),
            staff: currentUser.username,
            notes: 'Early morning production batch',
            batchNumber: 'CP2025072201'
        },
        {
            id: 'PE002',
            itemId: 'INV013',
            itemName: 'Char Siew Pau',
            type: 'inbound',
            quantity: 40,
            unit: 'pcs',
            timestamp: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 7, 15),
            staff: currentUser.username,
            notes: 'Fresh char siew batch',
            batchNumber: 'CSP2025072201'
        },
        {
            id: 'PE003',
            itemId: 'INV016',
            itemName: 'Lotus Bao',
            type: 'inbound',
            quantity: 30,
            unit: 'pcs',
            timestamp: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 8, 0),
            staff: currentUser.username,
            notes: 'Premium lotus seed filling batch',
            batchNumber: 'LB2025072201'
        },
        {
            id: 'PE004',
            itemId: 'INV012',
            itemName: 'Classic Pau',
            type: 'outbound',
            quantity: 35,
            unit: 'pcs',
            timestamp: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 9, 30),
            destination: 'pau_central_outlet',
            staff: currentUser.username,
            notes: 'Morning delivery to main outlet',
            batchNumber: 'CP2025072201'
        },
        {
            id: 'PE005',
            itemId: 'INV013',
            itemName: 'Char Siew Pau',
            type: 'outbound',
            quantity: 20,
            unit: 'pcs',
            timestamp: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 10, 0),
            destination: 'downtown_pau_branch',
            staff: currentUser.username,
            notes: 'Popular item delivery',
            batchNumber: 'CSP2025072201'
        },
        {
            id: 'PE006',
            itemId: 'INV017',
            itemName: 'Vegetarian Bao',
            type: 'outbound',
            quantity: 25,
            unit: 'pcs',
            timestamp: new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate(), 15, 30),
            destination: 'shopping_mall_kiosk',
            staff: 'john',
            notes: 'Afternoon vegetarian option delivery',
            batchNumber: 'VB2025072101'
        },
        {
            id: 'PE007',
            itemId: 'INV014',
            itemName: 'Nai Wong Bao',
            type: 'inbound',
            quantity: 35,
            unit: 'pcs',
            timestamp: new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate(), 7, 45),
            staff: 'mary',
            notes: 'Custard filled bao production',
            batchNumber: 'NWB2025072101'
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
    const inboundSource = document.getElementById('inboundSource');
    const outboundDestination = document.getElementById('outboundDestination');
    const sourceOutletSelect = document.getElementById('sourceOutlet');
    const destinationSelect = document.getElementById('destination');
    const submitBtn = document.getElementById('submitBtn');
    
    if (type === 'outbound') {
        inboundSource.style.display = 'none';
        outboundDestination.style.display = 'grid';
        sourceOutletSelect.required = false;
        destinationSelect.required = true;
        submitBtn.textContent = 'Record Outbound Entry';
    } else {
        inboundSource.style.display = 'grid';
        outboundDestination.style.display = 'none';
        sourceOutletSelect.required = true;
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
        notes: formData.get('notes') || ''
    };
    
    if (currentEntryType === 'outbound') {
        entry.destination = formData.get('destination');
        entry.batchNumber = formData.get('batchNumber') || '';
    } else {
        entry.sourceOutlet = formData.get('sourceOutlet');
        entry.batchNumber = formData.get('inboundBatchNumber') || '';
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
    
    let locationText = '';
    if (entry.type === 'inbound' && entry.sourceOutlet) {
        locationText = ` from ${entry.sourceOutlet.replace(/_/g, ' ').toUpperCase()}`;
    } else if (entry.type === 'outbound' && entry.destination) {
        locationText = ` to ${entry.destination.replace(/_/g, ' ').toUpperCase()}`;
    }
    
    const entryTypeText = entry.type === 'inbound' ? 'Add to Inventory' : 'Ship to Outlet';
    
    confirmationText.innerHTML = `
        <div style="margin-bottom: 10px;"><strong>Type:</strong> ${entryTypeText}${locationText}</div>
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
    window.destinationDropdown = new SearchableDropdown(document.getElementById('destination'));
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
        
        let locationText = '-';
        if (entry.type === 'inbound' && entry.sourceOutlet) {
            locationText = entry.sourceOutlet.replace(/_/g, ' ').toUpperCase();
        } else if (entry.type === 'outbound' && entry.destination) {
            locationText = entry.destination.replace(/_/g, ' ').toUpperCase();
        } else if (entry.type === 'inbound') {
            locationText = 'Factory Production';
        }
        
        row.innerHTML = `
            <td class="timestamp">${entry.timestamp.toLocaleString()}</td>
            <td><span class="entry-type ${entry.type}">${entry.type}</span></td>
            <td><strong>${entry.itemName}</strong></td>
            <td class="quantity">${entry.quantity} ${entry.unit}</td>
            <td>${locationText}</td>
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
