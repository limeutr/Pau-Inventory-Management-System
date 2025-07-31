// Production Tracking System
let productionEntries = [];
let inventoryItems = [];
let currentUser = {};
let currentEntryType = 'inbound';
let pendingEntry = null;

// Initialize the system
document.addEventListener('DOMContentLoaded', async function() {
    // Check authentication and role
    checkAuthAndRole();
    
    // Setup logout functionality
    setupLogout();
    
    // Update welcome message and role badge
    updateUserInfo();
    
    // Load inventory items FIRST and wait for them to load
    await loadInventoryItems();
    
    // Initialize production data
    initializeProductionData();
    
    // Setup form
    setupForm();
    
    // Initialize searchable dropdowns AFTER inventory is loaded
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
        // For testing purposes, create a default session instead of redirecting
        console.log('No valid session found, creating test session for development');
        sessionStorage.setItem('isLoggedIn', 'true');
        sessionStorage.setItem('userRole', 'supervisor');
        sessionStorage.setItem('username', 'testuser');
        
        currentUser = {
            username: 'testuser',
            role: 'supervisor'
        };
        return;
    }
    
    currentUser = {
        username: username,
        role: userRole
    };
}

function setupLogout() {
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            if (confirm('Are you sure you want to logout?')) {
                sessionStorage.clear();
                window.location.href = 'index.html';
            }
        });
    } else {
        console.warn('logoutBtn element not found');
    }
}

function updateUserInfo() {
    const welcomeMessage = document.getElementById('welcomeMessage');
    const roleBadge = document.getElementById('userRoleBadge');
    
    if (welcomeMessage) {
        const displayName = currentUser.username.charAt(0).toUpperCase() + currentUser.username.slice(1);
        welcomeMessage.textContent = `Welcome, ${displayName}!`;
    } else {
        console.warn('welcomeMessage element not found');
    }
    
    if (roleBadge) {
        if (currentUser.role === 'supervisor') {
            roleBadge.textContent = 'Supervisor';
            roleBadge.className = 'role-badge supervisor';
        } else {
            roleBadge.textContent = 'Staff';
            roleBadge.className = 'role-badge staff';
        }
    } else {
        console.warn('userRoleBadge element not found');
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

async function loadInventoryItems() {
    // Load inventory items from database via API
    await loadInventoryFromAPI();
}

// API Configuration
const API_BASE_URL = 'http://localhost:3000/api';

// Load inventory data from API
async function loadInventoryFromAPI() {
    try {
        console.log('Starting loadInventoryFromAPI...');
        const response = await fetch(`${API_BASE_URL}/inventory`);
        console.log('API response received:', response.status, response.statusText);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log('Raw API data:', data);
        
        // Update inventory items with data from database
        inventoryItems = data;
        console.log('inventoryItems set to:', inventoryItems);
        
        // Force update and save to localStorage as fallback
        localStorage.setItem('inventoryItems', JSON.stringify(inventoryItems));
        populateItemSelect();
        
        console.log('Inventory data loaded from database:', inventoryItems.length, 'items');
    } catch (error) {
        console.error('Error loading inventory data:', error);
        
        // Fallback to hardcoded data if API fails
        console.log('Falling back to hardcoded data...');
        loadHardcodedInventoryData();
    }
}

function loadHardcodedInventoryData() {
    // Fallback: Load from localStorage if available, otherwise show empty state
    const stored = localStorage.getItem('inventoryItems');
    if (stored) {
        inventoryItems = JSON.parse(stored);
        populateItemSelect();
        console.log('Loaded inventory data from localStorage as fallback');
    } else {
        inventoryItems = [];
        populateItemSelect();
        console.log('No inventory data available - showing empty state');
    }
}

function populateItemSelect() {
    console.log('populateItemSelect called with', inventoryItems.length, 'items');
    const itemSelect = document.getElementById('itemSelect');
    
    if (!itemSelect) {
        console.error('itemSelect element not found!');
        return;
    }
    
    itemSelect.innerHTML = '<option value="">Choose an inventory item...</option>';
    
    // Show all inventory items with current quantities prominently displayed
    inventoryItems.forEach(item => {
        const option = document.createElement('option');
        option.value = item.id;
        // Enhanced display format showing current quantity first like in the provided code
        option.textContent = `${item.name} (Current: ${item.quantity} ${item.unit}) - ${item.location}`;
        option.dataset.currentStock = item.quantity;
        option.dataset.unit = item.unit;
        option.dataset.itemName = item.name;
        option.dataset.location = item.location;
        option.dataset.quantity = item.quantity; // Add this for consistency with provided code
        option.dataset.name = item.name; // Add this for consistency with provided code
        itemSelect.appendChild(option);
        console.log('Added item to dropdown:', item.name, 'quantity:', item.quantity);
    });
    
    console.log('Final dropdown has', itemSelect.options.length, 'options');
    
    // Refresh the searchable dropdown if it exists
    if (window.itemSelectDropdown) {
        const newOptions = Array.from(itemSelect.options).slice(1);
        window.itemSelectDropdown.refresh(newOptions);
        console.log('Refreshed searchable dropdown with', newOptions.length, 'options');
    }
}

function initializeProductionData() {
    // Load production entries from database via API
    loadProductionFromAPI();
}

// Load production data from API
async function loadProductionFromAPI() {
    try {
        console.log('Fetching production data from API...');
        const response = await fetch(`${API_BASE_URL}/production`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log('Received production data from API:', data.length, 'entries');
        
        // Update production entries with data from database
        productionEntries = data.map(entry => ({
            ...entry,
            // Ensure timestamp is a Date object
            timestamp: new Date(entry.timestamp)
        }));
        
        console.log('Units from database:', productionEntries.map(entry => ({
            id: entry.id,
            itemName: entry.itemName,
            unit: entry.unit
        })));
        
        console.log('Updated productionEntries array:', productionEntries.length, 'entries');
        
        // Update display
        displayProductionHistory();
        updateStatistics();
        
        console.log('Production data loaded from database:', productionEntries.length, 'entries');
    } catch (error) {
        console.error('Error loading production data:', error);
        
        // Fallback to sample data if API fails
        loadSampleProductionData();
    }
}

function loadSampleProductionData() {
    // Sample production entries for PAU bakery demonstration (fallback)
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    // Helper function to get unit from inventory
    const getItemUnit = (itemId, defaultUnit = '') => {
        const item = inventoryItems.find(inv => inv.id === itemId);
        return item ? item.unit : defaultUnit;
    };
    
    productionEntries = [
        {
            id: 'PE001',
            itemId: 'INV012',
            itemName: 'Classic Pau',
            type: 'inbound',
            quantity: 60,
            unit: getItemUnit('INV012', 'pcs'),
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
            unit: getItemUnit('INV013', 'pcs'),
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
            unit: getItemUnit('INV016', 'pcs'),
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
            unit: getItemUnit('INV012', 'pcs'),
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
            unit: getItemUnit('INV013', 'pcs'),
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
            unit: getItemUnit('INV017', 'pcs'),
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
            unit: getItemUnit('INV014', 'pcs'),
            timestamp: new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate(), 7, 45),
            staff: 'mary',
            notes: 'Custard filled bao production',
            batchNumber: 'NWB2025072101'
        }
    ];
    
    console.log('Loaded sample production data (fallback)');
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
    const dateStr = getLocalDateString(now); // Use timezone-safe function
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
    
    const selectedOption = itemSelect.selectedOptions[0];
    const currentStock = parseFloat(selectedOption.dataset.quantity || selectedOption.dataset.currentStock);
    const unit = selectedOption.dataset.unit || '';
    const quantity = parseFloat(quantityInput.value);
    
    let afterStock;
    if (currentEntryType === 'inbound') {
        afterStock = currentStock + quantity;
    } else {
        afterStock = currentStock - quantity;
    }
    
    // Update display with enhanced formatting
    currentStockSpan.textContent = `${currentStock.toFixed(2)} ${unit}`;
    afterStockSpan.textContent = `${afterStock.toFixed(2)} ${unit}`;
    
    // Enhanced warning logic from provided code
    if (currentEntryType === 'outbound' && quantity > currentStock) {
        warningRow.style.display = 'flex';
        warningText.textContent = `Insufficient stock! Available: ${currentStock.toFixed(2)} ${unit}`;
        afterStockSpan.style.color = '#dc3545';
    } else if (afterStock < 0) {
        warningRow.style.display = 'flex';
        warningText.textContent = 'This will result in negative stock!';
        afterStockSpan.style.color = '#dc3545';
    } else {
        warningRow.style.display = 'none';
        afterStockSpan.style.color = '#007bff';
    }
    
    stockInfo.style.display = 'block';
}

function handleFormSubmission() {
    const formData = new FormData(document.getElementById('productionForm'));
    const itemSelect = document.getElementById('itemSelect');
    const selectedOption = itemSelect.selectedOptions[0];
    
    if (!selectedOption) {
        showNotification('Please select an item', 'error');
        return;
    }
    
    const currentStock = parseFloat(selectedOption.dataset.quantity || selectedOption.dataset.currentStock);
    const entryQuantity = parseFloat(formData.get('quantity'));
    
    // Enhanced validation logic from provided code
    if (currentEntryType === 'outbound') {
        if (entryQuantity > currentStock) {
            showNotification('Cannot ship more than available stock', 'error');
            return;
        }
        
        if (!formData.get('destination')) {
            showNotification('Please select a destination outlet', 'error');
            return;
        }
    }
    
    // Find the selected item from inventory to get the unit
    const selectedItemId = formData.get('itemSelect');
    const selectedItem = inventoryItems.find(item => item.id === selectedItemId);
    
    // Create entry object with enhanced data structure from provided code
    // Keep original date for database storage (don't adjust here)
    const entryDate = formData.get('entryDate');
    const entryTime = formData.get('entryTime');
    
    // Create proper ISO timestamp for database storage
    const timestamp = `${entryDate}T${entryTime}:00`;
    
    const entry = {
        id: generateEntryId(),
        itemId: selectedItemId,
        item_id: selectedItemId, // Add for API compatibility
        itemName: selectedItem ? selectedItem.name : selectedOption.dataset.name,
        item: selectedItem ? selectedItem.name : selectedOption.dataset.name, // Add for API compatibility
        type: currentEntryType,
        quantity: entryQuantity,
        unit: selectedItem ? selectedItem.unit : selectedOption.dataset.unit,
        timestamp: timestamp,
        // Fix destination/source mapping
        destination: currentEntryType === 'outbound' ? formData.get('destination') : null,
        sourceOutlet: currentEntryType === 'inbound' ? formData.get('sourceOutlet') : null,
        destination_source: currentEntryType === 'outbound' ? formData.get('destination') : formData.get('sourceOutlet'),
        // Fix batch number mapping
        batchNumber: formData.get(currentEntryType === 'outbound' ? 'batchNumber' : 'inboundBatchNumber') || '',
        batch: formData.get(currentEntryType === 'outbound' ? 'batchNumber' : 'inboundBatchNumber') || '',
        staff: currentUser.username || 'System',
        notes: formData.get('notes') || ''
    };
    
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
        <div class="entry-details-container">
            <div class="entry-detail-row">
                <span class="entry-detail-label">Type:</span>
                <span class="entry-detail-value">${entryTypeText}${locationText}</span>
            </div>
            <div class="entry-detail-row">
                <span class="entry-detail-label">Item:</span>
                <span class="entry-detail-value">${entry.itemName}</span>
            </div>
            <div class="entry-detail-row">
                <span class="entry-detail-label">Quantity:</span>
                <span class="entry-detail-value">${entry.quantity} ${entry.unit}</span>
            </div>
            <div class="entry-detail-row">
                <span class="entry-detail-label">Time:</span>
                <span class="entry-detail-value">${new Date(entry.timestamp).toLocaleString()}</span>
            </div>
            ${entry.batchNumber ? `
            <div class="entry-detail-row">
                <span class="entry-detail-label">Batch:</span>
                <span class="entry-detail-value">${entry.batchNumber}</span>
            </div>` : ''}
            ${entry.notes ? `
            <div class="entry-detail-row">
                <span class="entry-detail-label">Notes:</span>
                <span class="entry-detail-value" style="white-space: pre-wrap; text-align: left;">${entry.notes}</span>
            </div>` : ''}
        </div>
    `;
    
    const itemSelect = document.getElementById('itemSelect');
    const selectedOption = itemSelect.options[itemSelect.selectedIndex];
    const currentStock = parseFloat(selectedOption.dataset.currentStock);
    const afterStock = entry.type === 'inbound' ? 
        currentStock + entry.quantity : 
        currentStock - entry.quantity;
    
    stockImpactText.innerHTML = `
        <div class="stock-impact-content">
            <div class="stock-impact-row">
                <span class="stock-impact-label">Current Stock:</span>
                <span class="stock-impact-value">${currentStock} ${entry.unit}</span>
            </div>
            <div class="stock-impact-row">
                <span class="stock-impact-label">After Entry:</span>
                <span class="stock-impact-value" style="color: ${entry.type === 'inbound' ? '#4CAF50' : '#2196F3'}; font-weight: 700;">
                    ${afterStock} ${entry.unit}
                </span>
            </div>
        </div>
    `;
    
    modal.style.display = 'block';
}

// Add new production entry via API
async function addProductionEntryToAPI(entryData) {
    try {
        const response = await fetch(`${API_BASE_URL}/production`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(entryData)
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const newEntry = await response.json();
        console.log('Production entry added to database:', newEntry);
        
        // Reload production data
        await loadProductionFromAPI();
        
        // Also reload inventory to get updated quantities
        await loadInventoryFromAPI();
        
        return newEntry;
    } catch (error) {
        console.error('Error adding production entry to database:', error);
        throw error;
    }
}

// Update inventory quantity via API (for production entries)
async function updateInventoryQuantityAPI(itemId, newQuantity) {
    try {
        // First get the current item data
        const item = inventoryItems.find(item => item.id === itemId);
        if (!item) {
            throw new Error('Item not found in inventory');
        }
        
        // If quantity reaches 0 or below, delete the item from database
        if (newQuantity <= 0) {
            console.log(`Quantity reached 0 for ${item.name}. Deleting item from inventory...`);
            
            const response = await fetch(`${API_BASE_URL}/inventory/${itemId}`, {
                method: 'DELETE'
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            console.log('Item deleted from inventory database due to zero quantity');
            return { deleted: true };
        } else {
            // Update only the quantity, keeping all other fields the same
            const response = await fetch(`${API_BASE_URL}/inventory/${itemId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: item.name,
                    type: item.type,
                    location: item.location,
                    quantity: newQuantity,
                    unit: item.unit,
                    expiryDate: item.expiryDate,
                    supplier: item.supplier,
                    minStockLevel: item.minStockLevel
                })
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            console.log('Inventory quantity updated in database');
            return { deleted: false, newQuantity };
        }
    } catch (error) {
        console.error('Error updating inventory quantity:', error);
        throw error;
    }
}

function confirmEntry() {
    if (!pendingEntry) return;
    
    // Save entry to database
    saveProductionEntryToDatabase(pendingEntry);
}

async function saveProductionEntryToDatabase(entry) {
    try {
        // Convert timestamp string to Date object if it's not already
        let timestamp = entry.timestamp;
        if (typeof timestamp === 'string') {
            timestamp = new Date(timestamp);
        }
        
        // Prepare data for API
        const entryData = {
            type: entry.type,
            itemName: entry.itemName,
            quantity: entry.quantity,
            unit: entry.unit, // Include the unit
            timestamp: timestamp.toISOString(),
            destination: entry.destination,
            sourceOutlet: entry.sourceOutlet,
            batchNumber: entry.batchNumber,
            staff: entry.staff,
            notes: entry.notes
        };
        
        console.log('Sending production entry data to API:', entryData);
        
        // Add entry to database
        await addProductionEntryToAPI(entryData);
        
        // Update inventory quantities in database
        const item = inventoryItems.find(item => item.id === entry.itemId);
        if (item) {
            let newQuantity;
            if (entry.type === 'inbound') {
                newQuantity = item.quantity + entry.quantity;
                console.log(`Inbound: Adding ${entry.quantity} ${item.unit} to ${item.name}. New quantity: ${newQuantity}`);
            } else {
                newQuantity = item.quantity - entry.quantity;
                console.log(`Outbound: Removing ${entry.quantity} ${item.unit} from ${item.name}. New quantity: ${newQuantity}`);
            }
            
            const updateResult = await updateInventoryQuantityAPI(entry.itemId, newQuantity);
            
            // Reload inventory data to get updated quantities
            await loadInventoryFromAPI();
            
            // Show appropriate success message
            let successMessage;
            if (updateResult.deleted) {
                successMessage = `${item.name} has been completely used up and removed from inventory.`;
            } else {
                const actionText = entry.type === 'inbound' ? 'added to' : 'removed from';
                successMessage = `${entry.quantity} ${item.unit} ${entry.itemName} ${actionText} inventory successfully! New quantity: ${newQuantity} ${item.unit}`;
            }
            
            // Show success notification with details
            showNotification(successMessage, 'success');
        } else {
            // Show generic success message if item not found
            showNotification('Production entry recorded successfully!', 'success');
        }
        
        // Reload production data to show the new entry
        console.log('Reloading production data after successful entry...');
        await loadProductionFromAPI();
        
        // Reset form and update displays
        resetForm();
        updateStatistics();
        
        // Close modal
        closeConfirmModal();
        
        console.log('Production entry process completed successfully');
        
    } catch (error) {
        console.error('Error saving production entry:', error);
        showNotification('Error saving production entry. Please try again.', 'error');
    }
    
    pendingEntry = null;
}

function updateInventoryQuantity(entry) {
    // Legacy function - kept for fallback but now using API
    const item = inventoryItems.find(item => item.id === entry.itemId);
    if (item) {
        if (entry.type === 'inbound') {
            item.quantity += entry.quantity;
        } else {
            item.quantity -= entry.quantity;
        }
        
        // Save to localStorage as fallback
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
        console.log('refresh() called with', newOptions.length, 'new options');
        this.options = newOptions;
        this.filteredOptions = [...this.options];
        
        if (this.isOpen) {
            this.renderOptions();
        }
    }
}

function initializeSearchableDropdowns() {
    const itemSelect = document.getElementById('itemSelect');
    const destination = document.getElementById('destination');
    
    if (itemSelect) {
        window.itemSelectDropdown = new SearchableDropdown(itemSelect);
    }
    
    if (destination) {
        window.destinationDropdown = new SearchableDropdown(destination);
    }
}

function resetForm() {
    document.getElementById('productionForm').reset();
    document.getElementById('stockInfo').style.display = 'none';
    setCurrentDateTime();
}

function displayProductionHistory() {
    console.log('displayProductionHistory called with', productionEntries.length, 'entries');
    const tableBody = document.getElementById('historyTableBody');
    tableBody.innerHTML = '';
    
    if (productionEntries.length === 0) {
        console.log('No production entries to display');
        tableBody.innerHTML = `
            <tr>
                <td colspan="10" style="text-align: center; padding: 40px; color: #666;">
                    No production entries recorded yet
                </td>
            </tr>
        `;
        return;
    }
    
    const filteredEntries = getFilteredEntries();
    console.log('Filtered entries for display:', filteredEntries.length);
    
    filteredEntries.forEach((entry, index) => {
        const row = document.createElement('tr');
        row.className = `history-row ${entry.type}`;
        
        // Format destination/source text
        let locationText = '-';
        if (entry.type === 'inbound' && entry.sourceOutlet) {
            locationText = entry.sourceOutlet.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        } else if (entry.type === 'outbound' && entry.destination) {
            locationText = entry.destination.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        } else if (entry.destinationSource) {
            locationText = entry.destinationSource.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        }
        
        // Simple date display - just show the date as inputted
        let displayTimestamp = '-';
        
        if (entry.date) {
            // Just show the date from the database as-is
            const dateObj = new Date(entry.date);
            if (!isNaN(dateObj.getTime())) {
                displayTimestamp = dateObj.toLocaleDateString('en-US');
                if (entry.time) {
                    displayTimestamp += ' ' + entry.time;
                }
            }
        } else if (entry.timestamp) {
            // Fallback to timestamp if no separate date field
            const dateObj = new Date(entry.timestamp);
            if (!isNaN(dateObj.getTime())) {
                displayTimestamp = dateObj.toLocaleString('en-US');
            }
        }
        
        // Create type badge with emoji
        const typeIcon = entry.type === 'inbound' ? '📥' : '📤';
        const typeBadge = `<span class="type-badge ${entry.type}">${typeIcon} ${entry.type.charAt(0).toUpperCase() + entry.type.slice(1)}</span>`;
        
        // Truncate notes for table display
        const truncatedNotes = entry.notes && entry.notes.length > 30 
            ? entry.notes.substring(0, 30) + '...' 
            : (entry.notes || '-');
        
        row.innerHTML = `
            <td>${displayTimestamp}</td>
            <td>${typeBadge}</td>
            <td>${entry.item || entry.itemName || '-'}</td>
            <td>${entry.quantity || 0}</td>
            <td>${entry.unit || 'pcs'}</td>
            <td>${locationText}</td>
            <td>${entry.batch || entry.batchNumber || '-'}</td>
            <td>${entry.staff || '-'}</td>
            <td>${truncatedNotes}</td>
            <td>
                <button class="view-btn" onclick="viewEntryDetails(${index})" title="View full details">👁️ View</button>
                <button class="delete-btn" onclick="deleteEntryConfirm(${index})" title="Delete entry">🗑️ Delete</button>
            </td>
        `;
        
        tableBody.appendChild(row);
    });
}

function getFilteredEntries() {
    const filterDate = document.getElementById('filterDate').value;
    const filterType = document.getElementById('filterType').value;
    
    let filtered = [...productionEntries];
    console.log('Filtering entries. Total entries:', filtered.length, 'Filter date:', filterDate, 'Filter type:', filterType);
    
    // Filter by date using timezone-safe comparison
    const today = new Date();
    const todayDateString = getLocalDateString(today);
    
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayDateString = getLocalDateString(yesterday);
    
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);
    const weekAgoDateString = getLocalDateString(weekAgo);
    
    if (filterDate === 'today') {
        filtered = filtered.filter(entry => {
            const entryDateString = getLocalDateString(new Date(entry.timestamp));
            console.log('Checking today filter for entry date:', entryDateString, 'vs today:', todayDateString);
            // Compare against original database dates (no adjustment for filtering)
            return entryDateString === todayDateString;
        });
    } else if (filterDate === 'yesterday') {
        filtered = filtered.filter(entry => {
            const entryDateString = getLocalDateString(new Date(entry.timestamp));
            return entryDateString === yesterdayDateString;
        });
    } else if (filterDate === 'week') {
        filtered = filtered.filter(entry => {
            const entryDateString = getLocalDateString(new Date(entry.timestamp));
            return entryDateString >= weekAgoDateString;
        });
    }
    
    console.log('After date filtering:', filtered.length, 'entries remaining');
    
    // Filter by type
    if (filterType) {
        filtered = filtered.filter(entry => entry.type === filterType);
        console.log('After type filtering:', filtered.length, 'entries remaining');
    }
    
    console.log('Final filtered entries for display:', filtered.length);
    return filtered;
}

function filterHistory() {
    displayProductionHistory();
}

function updateStatistics() {
    const today = new Date();
    // Use local timezone-safe date string
    const todayDateString = getLocalDateString(today);
    
    console.log('Updating statistics for date:', todayDateString);
    console.log('Total production entries:', productionEntries.length);
    
    // Filter entries for today, handling different timestamp formats
    const todayEntries = productionEntries.filter(entry => {
        let entryDateString;
        
        // Handle different timestamp formats from database - use same logic as display
        if (entry.date) {
            // Just show the date from the database as-is
            const dateObj = new Date(entry.date);
            if (!isNaN(dateObj.getTime())) {
                entryDateString = dateObj.toLocaleDateString('en-US');
            }
        } else if (entry.timestamp) {
            // Fallback to timestamp if no separate date field
            const dateObj = new Date(entry.timestamp);
            if (!isNaN(dateObj.getTime())) {
                entryDateString = dateObj.toLocaleDateString('en-US');
            }
        }
        
        // Compare the formatted date strings
        const todayFormatted = today.toLocaleDateString('en-US');
        console.log('Comparing entry date:', entryDateString, 'vs today:', todayFormatted);
        return entryDateString === todayFormatted;
    });
    
    console.log('Today\'s entries found:', todayEntries.length);
    
    const todayInbound = todayEntries.filter(entry => entry.type === 'inbound');
    const todayOutbound = todayEntries.filter(entry => entry.type === 'outbound');
    
    console.log('Today\'s inbound entries:', todayInbound.length);
    console.log('Today\'s outbound entries:', todayOutbound.length);
    
    // Calculate total quantities for today only
    const todayTotalProduction = todayInbound.reduce((sum, entry) => {
        const quantity = parseFloat(entry.quantity) || 0;
        return sum + quantity;
    }, 0);
    
    const todayItemsShipped = todayOutbound.reduce((sum, entry) => {
        const quantity = parseFloat(entry.quantity) || 0;
        return sum + quantity;
    }, 0);
    
    console.log('Total production today:', todayTotalProduction);
    console.log('Items shipped today:', todayItemsShipped);
    
    // Update the UI elements - all statistics now reflect today's data only
    document.getElementById('todayInbound').textContent = todayInbound.length;
    document.getElementById('todayOutbound').textContent = todayOutbound.length;
    document.getElementById('totalProduction').textContent = Math.round(todayTotalProduction);
    document.getElementById('itemsShipped').textContent = Math.round(todayItemsShipped);
}

// Helper function to get timezone-safe date string (YYYY-MM-DD format)
function getLocalDateString(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// Simple function to add 1 day to a date string (YYYY-MM-DD format)
function addOneDayToDate(dateString) {
    const date = new Date(dateString + 'T00:00:00');
    date.setDate(date.getDate() + 1);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// Alternative helper - add 1 day to compensate for timezone issues
function addOneDayToDateString(dateString) {
    const date = new Date(dateString + 'T12:00:00'); // Add noon time to avoid timezone issues
    date.setDate(date.getDate() + 1);
    return getLocalDateString(date);
}

// Helper to parse date string safely (adds 1 day if needed)
function parseDateStringSafely(dateString, shouldAddDay = false) {
    if (shouldAddDay) {
        return addOneDayToDateString(dateString);
    }
    // Parse date at noon to avoid timezone edge cases
    return new Date(dateString + 'T12:00:00');
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
    const viewModal = document.getElementById('viewModal');
    if (e.target === modal) {
        closeConfirmModal();
    }
    if (e.target === viewModal) {
        closeViewModal();
    }
});

// View Entry Details Functions
function viewEntryDetails(entryIndex) {
    const filteredEntries = getFilteredEntries();
    const entry = filteredEntries[entryIndex];
    
    if (!entry) {
        console.error('Entry not found at index:', entryIndex);
        return;
    }
    
    // Store current entry for potential deletion
    currentEntryToDelete = entry;
    
    // Populate modal with entry details
    document.getElementById('viewEntryId').textContent = entry.id || 'N/A';
    document.getElementById('viewEntryType').innerHTML = `<span class="type-badge ${entry.type}">${entry.type === 'inbound' ? '📥' : '📤'} ${entry.type.charAt(0).toUpperCase() + entry.type.slice(1)}</span>`;
    
    // Simple date display - just show the date as inputted
    let displayTimestamp = 'N/A';
    
    if (entry.date) {
        // Just show the date from the database as-is
        const dateObj = new Date(entry.date);
        if (!isNaN(dateObj.getTime())) {
            displayTimestamp = dateObj.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
            if (entry.time) {
                displayTimestamp += ' at ' + entry.time;
            }
        }
    } else if (entry.timestamp) {
        // Fallback to timestamp if no separate date field
        const dateObj = new Date(entry.timestamp);
        if (!isNaN(dateObj.getTime())) {
            displayTimestamp = dateObj.toLocaleString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: true
            });
        }
    }
    document.getElementById('viewTimestamp').textContent = displayTimestamp;
    
    document.getElementById('viewStaff').textContent = entry.staff || 'N/A';
    document.getElementById('viewItemName').textContent = entry.item || entry.itemName || 'N/A';
    document.getElementById('viewQuantity').textContent = entry.quantity || '0';
    document.getElementById('viewUnit').textContent = entry.unit || '';
    document.getElementById('viewBatch').textContent = entry.batch || entry.batchNumber || 'N/A';
    
    // Location information
    let locationText = 'N/A';
    if (entry.type === 'inbound' && entry.sourceOutlet) {
        locationText = entry.sourceOutlet.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    } else if (entry.type === 'outbound' && entry.destination) {
        locationText = entry.destination.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    } else if (entry.destinationSource) {
        locationText = entry.destinationSource.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    }
    document.getElementById('viewLocation').textContent = locationText;
    document.getElementById('viewSourceOutlet').textContent = entry.sourceOutlet ? entry.sourceOutlet.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'N/A';
    
    // Notes
    const notesElement = document.getElementById('viewNotes');
    if (entry.notes && entry.notes.trim()) {
        notesElement.textContent = entry.notes;
        notesElement.style.fontStyle = 'normal';
        notesElement.style.color = '#333';
    } else {
        notesElement.textContent = 'No notes provided for this entry.';
        notesElement.style.fontStyle = 'italic';
        notesElement.style.color = '#666';
    }
    
    // Show modal
    document.getElementById('viewModal').style.display = 'block';
}

function closeViewModal() {
    document.getElementById('viewModal').style.display = 'none';
}

// Delete Entry Functions
let currentEntryToDelete = null;

function deleteEntryConfirm(entryIndex) {
    const filteredEntries = getFilteredEntries();
    const entry = filteredEntries[entryIndex];
    
    if (!entry) {
        console.error('Entry not found at index:', entryIndex);
        return;
    }
    
    currentEntryToDelete = entry;
    
    // Show confirmation dialog
    const confirmMessage = `Are you sure you want to delete this ${entry.type} entry?\n\n` +
        `Item: ${entry.item || entry.itemName || 'N/A'}\n` +
        `Quantity: ${entry.quantity || 0} ${entry.unit || ''}\n` +
        `Date: ${entry.timestamp ? new Date(entry.timestamp).toLocaleDateString() : 'N/A'}\n\n` +
        `This action cannot be undone.`;
    
    if (confirm(confirmMessage)) {
        deleteEntry();
    }
}

async function deleteEntry() {
    if (!currentEntryToDelete) {
        console.error('No entry selected for deletion');
        return;
    }
    
    const entryId = currentEntryToDelete.id;
    
    if (!entryId) {
        console.error('Entry ID not found');
        alert('Error: Cannot delete entry - ID not found');
        return;
    }
    
    try {
        console.log('Deleting entry with ID:', entryId);
        
        const response = await fetch(`http://localhost:3000/api/production/${entryId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        console.log('Delete response:', result);
        
        // Remove from local array
        const entryIndex = productionEntries.findIndex(entry => entry.id === entryId);
        if (entryIndex !== -1) {
            productionEntries.splice(entryIndex, 1);
        }
        
        // Close modal if it's open
        closeViewModal();
        
        // Refresh the display
        displayProductionHistory();
        updateStatistics();
        
        // Show success notification
        showNotification('Entry deleted successfully!', 'success');
        
        // Clear the current entry
        currentEntryToDelete = null;
        
    } catch (error) {
        console.error('Error deleting entry:', error);
        alert('Error deleting entry: ' + error.message);
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
`;
document.head.appendChild(style);

function addItem(name, quantity) {
    if (!name || quantity <= 0) {
        alert("Invalid item name or quantity.");
        return;
    }

    const newItem = {
        id: nextItemId++,
        name: name,
        quantity: quantity
    };

    try {
        inventoryItems.push(newItem);
        localStorage.setItem('inventoryItems', JSON.stringify(inventoryItems));
        displayItems(); // or whatever function updates the UI
    } catch (error) {
        console.error("Error saving item:", error);
        alert("There was an error saving the item. Please try again.");
    }
}
