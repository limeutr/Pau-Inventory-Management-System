// Ingredient Management System
let ingredients = [];
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
    
    // Setup filter functionality
    setupFilters();
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
    if (currentUser.role === 'supervisor') {
        window.location.href = 'supervisor-dashboard.html';
    } else {
        window.location.href = 'staff-dashboard.html';
    }
}

function initializeIngredientData() {
    // Load from localStorage if available, otherwise use sample data
    const savedIngredients = localStorage.getItem('ingredients');
    if (savedIngredients) {
        ingredients = JSON.parse(savedIngredients);
    } else {
        // Sample ingredient data with proper business rules
        ingredients = [
            {
                id: 'ING001',
                name: 'All Purpose Flour',
                category: 'flour_grains',
                quantity: 500,
                unit: 'kg',
                minStock: 50,
                maxStock: 1000,
                supplier: 'local_mills',
                supplierName: 'Local Mills Ltd',
                expiryDate: '2025-08-15',
                batchNumber: 'FL20250215',
                storageLocation: 'dry_storage',
                notes: 'Premium quality flour for bread and pastries',
                dateAdded: '2025-06-01',
                lastUpdated: new Date().toISOString()
            },
            {
                id: 'ING002',
                name: 'Granulated Sugar',
                category: 'sweeteners',
                quantity: 200,
                unit: 'kg',
                minStock: 30,
                maxStock: 500,
                supplier: 'sweet_supply',
                supplierName: 'Sweet Supply Co',
                expiryDate: '2025-12-31',
                batchNumber: 'SG20250120',
                storageLocation: 'dry_storage',
                notes: 'Fine granulated sugar for baking',
                dateAdded: '2025-06-01',
                lastUpdated: new Date().toISOString()
            },
            {
                id: 'ING003',
                name: 'Fresh Milk',
                category: 'dairy',
                quantity: 25,
                unit: 'liters',
                minStock: 10,
                maxStock: 100,
                supplier: 'dairy_fresh',
                supplierName: 'Dairy Fresh Co',
                expiryDate: '2025-07-05',
                batchNumber: 'MK20250630',
                storageLocation: 'refrigerator',
                notes: 'Fresh whole milk, keep refrigerated',
                dateAdded: '2025-07-01',
                lastUpdated: new Date().toISOString()
            },
            {
                id: 'ING004',
                name: 'Butter (Unsalted)',
                category: 'dairy',
                quantity: 15,
                unit: 'kg',
                minStock: 5,
                maxStock: 50,
                supplier: 'dairy_fresh',
                supplierName: 'Dairy Fresh Co',
                expiryDate: '2025-07-20',
                batchNumber: 'BT20250610',
                storageLocation: 'refrigerator',
                notes: 'Premium unsalted butter for baking',
                dateAdded: '2025-06-15',
                lastUpdated: new Date().toISOString()
            },
            {
                id: 'ING005',
                name: 'Vanilla Extract',
                category: 'flavorings',
                quantity: 2,
                unit: 'liters',
                minStock: 0.5,
                maxStock: 10,
                supplier: 'spice_world',
                supplierName: 'Spice World Ltd',
                expiryDate: '2026-01-15',
                batchNumber: 'VE20241201',
                storageLocation: 'pantry',
                notes: 'Pure vanilla extract, handle with care',
                dateAdded: '2025-05-20',
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
    const tableBody = document.getElementById('ingredientsTableBody');
    let filteredIngredients = [...ingredients];
    
    // Apply filters
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const supplierFilter = document.getElementById('supplierFilter').value;
    const statusFilter = document.getElementById('statusFilter').value;
    const unitFilter = document.getElementById('unitFilter').value;
    
    // Search filter
    if (searchTerm) {
        filteredIngredients = filteredIngredients.filter(ingredient =>
            ingredient.name.toLowerCase().includes(searchTerm) ||
            ingredient.id.toLowerCase().includes(searchTerm) ||
            ingredient.supplierName.toLowerCase().includes(searchTerm) ||
            ingredient.batchNumber.toLowerCase().includes(searchTerm)
        );
    }
    
    // Supplier filter
    if (supplierFilter) {
        filteredIngredients = filteredIngredients.filter(ingredient =>
            ingredient.supplierName === supplierFilter
        );
    }
    
    // Unit filter
    if (unitFilter) {
        filteredIngredients = filteredIngredients.filter(ingredient =>
            ingredient.unit === unitFilter
        );
    }
    
    // Status filter
    if (statusFilter) {
        filteredIngredients = filteredIngredients.filter(ingredient => {
            const status = getIngredientStatus(ingredient);
            return status === statusFilter;
        });
    }
    
    // Sort by name
    filteredIngredients.sort((a, b) => a.name.localeCompare(b.name));
    
    // Populate table
    tableBody.innerHTML = '';
    
    if (filteredIngredients.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="10" style="text-align: center; color: #666; padding: 2rem;">No ingredients found</td></tr>';
        return;
    }
    
    filteredIngredients.forEach(ingredient => {
        const row = document.createElement('tr');
        const status = getIngredientStatus(ingredient);
        const statusClass = `status-${status}`;
        
        // Format expiry date with warning indicators
        const expiryDate = new Date(ingredient.expiryDate);
        const today = new Date();
        const daysUntilExpiry = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));
        
        let expiryDisplay = formatDate(ingredient.expiryDate);
        if (daysUntilExpiry < 0) {
            expiryDisplay += ' ⚠️';
        } else if (daysUntilExpiry <= 7) {
            expiryDisplay += ' ⏰';
        }
        
        // Format stock levels
        const stockDisplay = ingredient.maxStock ? 
            `${ingredient.minStock}-${ingredient.maxStock} ${ingredient.unit}` :
            `Min: ${ingredient.minStock} ${ingredient.unit}`;
        
        row.innerHTML = `
            <td><strong>${ingredient.id}</strong></td>
            <td>
                <strong>${ingredient.name}</strong>
                ${ingredient.batchNumber ? `<br><small>Batch: ${ingredient.batchNumber}</small>` : ''}
            </td>
            <td><span class="category-badge">${getCategoryName(ingredient.category)}</span></td>
            <td><strong>${ingredient.quantity} ${ingredient.unit}</strong></td>
            <td><small>${stockDisplay}</small></td>
            <td>${ingredient.supplierName}</td>
            <td>${expiryDisplay}</td>
            <td><span class="status-badge ${statusClass}">${getStatusName(status)}</span></td>
            <td>${getLocationName(ingredient.storageLocation)}</td>
            <td>
                <button onclick="editIngredient('${ingredient.id}')" class="action-btn-small edit-btn">Edit</button>
                <button onclick="deleteIngredient('${ingredient.id}')" class="action-btn-small delete-btn">Delete</button>
            </td>
        `;
        
        tableBody.appendChild(row);
    });
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
    const expiredIngredients = ingredients.filter(ing => getIngredientStatus(ing) === 'expired').length;
    const lowStockIngredients = ingredients.filter(ing => getIngredientStatus(ing) === 'low').length;
    const activeSuppliers = new Set(ingredients.map(ing => ing.supplierName)).size;
    
    document.getElementById('totalIngredients').textContent = totalIngredients;
    document.getElementById('expiredIngredients').textContent = expiredIngredients;
    document.getElementById('lowStockIngredients').textContent = lowStockIngredients;
    document.getElementById('activeSuppliers').textContent = activeSuppliers;
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

function showNotification(message, type) {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 4000);
}

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('deleteModal');
    if (event.target === modal) {
        closeDeleteModal();
    }
}
