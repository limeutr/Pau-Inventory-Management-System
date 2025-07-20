// Add Task functionality
document.addEventListener('DOMContentLoaded', function() {
    // Check authentication and role
    checkAuthAndRole();
    
    // Setup logout functionality
    setupLogout();
    
    // Update welcome message
    updateWelcomeMessage();
    
    // Initialize form functionality
    initializeForm();
    
    // Set minimum date to today
    setMinimumDate();
});

function checkAuthAndRole() {
    const isLoggedIn = sessionStorage.getItem('isLoggedIn');
    const userRole = sessionStorage.getItem('userRole');
    
    if (!isLoggedIn || isLoggedIn !== 'true') {
        window.location.href = 'index.html';
        return;
    }
    
    if (userRole !== 'supervisor' && userRole !== 'admin') {
        if (userRole === 'staff') {
            window.location.href = 'staff-dashboard.html';
        } else {
            window.location.href = 'index.html';
        }
        return;
    }
}

function setupLogout() {
    const logoutBtn = document.getElementById('logoutBtn');
    
    logoutBtn.addEventListener('click', function() {
        if (confirm('Are you sure you want to logout?')) {
            sessionStorage.removeItem('isLoggedIn');
            sessionStorage.removeItem('username');
            sessionStorage.removeItem('userRole');
            window.location.href = 'index.html';
        }
    });
}

function updateWelcomeMessage() {
    const username = sessionStorage.getItem('username') || 'Supervisor';
    const welcomeMessage = document.getElementById('welcomeMessage');
    
    const displayName = username.charAt(0).toUpperCase() + username.slice(1);
    welcomeMessage.textContent = `Welcome, ${displayName}!`;
}

function goBack() {
    window.location.href = 'supervisor-dashboard.html';
}

function setMinimumDate() {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('taskDueDate').setAttribute('min', today);
}

function initializeForm() {
    const form = document.getElementById('addTaskForm');
    const formInputs = form.querySelectorAll('input, select, textarea');
    
    // Add real-time preview updates
    formInputs.forEach(input => {
        input.addEventListener('input', updatePreview);
        input.addEventListener('change', updatePreview);
    });
    
    // Form submission
    form.addEventListener('submit', handleFormSubmit);
    
    // Initial preview update
    updatePreview();
}

function updatePreview() {
    const title = document.getElementById('taskTitle').value || 'Task Title will appear here';
    const priority = document.getElementById('taskPriority').value;
    const dueDate = document.getElementById('taskDueDate').value;
    const dueTime = document.getElementById('taskDueTime').value;
    const estimatedTime = document.getElementById('estimatedTime').value || '-';
    const targetQuantity = document.getElementById('targetQuantity').value;
    const quantityUnit = document.getElementById('quantityUnit').value;
    
    // Update preview elements
    document.getElementById('previewTitle').textContent = title;
    document.getElementById('previewTime').textContent = estimatedTime;
    
    // Format priority and due date
    let priorityText = priority ? priority.charAt(0).toUpperCase() + priority.slice(1) : '-';
    let dueDateText = '-';
    
    if (dueDate && dueTime) {
        const date = new Date(dueDate + 'T' + dueTime);
        dueDateText = date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    } else if (dueDate) {
        dueDateText = new Date(dueDate).toLocaleDateString();
    }
    
    document.getElementById('previewDetails').textContent = `Priority: ${priorityText} | Due: ${dueDateText}`;
    
    // Update progress text
    let progressText = '0/- completed';
    if (targetQuantity && quantityUnit) {
        progressText = `0/${targetQuantity} ${quantityUnit} completed`;
    } else if (targetQuantity) {
        progressText = `0/${targetQuantity} completed`;
    }
    document.getElementById('previewProgress').textContent = progressText;
    
    // Update priority styling
    const previewTask = document.getElementById('previewTask');
    previewTask.className = 'task-item';
    if (priority) {
        previewTask.classList.add(`priority-${priority}`);
    }
}

function handleFormSubmit(e) {
    e.preventDefault();
    
    // Get form data
    const formData = new FormData(e.target);
    const taskData = Object.fromEntries(formData.entries());
    
    // Add checkbox value manually
    taskData.sendNotification = document.getElementById('sendNotification').checked;
    
    // Validate required fields
    if (!validateForm(taskData)) {
        return;
    }
    
    // Create task
    createTask(taskData);
}

function validateForm(data) {
    let isValid = true;
    const requiredFields = ['taskTitle', 'taskPriority', 'taskDueDate', 'taskDueTime', 'estimatedTime'];
    
    // Clear previous errors
    document.querySelectorAll('.error').forEach(el => el.classList.remove('error'));
    
    requiredFields.forEach(field => {
        if (!data[field] || data[field].trim() === '') {
            document.getElementById(field).classList.add('error');
            isValid = false;
        }
    });
    
    if (!isValid) {
        showMessage('Please fill in all required fields.', 'error');
        return false;
    }
    
    // Validate due date is not in the past
    const dueDateTime = new Date(data.taskDueDate + 'T' + data.taskDueTime);
    const now = new Date();
    
    if (dueDateTime <= now) {
        document.getElementById('taskDueDate').classList.add('error');
        document.getElementById('taskDueTime').classList.add('error');
        showMessage('Due date and time must be in the future.', 'error');
        return false;
    }
    
    return true;
}

function createTask(taskData) {
    // Generate a unique task ID
    const taskId = 'task_' + Date.now();
    
    // Add timestamp and ID
    taskData.id = taskId;
    taskData.createdAt = new Date().toISOString();
    taskData.createdBy = sessionStorage.getItem('username') || 'Supervisor';
    taskData.status = 'pending';
    taskData.progress = 0;
    
    // Get existing tasks from localStorage or initialize empty array
    let tasks = JSON.parse(localStorage.getItem('productionTasks') || '[]');
    
    // Add new task
    tasks.push(taskData);
    
    // Save to localStorage
    localStorage.setItem('productionTasks', JSON.stringify(tasks));
    
    // Show success message
    showSuccessMessage();
    
    // Send notification if requested
    if (taskData.sendNotification) {
        sendTaskNotification(taskData);
    }
    
    // Reset form after 2 seconds
    setTimeout(() => {
        document.getElementById('addTaskForm').reset();
        updatePreview();
        setMinimumDate();
    }, 2000);
}

function showSuccessMessage() {
    const successHTML = `
        <div class="success-message show">
            <strong>Task Created Successfully!</strong><br>
            The task has been added and will appear on the staff dashboard.
        </div>
    `;
    
    const form = document.querySelector('.task-form');
    form.insertAdjacentHTML('afterbegin', successHTML);
    
    // Remove success message after 5 seconds
    setTimeout(() => {
        const successMsg = document.querySelector('.success-message');
        if (successMsg) {
            successMsg.remove();
        }
    }, 5000);
}

function showMessage(message, type) {
    // Create message element
    const messageEl = document.createElement('div');
    messageEl.className = `message ${type}`;
    messageEl.innerHTML = message;
    
    // Style based on type
    if (type === 'error') {
        messageEl.style.cssText = `
            background: #f8d7da;
            color: #721c24;
            padding: 15px 20px;
            border-radius: 8px;
            margin-bottom: 20px;
            border-left: 4px solid #dc3545;
        `;
    }
    
    // Insert at top of form
    const form = document.querySelector('.task-form');
    form.insertBefore(messageEl, form.firstChild);
    
    // Remove after 5 seconds
    setTimeout(() => {
        messageEl.remove();
    }, 5000);
}

function sendTaskNotification(taskData) {
    // In a real application, this would send a notification through an API
    // For now, we'll just log it
    console.log('Notification sent for task:', taskData.taskTitle);
    
    // You could implement:
    // - Email notifications
    // - Push notifications
    // - In-app notifications
    // - SMS notifications
}

// Utility function to format time input
document.getElementById('estimatedTime').addEventListener('blur', function() {
    let value = this.value.trim();
    if (value && !value.match(/\d+[hm]/)) {
        // Try to format common inputs
        if (value.match(/^\d+$/)) {
            // Just numbers, assume hours
            this.value = value + 'h';
        } else if (value.match(/^\d+:\d+$/)) {
            // HH:MM format, convert to Xh Ym
            const [hours, minutes] = value.split(':');
            let formatted = '';
            if (parseInt(hours) > 0) formatted += hours + 'h ';
            if (parseInt(minutes) > 0) formatted += minutes + 'm';
            this.value = formatted.trim();
        }
    }
    updatePreview();
});

// Auto-capitalize task title
document.getElementById('taskTitle').addEventListener('blur', function() {
    if (this.value) {
        this.value = this.value.charAt(0).toUpperCase() + this.value.slice(1);
        updatePreview();
    }
});

// Prevent form submission on Enter key in input fields (except textarea)
document.querySelectorAll('input, select').forEach(input => {
    input.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            // Move to next input
            const form = this.closest('form');
            const inputs = Array.from(form.querySelectorAll('input, select, textarea'));
            const currentIndex = inputs.indexOf(this);
            if (currentIndex < inputs.length - 1) {
                inputs[currentIndex + 1].focus();
            }
        }
    });
});

// Initialize tooltips for form fields
const tooltips = {
    taskTitle: 'Enter a clear, descriptive title for the task',
    taskPriority: 'Set priority level - High priority tasks appear first on staff dashboard',
    estimatedTime: 'Format: 2h 30m or 1h or 45m',
    assignedStaff: 'Leave empty to assign to all staff, or select specific staff member',
    targetQuantity: 'Number of items/units to be completed',
    sendNotification: 'Staff will receive immediate notification about this new task'
};

Object.keys(tooltips).forEach(fieldId => {
    const field = document.getElementById(fieldId);
    if (field) {
        field.setAttribute('title', tooltips[fieldId]);
    }
});

// Real-time validation feedback
document.querySelectorAll('input[required], select[required]').forEach(input => {
    input.addEventListener('blur', function() {
        if (!this.value.trim()) {
            this.classList.add('error');
        } else {
            this.classList.remove('error');
        }
    });
    
    input.addEventListener('input', function() {
        if (this.value.trim()) {
            this.classList.remove('error');
        }
    });
});

console.log('Add Task page loaded successfully');
