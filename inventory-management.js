// Inventory Management System
let inventoryItems = [];
let nextItemId = 1;
let currentUser = {};
let filteredItems = [];

// Initialize the system
document.addEventListener('DOMContentLoaded', function() {
    // Check authentication and role
    checkAuthAndRole();
    
    // Setup logout functionality
    setupLogout();
    
    // Update welcome message and role badge
    updateUserInfo();
    
    // Initialize inventory data
    initializeInventoryData();
    
    // Setup form submission
    setupFormSubmission();
    
    // Initialize searchable dropdowns
    initializeSearchableDropdowns();
    
    // Load and display inventory
    displayInventoryItems();
    
    // Update statistics
    updateStatistics();
});

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
    
    // Public method to update value externally
    updateValue(value) {
        this.setValue(value);
    }
}

// Store searchable dropdown instances
let searchableDropdowns = {};

function initializeSearchableDropdowns() {
    // Initialize searchable dropdowns for form selects
    const selectElements = document.querySelectorAll('#itemType, #location, #unit, #supplier');
    selectElements.forEach(select => {
        searchableDropdowns[select.id] = new SearchableDropdown(select);
    });
}

// Helper function to update searchable dropdown values
function updateSearchableDropdownValue(selectId, value) {
    if (searchableDropdowns[selectId]) {
        searchableDropdowns[selectId].setValue(value);
    }
}

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
    
    // Store user info for the session
    if (!userRole || !username) {
        window.location.href = 'index.html';
        return;
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
    const addBtn = document.querySelector('.add-btn');
    
    const displayName = currentUser.username.charAt(0).toUpperCase() + currentUser.username.slice(1);
    welcomeMessage.textContent = `Welcome, ${displayName}!`;
    
    if (currentUser.role === 'supervisor' || currentUser.role === 'admin') {
        // Supervisors and admins have full access
        if (addBtn) {
            addBtn.style.display = 'inline-block';
        }
    } else {
        // Hide add button for staff users
        if (addBtn) {
            addBtn.style.display = 'none';
        }
        // Show read-only notice for staff only
        showStaffAccessNotice();
    }
}

function showStaffAccessNotice() {
    const controlsHeader = document.querySelector('.controls-header h2');
    if (controlsHeader) {
        controlsHeader.innerHTML = '📦 Inventory Items <span style="color: #666; font-size: 0.8em; font-weight: normal;">(Read-Only Access)</span>';
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

function initializeInventoryData() {
    // Load inventory data from database via API
    loadInventoryFromAPI();
}

// API Configuration
const API_BASE_URL = 'http://localhost:3000/api';

// Load inventory data from API
async function loadInventoryFromAPI() {
    try {
        const response = await fetch(`${API_BASE_URL}/inventory`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        
        // Update inventory items with data from database
        // Always recalculate status on client side for real-time accuracy
        inventoryItems = data.map(item => ({
            ...item,
            status: calculateItemStatus(item) // Always recalculate for real-time status
        }));
        
        // Update next item ID
        const maxId = Math.max(...inventoryItems.map(item => parseInt(item.id.replace('INV', ''))), 0);
        nextItemId = maxId + 1;
        
        // Update filtered items
        filteredItems = [...inventoryItems];
        
        // Update display
        displayInventoryItems();
        updateStatistics();
        
        console.log('Inventory data loaded from database:', inventoryItems.length, 'items');
    } catch (error) {
        console.error('Error loading inventory data:', error);
        
        // Fallback to localStorage if API fails
        const stored = localStorage.getItem('inventoryItems');
        if (stored) {
            inventoryItems = JSON.parse(stored).map(item => ({
                ...item,
                status: calculateItemStatus(item) // Recalculate status even for cached data
            }));
            filteredItems = [...inventoryItems];
            displayInventoryItems();
            updateStatistics();
            console.log('Loaded fallback data from localStorage with updated status');
        } else {
            console.warn('No inventory data available');
            inventoryItems = [];
            filteredItems = [];
            displayInventoryItems();
            updateStatistics();
        }
    }
}

// Add new item via API
async function addItemToAPI(itemData) {
    try {
        const response = await fetch(`${API_BASE_URL}/inventory`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(itemData)
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const newItem = await response.json();
        console.log('Item added to database:', newItem);
        
        // Reload inventory data
        await loadInventoryFromAPI();
        
        return newItem;
    } catch (error) {
        console.error('Error adding item to database:', error);
        throw error;
    }
}

// Update item via API
async function updateItemInAPI(itemId, itemData) {
    try {
        const response = await fetch(`${API_BASE_URL}/inventory/${itemId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(itemData)
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        console.log('Item updated in database');
        
        // Reload inventory data
        await loadInventoryFromAPI();
        
    } catch (error) {
        console.error('Error updating item in database:', error);
        throw error;
    }
}

// Delete item via API
async function deleteItemFromAPI(itemId) {
    try {
        const response = await fetch(`${API_BASE_URL}/inventory/${itemId}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        console.log('Item deleted from database');
        
        // Reload inventory data
        await loadInventoryFromAPI();
        
    } catch (error) {
        console.error('Error deleting item from database:', error);
        throw error;
    }
}

function generateItemId() {
    return `INV${String(nextItemId++).padStart(3, '0')}`;
}
function calculateItemStatus(item) {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Start of today's date

    // Fix timezone issue by parsing date without timezone conversion
    const expiryDate = new Date(item.expiryDate + 'T00:00:00');
    expiryDate.setDate(expiryDate.getDate() + 1); // Add 1 day to fix timezone display issue
    expiryDate.setHours(0, 0, 0, 0);

    const daysUntilExpiry = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));
    
    // Use item's specific minStockLevel from database or default to 5
    const minStockLevel = item.minStockLevel || 5;
    
    // Priority order (highest to lowest):
    // 1. EXPIRED    → Past expiry date
    // 2. EXPIRING   → Within 14 days of expiry
    // 3. LOW STOCK  → Quantity ≤ Stock level
    // 4. GOOD       → Everything else
    
    if (daysUntilExpiry < 0) {
        return 'expired';
    } else if (daysUntilExpiry <= 14) { // Expiring within 14 days
        return 'expiring';
    } else if (item.quantity <= minStockLevel) {
        return 'low';
    } else {
        return 'good';
    }
}

function displayInventoryItems() {
    const tableBody = document.getElementById('inventoryTableBody');
    tableBody.innerHTML = '';
    
    if (filteredItems.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="9" style="text-align: center; padding: 40px; color: #666;">
                    No inventory items found
                </td>
            </tr>
        `;
        return;
    }
    
    filteredItems.forEach(item => {
        const status = calculateItemStatus(item);
        const row = document.createElement('tr');
        
        // Add visual indicators for status
        if (status === 'expired') {
            row.style.background = '#ffebee';
        } else if (status === 'low') {
            row.style.background = '#fff8e1';
        }
        
        row.innerHTML = `
            <td><span class="item-id">${item.id}</span></td>
            <td><strong>${item.name}</strong></td>
            <td><span class="item-type ${item.type}">${item.type.replace('_', ' ')}</span></td>
            <td><span class="location-badge ${item.location}">${item.location}</span></td>
            <td><span class="quantity">${item.quantity} ${item.unit}</span></td>
            <td style="display: none;">${item.unit}</td>
            <td>${formatDate(item.expiryDate)}</td>
            <td><span class="supplier">${item.supplier || 'In-house Production'}</span></td>
            <td><span class="status-indicator ${status}">${getStatusText(status)}</span></td>
            <td class="actions">
                <button onclick="editItem('${item.id}')" class="action-btn edit-btn">
                    ${(currentUser.role === 'supervisor' || currentUser.role === 'admin') ? 'Edit' : 'View'}
                </button>
                <button onclick="deleteItem('${item.id}')" class="action-btn delete-btn" 
                    ${currentUser.role !== 'supervisor' && currentUser.role !== 'admin' ? 'disabled title="Only administrators and supervisors can delete items"' : ''}>
                    Delete
                </button>
            </td>
        `;
        
        tableBody.appendChild(row);
    });
}

function getStatusText(status) {
    const statusTexts = {
        'good': 'Good Stock',
        'low': 'Low Stock',
        'expired': 'Expired',
        'expiring': 'Expiring Soon'
    };
    return statusTexts[status] || 'Unknown';
}

function formatDate(dateString) {
    // Fix timezone issue by adding 1 day for display
    const date = new Date(dateString + 'T00:00:00');
    date.setDate(date.getDate() ); // Add 1 day to fix timezone display issue
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: '2-digit'
    });
}

function updateStatistics() {
    const stats = {
        total: inventoryItems.length,
        lowStock: 0,
        expired: 0,
        expiring: 0
    };
    
    inventoryItems.forEach(item => {
        const status = calculateItemStatus(item);
        if (status === 'low') stats.lowStock++;
        if (status === 'expired') stats.expired++;
        if (status === 'expiring') stats.expiring++;
    });
    
    document.getElementById('totalItems').textContent = stats.total;
    document.getElementById('lowStockItems').textContent = stats.lowStock;
    document.getElementById('expiredItems').textContent = stats.expired;
    document.getElementById('expiringSoonItems').textContent = stats.expiring;
}

function searchItems() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    filteredItems = inventoryItems.filter(item =>
        item.name.toLowerCase().includes(searchTerm) ||
        item.id.toLowerCase().includes(searchTerm) ||
        item.supplier.toLowerCase().includes(searchTerm)
    );
    displayInventoryItems();
}

function filterItems() {
    const locationFilter = document.getElementById('filterLocation').value;
    const statusFilter = document.getElementById('filterStatus').value;
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    
    filteredItems = inventoryItems.filter(item => {
        const matchesLocation = !locationFilter || item.location === locationFilter;
        const matchesStatus = !statusFilter || calculateItemStatus(item) === statusFilter;
        const matchesSearch = !searchTerm || 
            item.name.toLowerCase().includes(searchTerm) ||
            item.id.toLowerCase().includes(searchTerm) ||
            item.supplier.toLowerCase().includes(searchTerm);
        
        return matchesLocation && matchesStatus && matchesSearch;
    });
    
    displayInventoryItems();
}

// Modal Functions
function openAddItemModal() {
    if (currentUser.role !== 'supervisor' && currentUser.role !== 'admin') {
        alert('⚠️ Access Denied\n\nOnly administrators and supervisors can add new inventory items.');
        return;
    }
    
    document.getElementById('modalTitle').textContent = 'Add New Item';
    document.getElementById('itemForm').reset();
    document.getElementById('itemModal').style.display = 'block';
    
    // Set minimum date to today
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('expiryDate').min = today;
}

function editItem(itemId) {
    const item = inventoryItems.find(i => i.id === itemId);
    if (!item) return;
    
    if (currentUser.role === 'supervisor' || currentUser.role === 'admin') {
        document.getElementById('modalTitle').textContent = 'Edit Item';
    } else {
        document.getElementById('modalTitle').textContent = 'View Item Details (Read-Only)';
    }
    
    // Set form values
    document.getElementById('itemName').value = item.name;
    document.getElementById('itemType').value = item.type;
    document.getElementById('location').value = item.location;
    document.getElementById('quantity').value = item.quantity;
    document.getElementById('unit').value = item.unit;
    
    // Fix expiry date formatting to avoid timezone issues
    const expiryDate = new Date(item.expiryDate );
    expiryDate.setDate(expiryDate.getDate() ); // Add 1 day to fix timezone display issue
    const year = expiryDate.getFullYear();
    const month = String(expiryDate.getMonth() ).padStart(2, '0');
    const day = String(expiryDate.getDate()).padStart(2, '0');
    document.getElementById('expiryDate').value = `${year}-${month}-${day}`;
    
    document.getElementById('minStockLevel').value = item.minStockLevel;
    document.getElementById('supplier').value = item.supplier;
    
    // Update searchable dropdowns with current values
    setTimeout(() => {
        updateSearchableDropdownValue('itemType', item.type);
        updateSearchableDropdownValue('location', item.location);
        updateSearchableDropdownValue('unit', item.unit);
        updateSearchableDropdownValue('supplier', item.supplier);
    }, 100); // Small delay to ensure dropdowns are initialized
    
    // Make form read-only for non-admin/supervisor users
    if (currentUser.role !== 'supervisor' && currentUser.role !== 'admin') {
        const formInputs = document.querySelectorAll('#itemForm input, #itemForm select');
        formInputs.forEach(input => {
            input.disabled = true;
        });
        
        // Hide save button and show close button only
        const saveBtn = document.querySelector('.save-btn');
        if (saveBtn) {
            saveBtn.style.display = 'none';
        }
        
        const cancelBtn = document.querySelector('.cancel-btn');
        if (cancelBtn) {
            cancelBtn.textContent = 'Close';
        }
    } else {
        // Store the item ID for updating (admins and supervisors)
        document.getElementById('itemForm').dataset.editingId = itemId;
        
        // Ensure form inputs are enabled for admins and supervisors
        const formInputs = document.querySelectorAll('#itemForm input, #itemForm select');
        formInputs.forEach(input => {
            input.disabled = false;
        });
        
        // Show save button for admins and supervisors
        const saveBtn = document.querySelector('.save-btn');
        if (saveBtn) {
            saveBtn.style.display = 'inline-block';
        }
        
        const cancelBtn = document.querySelector('.cancel-btn');
        if (cancelBtn) {
            cancelBtn.textContent = 'Cancel';
        }
    }
    
    document.getElementById('itemModal').style.display = 'block';
}

function deleteItem(itemId) {
    if (currentUser.role !== 'supervisor' && currentUser.role !== 'admin') {
        alert('⚠️ Access Denied\n\nOnly administrators and supervisors are permitted to permanently delete inventory entries to prevent data loss due to accidental deletion.');
        return;
    }
    
    const item = inventoryItems.find(i => i.id === itemId);
    if (!item) return;
    
    const confirmMessage = `Are you sure you want to permanently delete "${item.name}"?\n\nThis action cannot be undone.`;
    document.getElementById('confirmMessage').textContent = confirmMessage;
    document.getElementById('confirmBtn').onclick = () => confirmDelete(itemId);
    document.getElementById('confirmModal').style.display = 'block';
}

async function confirmDelete(itemId) {
    try {
        await deleteItemFromAPI(itemId);
        closeConfirmModal();
        showNotification('Item deleted successfully', 'success');
    } catch (error) {
        console.error('Error deleting item:', error);
        showNotification('Error deleting item. Please try again.', 'error');
    }
}

function closeModal() {
    document.getElementById('itemModal').style.display = 'none';
    document.getElementById('itemForm').removeAttribute('data-editing-id');
    
    // Reset form for next use - enable all inputs
    const formInputs = document.querySelectorAll('#itemForm input, #itemForm select');
    formInputs.forEach(input => {
        input.disabled = false;
    });
    
    // Reset buttons to default state
    const saveBtn = document.querySelector('.save-btn');
    const cancelBtn = document.querySelector('.cancel-btn');
    if (saveBtn) saveBtn.style.display = 'inline-block';
    if (cancelBtn) cancelBtn.textContent = 'Cancel';
    
    // Reset form content
    document.getElementById('itemForm').reset();
}

function closeConfirmModal() {
    document.getElementById('confirmModal').style.display = 'none';
}

function setupFormSubmission() {
    document.getElementById('itemForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const formData = new FormData(this);
        const itemData = {
            name: formData.get('itemName'),
            type: formData.get('itemType'),
            location: formData.get('location'),
            quantity: parseFloat(formData.get('quantity')),
            unit: formData.get('unit'),
            expiryDate: formData.get('expiryDate'),
            minStockLevel: parseFloat(formData.get('minStockLevel')) || 0,
            supplier: formData.get('supplier') || 'In-house Production'
        };

        
        // Validate business rules
        if (!validateItemData(itemData)) {
            return;
        }
        
        const editingId = this.dataset.editingId;
        
        try {
            if (editingId) {
                // Update existing item via API
                await updateItemInAPI(editingId, itemData);
                showNotification('Item updated successfully', 'success');
            } else {
                // Add new item via API
                await addItemToAPI(itemData);
                showNotification('Item added successfully', 'success');
            }
            
            closeModal();
        } catch (error) {
            console.error('Error saving item:', error);
            showNotification('Error saving item. Please try again.', 'error');
        }
    });
}

function validateItemData(itemData) {
    // Business rule: Stock levels must remain non-negative
    if (itemData.quantity < 0) {
        alert('⚠️ Validation Error\n\nStock levels must remain non-negative. Please enter a valid quantity.');
        return false;
    }
    
    // Business rule: Minimum stock level should be reasonable
    if (itemData.minStockLevel < 0) {
        alert('⚠️ Validation Error\n\nMinimum stock level cannot be negative.');
        return false;
    }
    
    // Check if expiry date is in the past
    const today = new Date();
    const expiryDate = new Date(itemData.expiryDate);
    
    // if (expiryDate < today) {
    //     const confirmPastDate = confirm('⚠️ Expiry Date Warning\n\nThe expiry date is in the past. This item will be flagged as expired and should be removed from inventory.\n\nDo you want to continue?');
    //     if (!confirmPastDate) {
    //         return false;
    //     }
    // }
    
    // Warning for items expiring soon
    const daysUntilExpiry = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));
    if (daysUntilExpiry >= 0 && daysUntilExpiry <= 14) {
        const confirmExpiringSoon = confirm(`⚠️ Expiry Warning\n\nThis item expires in ${daysUntilExpiry} day(s). Please ensure it will be used before expiration.\n\nDo you want to continue?`);
        if (!confirmExpiringSoon) {
            return false;
        }
    }
    
    return true;
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

// Setup search input event listener
document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('keyup', function(e) {
            if (e.key === 'Enter') {
                searchItems();
            } else {
                // Debounced search
                clearTimeout(this.searchTimeout);
                this.searchTimeout = setTimeout(searchItems, 300);
            }
        });
    }
});

// Close modals when clicking outside
window.addEventListener('click', function(e) {
    const itemModal = document.getElementById('itemModal');
    const confirmModal = document.getElementById('confirmModal');
    
    if (e.target === itemModal) {
        closeModal();
    }
    
    if (e.target === confirmModal) {
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
