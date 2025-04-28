// Authentication related functionality
let token = localStorage.getItem('token');
let currentUser = JSON.parse(localStorage.getItem('user'));

// Check if user is logged in
function isLoggedIn() {
  return !!token;
}

// Update UI based on login status
function updateAuthUI() {
  const accountDropdown = document.getElementById('accountDropdown');
  const dropdownMenu = document.querySelector('#accountDropdown + .dropdown-menu');
  
  if (accountDropdown && dropdownMenu) {
    if (isLoggedIn() && currentUser) {
      accountDropdown.innerHTML = `<i class="fa fa-user"></i> ${currentUser.name}`;
      
      // Clear existing dropdown items
      dropdownMenu.innerHTML = '';
      
      // Add logged-in menu items
      if (currentUser.role === 'admin') {
        dropdownMenu.innerHTML += `<li><a class="dropdown-item" href="admin-dashboard.html">Admin Dashboard</a></li>`;
      }
      
      dropdownMenu.innerHTML += `
        <li><a class="dropdown-item" href="orders.html">Mis pedidos</a></li>
        <li><a class="dropdown-item" href="#" id="logout">Cerrar sesión</a></li>
      `;
      
      // Add logout event listener
      document.getElementById('logout').addEventListener('click', handleLogout);
    } else {
      accountDropdown.innerHTML = `<i class="fa fa-user"></i> Mi Cuenta`;
      dropdownMenu.innerHTML = `
        <li><a class="dropdown-item" href="#" data-bs-toggle="modal" data-bs-target="#loginModal">Ingresar</a></li>
        <li><a class="dropdown-item" href="#" data-bs-toggle="modal" data-bs-target="#registerModal">Registro</a></li>
      `;
    }
  }
}

// Handle login form submission
function handleLogin(event) {
  event.preventDefault();
  
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  
  // Show loading indicator or disable button
  const loginButton = document.querySelector('#loginModal button[type="submit"]');
  loginButton.innerHTML = 'Cargando...';
  loginButton.disabled = true;
  
  fetch('/api/users/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ email, password })
  })
  .then(response => {
    if (!response.ok) {
      throw new Error('Credenciales inválidas');
    }
    return response.json();
  })
  .then(data => {
    // Save token to localStorage
    token = data.token;
    localStorage.setItem('token', token);
    
    // Get user info
    return fetch('/api/users/me', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
  })
  .then(response => response.json())
  .then(userData => {
    // Save user data
    currentUser = userData.data;
    localStorage.setItem('user', JSON.stringify(currentUser));
    
    // Hide modal
    const loginModal = bootstrap.Modal.getInstance(document.getElementById('loginModal'));
    loginModal.hide();
    
    // Update UI
    updateAuthUI();
    
    // Show success message
    showAlert('¡Inicio de sesión exitoso!', 'success');
  })
  .catch(error => {
    console.error('Error:', error);
    showAlert('Error de inicio de sesión: ' + error.message, 'danger');
  })
  .finally(() => {
    // Reset button
    loginButton.innerHTML = 'Entrar';
    loginButton.disabled = false;
  });
}

// Handle registration form submission
function handleRegister(event) {
  event.preventDefault();
  
  const name = document.getElementById('firstName').value + ' ' + document.getElementById('lastName').value;
  const email = document.getElementById('registerEmail').value;
  const password = document.getElementById('registerPassword').value;
  const confirmPassword = document.getElementById('confirmPassword').value;
  
  // Validate passwords match
  if (password !== confirmPassword) {
    showAlert('Las contraseñas no coinciden', 'danger');
    return;
  }
  
  // Show loading indicator or disable button
  const registerButton = document.querySelector('#registerModal button[type="submit"]');
  registerButton.innerHTML = 'Cargando...';
  registerButton.disabled = true;
  
  fetch('/api/users', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ name, email, password, role: 'client' })
  })
  .then(response => {
    if (!response.ok) {
      throw new Error('Error al registrar usuario');
    }
    return response.json();
  })
  .then(data => {
    // Save token to localStorage
    token = data.token;
    localStorage.setItem('token', token);
    
    // Get user info after registration
    return fetch('/api/users/me', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
  })
  .then(response => response.json())
  .then(userData => {
    // Save user data
    currentUser = userData.data;
    localStorage.setItem('user', JSON.stringify(currentUser));
    
    // Hide modal
    const registerModal = bootstrap.Modal.getInstance(document.getElementById('registerModal'));
    registerModal.hide();
    
    // Update UI
    updateAuthUI();
    
    // Show success message
    showAlert('¡Registro exitoso!', 'success');
  })
  .catch(error => {
    console.error('Error:', error);
    showAlert('Error de registro: ' + error.message, 'danger');
  })
  .finally(() => {
    // Reset button
    registerButton.innerHTML = 'Registrarse';
    registerButton.disabled = false;
  });
}

// Handle logout
function handleLogout(event) {
  event.preventDefault();
  
  // Clear localStorage
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  localStorage.removeItem('cart');
  
  // Reset variables
  token = null;
  currentUser = null;
  
  // Update UI
  updateAuthUI();
  
  // Show success message
  showAlert('Sesión cerrada correctamente', 'success');
  
  // Redirect to home page if not already there
  if (window.location.pathname !== '/index.html' && window.location.pathname !== '/') {
    window.location.href = 'index.html';
  }
}

// Show alert message
function showAlert(message, type = 'info') {
  const alertContainer = document.getElementById('alert-container');
  
  if (!alertContainer) {
    // Create alert container if it doesn't exist
    const container = document.createElement('div');
    container.id = 'alert-container';
    container.style.position = 'fixed';
    container.style.top = '20px';
    container.style.right = '20px';
    container.style.zIndex = '9999';
    document.body.appendChild(container);
  }
  
  const alert = document.createElement('div');
  alert.className = `alert alert-${type} alert-dismissible fade show`;
  alert.role = 'alert';
  alert.innerHTML = `
    ${message}
    <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
  `;
  
  document.getElementById('alert-container').appendChild(alert);
  
  // Auto-dismiss after 5 seconds
  setTimeout(() => {
    alert.classList.remove('show');
    setTimeout(() => alert.remove(), 150);
  }, 5000);
}

// Initialize authentication
document.addEventListener('DOMContentLoaded', () => {
  // Update UI based on authentication status
  updateAuthUI();
  
  // Add event listeners to forms
  const loginForm = document.querySelector('#loginModal form');
  if (loginForm) {
    loginForm.addEventListener('submit', handleLogin);
  }
  
  const registerForm = document.querySelector('#registerModal form');
  if (registerForm) {
    registerForm.addEventListener('submit', handleRegister);
  }
  
  // Create alert container
  if (!document.getElementById('alert-container')) {
    const container = document.createElement('div');
    container.id = 'alert-container';
    container.style.position = 'fixed';
    container.style.top = '20px';
    container.style.right = '20px';
    container.style.zIndex = '9999';
    document.body.appendChild(container);
  }
});
