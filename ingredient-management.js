// Ingredient Management System
let ingredients = [];
let filteredIngredients = [];
let currentUser = {};
let editingId = null;
let deleteId = null;

// Standard units mapping for validation
const standardUnits = {
    'kg': 'Kilograms',
    'grams': 'Grams', 
    'liters': 'Liters',
    'ml': 'Milliliters',
    'units': 'Units/Pieces',
    'cups': 'Cups',
    'tsp': 'Teaspoons',
    'tbsp': 'Tablespoons'
};

// Initialize the system
document.addEventListener('DOMContentLoaded', function() {
    // Check authentication and role
    checkAuthAndRole();
    
    // Setup logout functionality
    setupLogout();
    
    // Update welcome message and role badge
    updateUserInfo();
    
    // Initialize ingredient data
    initializeIngredientData();
    
    // Setup form
    setupForm();
    
    // Load and display ingredients
    displayIngredients();
    
    // Update statistics
    updateStatistics();
    
    // Setup search and filter functionality
    setupSearchAndFilters();
    
    // Setup modal form submission
    setupModalForm();
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
    
    // Hide certain features for staff users
    if (userRole === 'staff') {
        // Staff can view and add ingredients but have limited delete access
        setupStaffPermissions();
    }
}

function setupStaffPermissions() {
    // Staff users can view and add but need supervisor approval for deletion
    // This will be handled in the delete functionality
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

function initializeIngredientData() {
    // Load from localStorage if available, otherwise use sample data
    const savedIngredients = localStorage.getItem('ingredients');
    if (savedIngredients) {
        ingredients = JSON.parse(savedIngredients);
    } else {
        // Sample ingredient data that matches the HTML structure
        ingredients = [
            {
                id: 'ING001',
                name: 'All Purpose Flour',
                category: 'flour',
                quantity: 15.0,
                unit: 'kg',
                minStock: 50.0,
                supplier: 'Golden Wheat Co.',
                supplierName: 'Golden Wheat Co.',
                expiryDate: '2025-12-31',
                storageLocation: 'dry_storage',
                dateAdded: '2025-06-01',
                lastUpdated: new Date().toISOString()
            },
            {
                id: 'ING002',
                name: 'Active Dry Yeast',
                category: 'leavening',
                quantity: 2.5,
                unit: 'kg',
                minStock: 1.0,
                supplier: 'Golden Wheat Co.',
                supplierName: 'Golden Wheat Co.',
                expiryDate: '2025-09-15',
                storageLocation: 'dry_storage',
                dateAdded: '2025-06-01',
                lastUpdated: new Date().toISOString()
            },
            {
                id: 'ING003',
                name: 'Vegetable Oil',
                category: 'oil',
                quantity: 8.0,
                unit: 'L',
                minStock: 5.0,
                supplier: 'Golden Wheat Co.',
                supplierName: 'Golden Wheat Co.',
                expiryDate: '2026-03-20',
                storageLocation: 'pantry',
                dateAdded: '2025-06-01',
                lastUpdated: new Date().toISOString()
            },
            {
                id: 'ING004',
                name: 'Granulated Sugar',
                category: 'sweetener',
                quantity: 25.0,
                unit: 'kg',
                minStock: 10.0,
                supplier: 'Sweet Supply Ltd.',
                supplierName: 'Sweet Supply Ltd.',
                expiryDate: '2026-01-30',
                storageLocation: 'dry_storage',
                dateAdded: '2025-06-01',
                lastUpdated: new Date().toISOString()
            },
            {
                id: 'ING005',
                name: 'Salt',
                category: 'seasoning',
                quantity: 5.0,
                unit: 'kg',
                minStock: 2.0,
                supplier: 'Sweet Supply Ltd.',
                supplierName: 'Sweet Supply Ltd.',
                expiryDate: '2027-06-15',
                storageLocation: 'dry_storage',
                dateAdded: '2025-06-01',
                lastUpdated: new Date().toISOString()
            },
            {
                id: 'ING006',
                name: 'Baking Powder',
                category: 'leavening',
                quantity: 3.0,
                unit: 'kg',
                minStock: 1.5,
                supplier: 'Sweet Supply Ltd.',
                supplierName: 'Sweet Supply Ltd.',
                expiryDate: '2025-11-20',
                storageLocation: 'dry_storage',
                dateAdded: '2025-06-01',
                lastUpdated: new Date().toISOString()
            },
            {
                id: 'ING007',
                name: 'Char Siew (BBQ Pork)',
                category: 'filling',
                quantity: 3.0,
                unit: 'kg',
                minStock: 8.0,
                supplier: 'Filling Co.',
                supplierName: 'Filling Co.',
                expiryDate: '2025-07-30',
                storageLocation: 'cold_storage',
                dateAdded: '2025-06-01',
                lastUpdated: new Date().toISOString()
            },
            {
                id: 'ING008',
                name: 'Red Bean Paste',
                category: 'filling',
                quantity: 5.0,
                unit: 'kg',
                minStock: 3.0,
                supplier: 'Filling Co.',
                supplierName: 'Filling Co.',
                expiryDate: '2025-08-15',
                storageLocation: 'cold_storage',
                dateAdded: '2025-06-01',
                lastUpdated: new Date().toISOString()
            },
            {
                id: 'ING009',
                name: 'Lotus Seed Paste',
                category: 'filling',
                quantity: 4.5,
                unit: 'kg',
                minStock: 2.0,
                supplier: 'Filling Co.',
                supplierName: 'Filling Co.',
                expiryDate: '2025-08-10',
                storageLocation: 'cold_storage',
                dateAdded: '2025-06-01',
                lastUpdated: new Date().toISOString()
            },
            {
                id: 'ING010',
                name: 'Custard Filling (Nai Wong)',
                category: 'filling',
                quantity: 6.0,
                unit: 'kg',
                minStock: 4.0,
                supplier: 'Filling Co.',
                supplierName: 'Filling Co.',
                expiryDate: '2025-07-28',
                storageLocation: 'cold_storage',
                dateAdded: '2025-06-01',
                lastUpdated: new Date().toISOString()
            },
            {
                id: 'ING011',
                name: 'Mixed Vegetable Filling',
                category: 'filling',
                quantity: 7.0,
                unit: 'kg',
                minStock: 3.5,
                supplier: 'Filling Co.',
                supplierName: 'Filling Co.',
                expiryDate: '2025-07-26',
                storageLocation: 'cold_storage',
                dateAdded: '2025-06-01',
                lastUpdated: new Date().toISOString()
            }
        ];
        localStorage.setItem('ingredients', JSON.stringify(ingredients));
    }
}

function setupForm() {
    const form = document.getElementById('ingredientForm');
    const supplierSelect = document.getElementById('supplier');
    const customSupplierGroup = document.getElementById('customSupplierGroup');
    const customSupplierInput = document.getElementById('customSupplier');
    
    form.addEventListener('submit', handleFormSubmit);
    
    // Show/hide custom supplier field
    supplierSelect.addEventListener('change', function() {
        if (this.value === 'other') {
            customSupplierGroup.style.display = 'flex';
            customSupplierInput.required = true;
        } else {
            customSupplierGroup.style.display = 'none';
            customSupplierInput.required = false;
        }
    });
    
    // Set minimum date for expiry to today
    const expiryDate = document.getElementById('expiryDate');
    const today = new Date().toISOString().split('T')[0];
    expiryDate.min = today;
}

function setupFilters() {
    // Populate supplier filter
    const supplierFilter = document.getElementById('supplierFilter');
    const uniqueSuppliers = [...new Set(ingredients.map(ing => ing.supplierName))];
    
    uniqueSuppliers.forEach(supplier => {
        const option = document.createElement('option');
        option.value = supplier;
        option.textContent = supplier;
        supplierFilter.appendChild(option);
    });
}

function handleFormSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const name = formData.get('ingredientName').trim();
    const category = formData.get('ingredientCategory');
    const quantity = parseFloat(formData.get('quantity'));
    const unit = formData.get('unit');
    const minStock = parseFloat(formData.get('minStock'));
    const maxStock = formData.get('maxStock') ? parseFloat(formData.get('maxStock')) : null;
    const supplier = formData.get('supplier');
    const customSupplier = formData.get('customSupplier');
    const expiryDate = formData.get('expiryDate');
    const batchNumber = formData.get('batchNumber') || '';
    const storageLocation = formData.get('storageLocation');
    const notes = formData.get('notes') || '';
    
    // Validation
    if (!name || !category || !unit || !supplier || !expiryDate || !storageLocation) {
        showNotification('Please fill in all required fields.', 'error');
        return;
    }
    
    if (quantity < 0 || minStock < 0 || (maxStock && maxStock < 0)) {
        showNotification('Quantities cannot be negative.', 'error');
        return;
    }
    
    if (maxStock && maxStock < minStock) {
        showNotification('Maximum stock cannot be less than minimum stock.', 'error');
        return;
    }
    
    // Check if expiry date is in the future
    const today = new Date();
    const expiry = new Date(expiryDate);
    if (expiry <= today) {
        if (!confirm('The expiry date is today or in the past. Are you sure you want to add this ingredient?')) {
            return;
        }
    }
    
    // Determine supplier name
    let supplierName;
    if (supplier === 'other') {
        if (!customSupplier || customSupplier.trim() === '') {
            showNotification('Please specify the custom supplier name.', 'error');
            return;
        }
        supplierName = customSupplier.trim();
    } else {
        const supplierNames = {
            'local_mills': 'Local Mills Ltd',
            'dairy_fresh': 'Dairy Fresh Co',
            'sweet_supply': 'Sweet Supply Co',
            'oil_works': 'Oil Works Inc',
            'spice_world': 'Spice World Ltd',
            'farm_fresh': 'Farm Fresh Produce',
            'global_foods': 'Global Foods Inc'
        };
        supplierName = supplierNames[supplier];
    }
    
    // Check for duplicate names (case insensitive)
    const duplicateCheck = ingredients.find(ing => 
        ing.name.toLowerCase() === name.toLowerCase() && 
        ing.id !== editingId
    );
    
    if (duplicateCheck) {
        showNotification('An ingredient with this name already exists.', 'error');
        return;
    }
    
    // Create or update ingredient
    const ingredient = {
        name: name,
        category: category,
        quantity: quantity,
        unit: unit,
        minStock: minStock,
        maxStock: maxStock,
        supplier: supplier === 'other' ? 'custom' : supplier,
        supplierName: supplierName,
        expiryDate: expiryDate,
        batchNumber: batchNumber,
        storageLocation: storageLocation,
        notes: notes,
        lastUpdated: new Date().toISOString(),
        updatedBy: currentUser.username
    };
    
    if (editingId) {
        // Update existing ingredient
        const index = ingredients.findIndex(ing => ing.id === editingId);
        if (index !== -1) {
            ingredient.id = editingId;
            ingredient.dateAdded = ingredients[index].dateAdded;
            ingredients[index] = ingredient;
            showNotification('Ingredient updated successfully!', 'success');
        }
    } else {
        // Add new ingredient
        ingredient.id = generateIngredientId();
        ingredient.dateAdded = new Date().toISOString().split('T')[0];
        ingredients.push(ingredient);
        showNotification('Ingredient added successfully!', 'success');
    }
    
    // Save to localStorage
    localStorage.setItem('ingredients', JSON.stringify(ingredients));
    
    // Reset form and update display
    resetForm();
    displayIngredients();
    updateStatistics();
    setupFilters();
    
    // Hide form section
    toggleFormSection();
}

function generateIngredientId() {
    const lastId = ingredients.length > 0 ? 
        Math.max(...ingredients.map(ing => parseInt(ing.id.slice(3)))) : 0;
    return 'ING' + String(lastId + 1).padStart(3, '0');
}

function toggleFormSection() {
    const formSection = document.getElementById('ingredientFormSection');
    const addBtn = document.getElementById('addIngredientBtn');
    const toggleBtn = document.getElementById('toggleFormBtn');
    const formTitle = document.getElementById('formTitle');
    
    if (formSection.classList.contains('show')) {
        formSection.classList.remove('show');
        addBtn.style.display = 'block';
        resetForm();
    } else {
        formSection.classList.add('show');
        addBtn.style.display = 'none';
        if (!editingId) {
            formTitle.textContent = '➕ Add New Ingredient';
            document.getElementById('submitBtn').textContent = 'Add Ingredient';
        }
    }
}

function resetForm() {
    document.getElementById('ingredientForm').reset();
    document.getElementById('editingId').value = '';
    document.getElementById('customSupplierGroup').style.display = 'none';
    document.getElementById('customSupplier').required = false;
    editingId = null;
    
    // Reset date minimum
    const expiryDate = document.getElementById('expiryDate');
    const today = new Date().toISOString().split('T')[0];
    expiryDate.min = today;
}

function editIngredient(id) {
    const ingredient = ingredients.find(ing => ing.id === id);
    if (!ingredient) return;
    
    editingId = id;
    
    // Fill form with ingredient data
    document.getElementById('ingredientName').value = ingredient.name;
    document.getElementById('ingredientCategory').value = ingredient.category;
    document.getElementById('quantity').value = ingredient.quantity;
    document.getElementById('unit').value = ingredient.unit;
    document.getElementById('minStock').value = ingredient.minStock;
    document.getElementById('maxStock').value = ingredient.maxStock || '';
    document.getElementById('expiryDate').value = ingredient.expiryDate;
    document.getElementById('batchNumber').value = ingredient.batchNumber || '';
    document.getElementById('storageLocation').value = ingredient.storageLocation;
    document.getElementById('notes').value = ingredient.notes || '';
    
    // Handle supplier
    if (ingredient.supplier === 'custom') {
        document.getElementById('supplier').value = 'other';
        document.getElementById('customSupplierGroup').style.display = 'flex';
        document.getElementById('customSupplier').value = ingredient.supplierName;
        document.getElementById('customSupplier').required = true;
    } else {
        document.getElementById('supplier').value = ingredient.supplier;
    }
    
    // Update form title and button
    document.getElementById('formTitle').textContent = '✏️ Edit Ingredient';
    document.getElementById('submitBtn').textContent = 'Update Ingredient';
    
    // Show form
    if (!document.getElementById('ingredientFormSection').classList.contains('show')) {
        toggleFormSection();
    }
    
    // Scroll to form
    document.getElementById('ingredientFormSection').scrollIntoView({ behavior: 'smooth' });
}

function deleteIngredient(id) {
    const ingredient = ingredients.find(ing => ing.id === id);
    if (!ingredient) return;
    
    // Check permissions for staff users
    if (currentUser.role === 'staff') {
        showNotification('Only supervisors can delete ingredients. Please contact your supervisor.', 'warning');
        return;
    }
    
    deleteId = id;
    
    // Show confirmation modal
    const deleteDetails = document.getElementById('deleteDetails');
    deleteDetails.innerHTML = `
        <strong>Ingredient:</strong> ${ingredient.name}<br>
        <strong>ID:</strong> ${ingredient.id}<br>
        <strong>Category:</strong> ${getCategoryName(ingredient.category)}<br>
        <strong>Current Quantity:</strong> ${ingredient.quantity} ${ingredient.unit}<br>
        <strong>Supplier:</strong> ${ingredient.supplierName}
    `;
    
    document.getElementById('deleteModal').style.display = 'block';
}

function confirmDelete() {
    if (deleteId) {
        const index = ingredients.findIndex(ing => ing.id === deleteId);
        if (index !== -1) {
            const deletedName = ingredients[index].name;
            ingredients.splice(index, 1);
            localStorage.setItem('ingredients', JSON.stringify(ingredients));
            
            displayIngredients();
            updateStatistics();
            setupFilters();
            
            showNotification(`${deletedName} has been deleted.`, 'success');
        }
    }
    closeDeleteModal();
}

function closeDeleteModal() {
    document.getElementById('deleteModal').style.display = 'none';
    deleteId = null;
}

function displayIngredients() {
    // Initialize filtered ingredients to show all ingredients initially
    filteredIngredients = [...ingredients];
    displayFilteredIngredients();
}

function displayFilteredIngredients() {
    const tableBody = document.getElementById('inventoryTableBody');
    
    if (!tableBody) {
        console.error('Table body not found');
        return;
    }
    
    // Clear existing content
    tableBody.innerHTML = '';
    
    if (filteredIngredients.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="10" style="text-align: center; color: #666; padding: 2rem;">No ingredients found</td></tr>';
        return;
    }
    
    // Sort by name
    filteredIngredients.sort((a, b) => a.name.localeCompare(b.name));
    
    // Populate table with filtered ingredients
    filteredIngredients.forEach(ingredient => {
        const row = document.createElement('tr');
        const status = getIngredientStatus(ingredient);
        
        row.setAttribute('data-category', ingredient.category);
        row.setAttribute('data-supplier', ingredient.supplierName);
        row.setAttribute('data-location', ingredient.storageLocation);
        row.setAttribute('data-status', status);
        
        row.innerHTML = `
            <td>${ingredient.id}</td>
            <td>${ingredient.name}</td>
            <td>${getCategoryDisplayName(ingredient.category)}</td>
            <td>${ingredient.supplierName}</td>
            <td>${ingredient.quantity}</td>
            <td>${ingredient.unit}</td>
            <td>${ingredient.minStock}</td>
            <td>${formatDate(ingredient.expiryDate)}</td>
            <td><span class="status-badge ${status}">${getStatusDisplayName(status)}</span></td>
            <td>
                <button onclick="editItem('${ingredient.id}')" class="action-btn edit" title="Edit Ingredient">✏️</button>
                <button onclick="deleteItem('${ingredient.id}')" class="action-btn delete" title="Delete Ingredient">🗑️</button>
            </td>
        `;
        
        tableBody.appendChild(row);
    });
    
    // Update statistics after filtering
    updateStatistics();
}

function getIngredientStatus(ingredient) {
    const today = new Date();
    const expiryDate = new Date(ingredient.expiryDate);
    const daysUntilExpiry = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));
    
    if (daysUntilExpiry < 0) {
        return 'expired';
    } else if (daysUntilExpiry <= 7) {
        return 'expiring';
    } else if (ingredient.quantity <= ingredient.minStock) {
        return 'low';
    } else {
        return 'good';
    }
}

function getCategoryName(category) {
    const categories = {
        'flour_grains': 'Flour & Grains',
        'dairy': 'Dairy Products',
        'sweeteners': 'Sweeteners',
        'fats_oils': 'Fats & Oils',
        'leavening': 'Leavening Agents',
        'flavorings': 'Flavorings & Extracts',
        'nuts_seeds': 'Nuts & Seeds',
        'fruits': 'Fruits',
        'spices': 'Spices & Herbs',
        'other': 'Other'
    };
    return categories[category] || category;
}

function getStatusName(status) {
    const statuses = {
        'good': 'Good',
        'low': 'Low Stock',
        'expiring': 'Expiring Soon',
        'expired': 'Expired'
    };
    return statuses[status] || status;
}

function getLocationName(location) {
    const locations = {
        'dry_storage': 'Dry Storage',
        'refrigerator': 'Refrigerator',
        'freezer': 'Freezer',
        'pantry': 'Pantry',
        'cold_room': 'Cold Room',
        'warehouse': 'Warehouse'
    };
    return locations[location] || location;
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString();
}

function filterIngredients() {
    displayIngredients();
}

function clearFilters() {
    document.getElementById('searchInput').value = '';
    document.getElementById('supplierFilter').value = '';
    document.getElementById('statusFilter').value = '';
    document.getElementById('unitFilter').value = '';
    displayIngredients();
}

function updateStatistics() {
    const totalIngredients = ingredients.length;
    const criticalStockIngredients = ingredients.filter(ing => {
        const status = getIngredientStatus(ing);
        return status === 'low' || status === 'critical';
    }).length;
    const activeSuppliers = new Set(ingredients.map(ing => ing.supplierName)).size;
    const coldStorageItems = ingredients.filter(ing => ing.storageLocation === 'cold_storage').length;
    
    // Update the statistics display
    const totalItemsElement = document.getElementById('totalItems');
    const lowStockItemsElement = document.getElementById('lowStockItems');
    const supplierCountElement = document.getElementById('supplierCount');
    const coldStorageItemsElement = document.getElementById('coldStorageItems');
    
    if (totalItemsElement) totalItemsElement.textContent = totalIngredients;
    if (lowStockItemsElement) lowStockItemsElement.textContent = criticalStockIngredients;
    if (supplierCountElement) supplierCountElement.textContent = activeSuppliers;
    if (coldStorageItemsElement) coldStorageItemsElement.textContent = coldStorageItems;
}

function exportData() {
    // Create CSV content
    const headers = ['ID', 'Name', 'Category', 'Quantity', 'Unit', 'Min Stock', 'Max Stock', 'Supplier', 'Expiry Date', 'Batch Number', 'Storage Location', 'Status', 'Notes', 'Date Added', 'Last Updated'];
    
    const csvContent = [
        headers.join(','),
        ...ingredients.map(ingredient => [
            ingredient.id,
            `"${ingredient.name}"`,
            getCategoryName(ingredient.category),
            ingredient.quantity,
            ingredient.unit,
            ingredient.minStock,
            ingredient.maxStock || '',
            `"${ingredient.supplierName}"`,
            ingredient.expiryDate,
            ingredient.batchNumber || '',
            getLocationName(ingredient.storageLocation),
            getStatusName(getIngredientStatus(ingredient)),
            `"${ingredient.notes || ''}"`,
            ingredient.dateAdded,
            formatDate(ingredient.lastUpdated)
        ].join(','))
    ].join('\n');
    
    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ingredients_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    showNotification('Ingredient data exported successfully!', 'success');
}

function setupModalForm() {
    const modalForm = document.getElementById('itemForm');
    if (modalForm) {
        modalForm.addEventListener('submit', function(e) {
            e.preventDefault();
            handleModalFormSubmit(e);
        });
    }
}

function handleModalFormSubmit(e) {
    const formData = new FormData(e.target);
    const supplierValue = formData.get('supplier');
    const itemData = {
        name: formData.get('itemName')?.trim(),
        category: formData.get('itemType'),
        storageLocation: formData.get('location'),
        quantity: parseFloat(formData.get('quantity')),
        unit: formData.get('unit'),
        minStock: parseFloat(formData.get('minStockLevel')),
        supplier: supplierValue,
        supplierName: supplierValue, // Use the same value for both fields
        expiryDate: formData.get('expiryDate')
    };
    
    // Validation
    if (!itemData.name || !itemData.category || !itemData.storageLocation || 
        !itemData.unit || !itemData.supplier || !itemData.expiryDate) {
        showNotification('Please fill in all required fields.', 'error');
        return;
    }
    
    if (itemData.quantity < 0 || itemData.minStock < 0) {
        showNotification('Quantities cannot be negative.', 'error');
        return;
    }
    
    // Check for duplicate names (case insensitive)
    const duplicateCheck = ingredients.find(ing => 
        ing.name.toLowerCase() === itemData.name.toLowerCase() && 
        ing.id !== editingId
    );
    
    if (duplicateCheck) {
        showNotification('An ingredient with this name already exists.', 'error');
        return;
    }
    
    if (editingId) {
        // Update existing ingredient
        const index = ingredients.findIndex(ing => ing.id === editingId);
        if (index !== -1) {
            const updatedIngredient = {
                ...ingredients[index],
                ...itemData,
                lastUpdated: new Date().toISOString()
            };
            ingredients[index] = updatedIngredient;
            showNotification('Ingredient updated successfully!', 'success');
        }
    } else {
        // Add new ingredient
        const newIngredient = {
            id: generateIngredientId(),
            ...itemData,
            dateAdded: new Date().toISOString().split('T')[0],
            lastUpdated: new Date().toISOString()
        };
        ingredients.push(newIngredient);
        showNotification('Ingredient added successfully!', 'success');
    }
    
    // Save to localStorage
    localStorage.setItem('ingredients', JSON.stringify(ingredients));
    
    // Refresh display
    displayIngredients();
    updateStatistics();
    closeModal();
}

function getSupplierName(supplierValue) {
    const supplierNames = {
        'Golden Wheat Co.': 'Golden Wheat Co.',
        'Sweet Supply Ltd.': 'Sweet Supply Ltd.',
        'Filling Co.': 'Filling Co.',
        'Other': 'Other Supplier'
    };
    return supplierNames[supplierValue] || supplierValue;
}

function generateIngredientId() {
    if (ingredients.length === 0) return 'ING001';
    
    const lastId = Math.max(...ingredients.map(ing => {
        const numPart = ing.id.replace('ING', '');
        return parseInt(numPart) || 0;
    }));
    
    return 'ING' + String(lastId + 1).padStart(3, '0');
}
function openAddItemModal() {
    if (currentUser.role !== 'supervisor' && currentUser.role !== 'admin') {
        showNotification('Only supervisors and admins can add ingredients.', 'error');
        return;
    }
    
    editingId = null;
    const modal = document.getElementById('itemModal');
    const modalTitle = document.getElementById('modalTitle');
    
    modalTitle.textContent = 'Add New Ingredient';
    resetItemForm();
    modal.style.display = 'flex';
}

function editItem(itemId) {
    if (currentUser.role !== 'supervisor' && currentUser.role !== 'admin') {
        showNotification('Only supervisors and admins can edit ingredients.', 'error');
        return;
    }
    
    const ingredient = ingredients.find(ing => ing.id === itemId);
    if (!ingredient) {
        showNotification('Ingredient not found.', 'error');
        return;
    }
    
    editingId = itemId;
    const modal = document.getElementById('itemModal');
    const modalTitle = document.getElementById('modalTitle');
    
    modalTitle.textContent = 'Edit Ingredient';
    populateItemForm(ingredient);
    modal.style.display = 'flex';
}

function deleteItem(itemId) {
    if (currentUser.role !== 'supervisor' && currentUser.role !== 'admin') {
        showNotification('Only supervisors and admins can delete ingredients.', 'error');
        return;
    }
    
    const ingredient = ingredients.find(ing => ing.id === itemId);
    if (!ingredient) {
        showNotification('Ingredient not found.', 'error');
        return;
    }
    
    const confirmModal = document.getElementById('confirmModal');
    const confirmMessage = document.getElementById('confirmMessage');
    const confirmBtn = document.getElementById('confirmBtn');
    
    confirmMessage.textContent = `Are you sure you want to delete "${ingredient.name}"? This action cannot be undone.`;
    confirmBtn.onclick = () => {
        performDelete(itemId);
        closeConfirmModal();
    };
    
    confirmModal.style.display = 'flex';
}

function performDelete(itemId) {
    const index = ingredients.findIndex(ing => ing.id === itemId);
    if (index !== -1) {
        const deletedIngredient = ingredients[index];
        ingredients.splice(index, 1);
        
        // Save to localStorage
        localStorage.setItem('ingredients', JSON.stringify(ingredients));
        
        showNotification(`Ingredient "${deletedIngredient.name}" deleted successfully.`, 'success');
        displayIngredients();
        updateStatistics();
    }
}

function closeModal() {
    const modal = document.getElementById('itemModal');
    modal.style.display = 'none';
    editingId = null;
    resetItemForm();
}

function closeConfirmModal() {
    const confirmModal = document.getElementById('confirmModal');
    confirmModal.style.display = 'none';
}

function resetItemForm() {
    const form = document.getElementById('itemForm');
    if (form) {
        form.reset();
        const today = new Date().toISOString().split('T')[0];
        const expiryDate = document.getElementById('expiryDate');
        if (expiryDate) {
            expiryDate.min = today;
        }
    }
}

function populateItemForm(ingredient) {
    // Populate form fields with ingredient data
    const fields = {
        'itemName': ingredient.name,
        'itemType': ingredient.category,
        'location': ingredient.storageLocation,
        'quantity': ingredient.quantity,
        'unit': ingredient.unit,
        'minStockLevel': ingredient.minStock,
        'supplier': ingredient.supplierName, // Use supplierName for the dropdown
        'expiryDate': ingredient.expiryDate
    };
    
    Object.keys(fields).forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (field) {
            field.value = fields[fieldId];
        }
    });
}
function searchItems() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    filteredIngredients = ingredients.filter(ingredient =>
        ingredient.name.toLowerCase().includes(searchTerm) ||
        ingredient.id.toLowerCase().includes(searchTerm) ||
        ingredient.supplierName.toLowerCase().includes(searchTerm) ||
        ingredient.category.toLowerCase().includes(searchTerm)
    );
    displayIngredients();
}

function filterItems() {
    const supplierFilter = document.getElementById('filterSupplier').value;
    const locationFilter = document.getElementById('filterLocation').value;
    const statusFilter = document.getElementById('filterStatus').value;
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    
    filteredIngredients = ingredients.filter(ingredient => {
        const matchesSupplier = !supplierFilter || ingredient.supplierName === supplierFilter;
        const matchesLocation = !locationFilter || ingredient.storageLocation === locationFilter;
        const matchesStatus = !statusFilter || getIngredientStatus(ingredient) === statusFilter;
        const matchesSearch = !searchTerm || 
            ingredient.name.toLowerCase().includes(searchTerm) ||
            ingredient.id.toLowerCase().includes(searchTerm) ||
            ingredient.supplierName.toLowerCase().includes(searchTerm) ||
            ingredient.category.toLowerCase().includes(searchTerm);
        
        return matchesSupplier && matchesLocation && matchesStatus && matchesSearch;
    });
    
    displayFilteredIngredients();
}

function setupSearchAndFilters() {
    // Initialize filtered ingredients
    filteredIngredients = [...ingredients];
    
    // Setup search input with debouncing
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('keyup', function(e) {
            if (e.key === 'Enter') {
                filterItems();
            } else {
                // Debounced search
                clearTimeout(this.searchTimeout);
                this.searchTimeout = setTimeout(filterItems, 300);
            }
        });
    }
    
    // Setup filter dropdowns
    const filterSupplier = document.getElementById('filterSupplier');
    const filterLocation = document.getElementById('filterLocation');
    const filterStatus = document.getElementById('filterStatus');
    
    if (filterSupplier) {
        filterSupplier.addEventListener('change', filterItems);
    }
    if (filterLocation) {
        filterLocation.addEventListener('change', filterItems);
    }
    if (filterStatus) {
        filterStatus.addEventListener('change', filterItems);
    }
}

function displayFilteredIngredients() {
    const tableBody = document.getElementById('inventoryTableBody');
    
    if (!tableBody) {
        console.error('Table body not found');
        return;
    }
    
    // Clear existing content
    tableBody.innerHTML = '';
    
    if (filteredIngredients.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="10" style="text-align: center; color: #666; padding: 2rem;">No ingredients found</td></tr>';
        return;
    }
    
    // Sort by name
    filteredIngredients.sort((a, b) => a.name.localeCompare(b.name));
    
    // Populate table with filtered ingredients
    filteredIngredients.forEach(ingredient => {
        const row = document.createElement('tr');
        const status = getIngredientStatus(ingredient);
        
        row.setAttribute('data-category', ingredient.category);
        row.setAttribute('data-supplier', ingredient.supplierName);
        row.setAttribute('data-location', ingredient.storageLocation);
        row.setAttribute('data-status', status);
        
        row.innerHTML = `
            <td>${ingredient.id}</td>
            <td>${ingredient.name}</td>
            <td>${getCategoryDisplayName(ingredient.category)}</td>
            <td>${ingredient.supplierName}</td>
            <td>${ingredient.quantity}</td>
            <td>${ingredient.unit}</td>
            <td>${ingredient.minStock}</td>
            <td>${formatDate(ingredient.expiryDate)}</td>
            <td><span class="status-badge ${status}">${getStatusDisplayName(status)}</span></td>
            <td>
                <button onclick="editItem('${ingredient.id}')" class="action-btn edit" title="Edit Ingredient">✏️</button>
                <button onclick="deleteItem('${ingredient.id}')" class="action-btn delete" title="Delete Ingredient">🗑️</button>
            </td>
        `;
        
        tableBody.appendChild(row);
    });
    
    // Update statistics after filtering
    updateStatistics();
}

function getIngredientStatus(ingredient) {
    const today = new Date();
    const expiryDate = new Date(ingredient.expiryDate);
    const daysUntilExpiry = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));
    
    if (daysUntilExpiry < 0) {
        return 'expired';
    } else if (daysUntilExpiry <= 7) {
        return 'expiring';
    } else if (ingredient.quantity <= ingredient.minStock) {
        return 'low';
    } else {
        return 'good';
    }
}

function getCategoryDisplayName(category) {
    const categories = {
        'flour_grains': 'Flour & Grains',
        'sweeteners': 'Sweeteners',
        'dairy': 'Dairy',
        'flavorings': 'Flavorings',
        'leavening': 'Leavening Agents',
        'oil': 'Oils & Fats',
        'seasoning': 'Seasonings',
        'filling': 'Fillings',
        'flour': 'Flour & Grains',
        'other': 'Other'
    };
    return categories[category] || category;
}

function getStatusDisplayName(status) {
    const statusNames = {
        'good': 'Good',
        'low': 'Low Stock',
        'expired': 'Expired',
        'expiring': 'Expiring Soon',
        'critical': 'Critical'
    };
    return statusNames[status] || status;
}

function formatDate(dateString) {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

function showNotification(message, type) {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 12px 20px;
        border-radius: 4px;
        color: white;
        font-weight: 500;
        z-index: 10000;
        animation: slideInRight 0.3s ease-out;
    `;
    
    if (type === 'success') {
        notification.style.backgroundColor = '#4CAF50';
    } else if (type === 'error') {
        notification.style.backgroundColor = '#f44336';
    } else if (type === 'warning') {
        notification.style.backgroundColor = '#ff9800';
    }
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease-in';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 4000);
}

// Close modal when clicking outside and setup additional event listeners
window.onclick = function(event) {
    const itemModal = document.getElementById('itemModal');
    const confirmModal = document.getElementById('confirmModal');
    
    if (event.target === itemModal) {
        closeModal();
    }
    
    if (event.target === confirmModal) {
        closeConfirmModal();
    }
}

// Additional search setup for real-time functionality
document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('keyup', function(e) {
            if (e.key === 'Enter') {
                filterItems();
            } else {
                // Debounced search
                clearTimeout(this.searchTimeout);
                this.searchTimeout = setTimeout(filterItems, 300);
            }
        });
    }
});
