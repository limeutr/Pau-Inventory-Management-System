// Login form handling
document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const errorMessage = document.getElementById('error-message');
    const loginBox = document.querySelector('.login-box');
    
    // User credentials with roles
    const USERS = {
        'admin': { password: 'admin', role: 'admin' },
        'supervisor': { password: 'supervisor', role: 'supervisor' },
        'staff1': { password: 'staff123', role: 'staff' },
        'staff2': { password: 'staff123', role: 'staff' },
        'john': { password: 'john123', role: 'staff' },
        'mary': { password: 'mary123', role: 'staff' }
    };
    
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value;
        
        // Hide error message
        errorMessage.style.display = 'none';
        
        // Validate credentials
        const user = USERS[username.toLowerCase()];
        
        if (user && user.password === password) {
            // Success animation
            loginBox.classList.add('success-animation');
            
            // Show success message
            showSuccessMessage();
            
            // Store user data
            sessionStorage.setItem('isLoggedIn', 'true');
            sessionStorage.setItem('username', username);
            sessionStorage.setItem('userRole', user.role);
            
            // Redirect based on role after delay
            setTimeout(() => {
                redirectBasedOnRole(user.role);
            }, 1500);
        } else {
            // Show error message
            errorMessage.style.display = 'block';
            
            // Clear password field
            document.getElementById('password').value = '';
            
            // Shake animation for error
            loginBox.style.animation = 'shake 0.5s ease-in-out';
            setTimeout(() => {
                loginBox.style.animation = '';
            }, 500);
        }
    });
    
    function showSuccessMessage() {
        const successDiv = document.createElement('div');
        successDiv.className = 'success-message';
        successDiv.innerHTML = '✓ Login successful! Redirecting...';
        successDiv.style.cssText = `
            background: #d4edda;
            color: #155724;
            padding: 10px;
            border-radius: 6px;
            margin-top: 15px;
            border: 1px solid #c3e6cb;
            font-size: 14px;
            text-align: center;
        `;
        
        // Replace error message with success message
        errorMessage.parentNode.insertBefore(successDiv, errorMessage.nextSibling);
    }
    
    function redirectBasedOnRole(role) {
        if (role === 'supervisor' || role === 'admin') {
            window.location.href = 'supervisor-dashboard.html';
        } else if (role === 'staff') {
            window.location.href = 'staff-dashboard.html';
        }
    }
});

// Add shake animation CSS
const style = document.createElement('style');
style.textContent = `
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
        20%, 40%, 60%, 80% { transform: translateX(5px); }
    }
`;
document.head.appendChild(style);
