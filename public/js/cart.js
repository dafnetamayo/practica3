// Shopping cart functionality
let cart = JSON.parse(localStorage.getItem('cart')) || [];

// Update cart badge count
function updateCartBadge() {
  const cartBadges = document.querySelectorAll('.fa-shopping-cart + .badge');
  
  // Calculate total quantity in cart
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  
  // Update all cart badges on the page
  cartBadges.forEach(badge => {
    badge.textContent = totalItems;
    
    // Show/hide badge based on cart contents
    if (totalItems > 0) {
      badge.classList.remove('d-none');
    } else {
      badge.classList.add('d-none');
    }
  });
}

// Add item to cart
function addToCart(productId, quantity = 1) {
  // Find product details
  const product = products.find(p => p._id === productId);
  
  if (!product) {
    showAlert('Producto no encontrado', 'danger');
    return;
  }
  
  // Check if product is already in cart
  const existingItem = cart.find(item => item.productId === productId);
  
  if (existingItem) {
    // Update quantity if product is already in cart
    existingItem.quantity += quantity;
  } else {
    // Add new item to cart
    cart.push({
      productId,
      name: product.name,
      price: product.price,
      quantity,
      image: product.image || 'https://via.placeholder.com/200x200?text=Producto'
    });
  }
  
  // Save cart to localStorage
  saveCart();
  
  // Update UI
  updateCartBadge();
  
  // Show success message
  showAlert(`${product.name} añadido al carrito`, 'success');
}

// Remove item from cart
function removeFromCart(productId) {
  // Find item index
  const itemIndex = cart.findIndex(item => item.productId === productId);
  
  if (itemIndex === -1) return;
  
  // Remove item from cart
  cart.splice(itemIndex, 1);
  
  // Save cart to localStorage
  saveCart();
  
  // Update UI
  updateCartBadge();
  renderCartPage();
  
  // Show success message
  showAlert('Producto eliminado del carrito', 'success');
}

// Update item quantity in cart
function updateCartItemQuantity(productId, quantity) {
  // Find item
  const item = cart.find(item => item.productId === productId);
  
  if (!item) return;
  
  // Update quantity
  item.quantity = quantity;
  
  // Remove item if quantity is 0
  if (quantity <= 0) {
    removeFromCart(productId);
    return;
  }
  
  // Save cart to localStorage
  saveCart();
  
  // Update UI
  updateCartBadge();
  renderCartPage();
}

// Save cart to localStorage
function saveCart() {
  localStorage.setItem('cart', JSON.stringify(cart));
}

// Calculate cart total
function calculateCartTotal() {
  return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
}

// Render shopping cart page
function renderCartPage() {
  const cartContainer = document.getElementById('cart-items');
  const cartSummary = document.getElementById('cart-summary');
  
  if (!cartContainer || !cartSummary) return;
  
  // Clear existing content
  cartContainer.innerHTML = '';
  
  // Check if cart is empty
  if (cart.length === 0) {
    cartContainer.innerHTML = `
      <div class="col-12 text-center p-5">
        <h3>Tu carrito está vacío</h3>
        <p>Agrega productos desde nuestra tienda</p>
        <a href="index.html" class="btn btn-primary">Ir a la tienda</a>
      </div>
    `;
    
    // Hide summary
    cartSummary.classList.add('d-none');
    return;
  }
  
  // Show summary
  cartSummary.classList.remove('d-none');
  
  // Render cart items
  cart.forEach(item => {
    const cartItem = document.createElement('div');
    cartItem.className = 'row bordered align-items-center mb-3';
    cartItem.innerHTML = `
      <div class="col-md-3 col-sm-4 text-center py-2">
        <img src="${item.image}" alt="${item.name}" class="product-img img-fluid">
      </div>
      <div class="col-md-4 col-sm-8 py-2">
        <h5>${item.name}</h5>
        <p>Precio: $${item.price.toFixed(2)}</p>
      </div>
      <div class="col-md-3 col-6 py-2">
        <div class="input-group">
          <button class="btn btn-outline-secondary decrease-quantity" data-id="${item.productId}">-</button>
          <input type="number" class="form-control text-center item-quantity" value="${item.quantity}" min="1" data-id="${item.productId}">
          <button class="btn btn-outline-secondary increase-quantity" data-id="${item.productId}">+</button>
        </div>
      </div>
      <div class="col-md-2 col-6 text-end py-2">
        <p class="fw-bold">$${(item.price * item.quantity).toFixed(2)}</p>
        <button class="btn btn-danger btn-sm remove-item" data-id="${item.productId}">
          <i class="fa fa-trash"></i>
        </button>
      </div>
    `;
    
    cartContainer.appendChild(cartItem);
  });
  
  // Calculate and display cart total
  const total = calculateCartTotal();
  document.getElementById('cart-subtotal').textContent = `$${total.toFixed(2)}`;
  document.getElementById('cart-total').textContent = `$${total.toFixed(2)}`;
  
  // Add event listeners for quantity buttons
  document.querySelectorAll('.decrease-quantity').forEach(button => {
    button.addEventListener('click', function() {
      const productId = this.getAttribute('data-id');
      const item = cart.find(item => item.productId === productId);
      if (item) {
        updateCartItemQuantity(productId, item.quantity - 1);
      }
    });
  });
  
  document.querySelectorAll('.increase-quantity').forEach(button => {
    button.addEventListener('click', function() {
      const productId = this.getAttribute('data-id');
      const item = cart.find(item => item.productId === productId);
      if (item) {
        updateCartItemQuantity(productId, item.quantity + 1);
      }
    });
  });
  
  document.querySelectorAll('.item-quantity').forEach(input => {
    input.addEventListener('change', function() {
      const productId = this.getAttribute('data-id');
      const quantity = parseInt(this.value) || 1;
      updateCartItemQuantity(productId, quantity);
    });
  });
  
  document.querySelectorAll('.remove-item').forEach(button => {
    button.addEventListener('click', function() {
      const productId = this.getAttribute('data-id');
      removeFromCart(productId);
    });
  });
}

// Handle checkout process
async function handleCheckout() {
  // Check if user is logged in
  if (!isLoggedIn()) {
    showAlert('Debes iniciar sesión para realizar un pedido', 'warning');
    return;
  }
  
  // Check if cart is empty
  if (cart.length === 0) {
    showAlert('Tu carrito está vacío', 'warning');
    return;
  }
  
  try {
    const token = localStorage.getItem('token');
    
    // Prepare order items
    const products = cart.map(item => ({
      productId: item.productId,
      quantity: item.quantity
    }));
    
    // Create order
    const response = await fetch('/api/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ products })
    });
    
    if (!response.ok) {
      throw new Error('Error al procesar el pedido');
    }
    
    const data = await response.json();
    
    // Clear cart
    cart = [];
    saveCart();
    updateCartBadge();
    
    // Show success message
    showAlert('¡Pedido realizado con éxito!', 'success');
    
    // Redirect to orders page
    setTimeout(() => {
      window.location.href = 'orders.html';
    }, 2000);
  } catch (error) {
    console.error('Error:', error);
    showAlert('Error al procesar el pedido: ' + error.message, 'danger');
  }
}

// Initialize cart
document.addEventListener('DOMContentLoaded', () => {
  // Update cart badge
  updateCartBadge();
  
  // Render cart page if on shopping_cart.html
  if (window.location.pathname.includes('shopping_cart.html')) {
    renderCartPage();
    
    // Add event listener for checkout button
    const checkoutButton = document.getElementById('checkout-button');
    if (checkoutButton) {
      checkoutButton.addEventListener('click', handleCheckout);
    }
  }
});
