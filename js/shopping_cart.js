/**
 * Shopping Cart JavaScript
 * Handles cart functionality: adding items, editing quantities, removing items, and payment processing
 */

// Cart data structure - will be stored in localStorage
let cart = {
    items: [],
    shipping: 30, // Default shipping cost
    total: 0
};

// Initialize cart when page loads
document.addEventListener('DOMContentLoaded', function() {
    // Load cart data from localStorage if available
    loadCart();
    
    // Check if we're on the shopping cart page
    if (window.location.pathname.includes('shopping_cart.html')) {
        renderCartPage();
        setupEventListeners();
    } else {
        // We're on the index or another page
        updateCartBadge();
        setupAddToCartButtons();
    }
});

// Load cart data from localStorage
function loadCart() {
    const savedCart = localStorage.getItem('shoppingCart');
    if (savedCart) {
        cart = JSON.parse(savedCart);
    }
}

// Save cart data to localStorage
function saveCart() {
    localStorage.setItem('shoppingCart', JSON.stringify(cart));
    updateCartBadge();
}

// Update the cart badge count in the navbar
function updateCartBadge() {
    const badges = document.querySelectorAll('.fa-shopping-cart + .badge');
    const itemCount = cart.items.reduce((total, item) => total + item.quantity, 0);
    
    badges.forEach(badge => {
        badge.textContent = itemCount;
        // Hide badge if cart is empty
        if (itemCount === 0) {
            badge.style.display = 'none';
        } else {
            badge.style.display = 'block';
        }
    });
}

// Add event listeners to "Add to Cart" buttons on the main page
function setupAddToCartButtons() {
    const addButtons = document.querySelectorAll('.btn-primary');
    
    addButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Get product info from the card
            const card = this.closest('.card');
            const name = card.querySelector('.card-title').textContent;
            const priceText = card.querySelector('.card-text').textContent;
            const price = parseFloat(priceText.replace('$', ''));
            const imgSrc = card.querySelector('.card-img-top').src;
            
            // Add item to cart
            addToCart(name, price, imgSrc);
            
            // Show confirmation
            alert(`${name} ha sido añadido al carrito!`);
        });
    });
}

// Add an item to the cart
function addToCart(name, price, imgSrc) {
    // Check if item already exists in cart
    const existingItemIndex = cart.items.findIndex(item => item.name === name);
    
    if (existingItemIndex !== -1) {
        // Increment quantity if item already exists
        cart.items[existingItemIndex].quantity += 1;
        cart.items[existingItemIndex].subtotal = cart.items[existingItemIndex].quantity * cart.items[existingItemIndex].price;
    } else {
        // Add new item
        cart.items.push({
            name: name,
            price: price,
            imgSrc: imgSrc,
            quantity: 1,
            subtotal: price
        });
    }
    
    // Update total
    calculateTotal();
    saveCart();
}

// Calculate cart total
function calculateTotal() {
    // Sum all item subtotals
    const itemsTotal = cart.items.reduce((sum, item) => sum + item.subtotal, 0);
    
    // Add shipping if there are items in the cart
    cart.total = itemsTotal + (cart.items.length > 0 ? cart.shipping : 0);
}

// Render cart contents on the shopping cart page
function renderCartPage() {
    const cartContainer = document.querySelector('.col-md-8');
    const summaryContainer = document.querySelector('.list-group');
    const totalElement = document.getElementById('total');
    
    // Clear existing content
    if (cartContainer) {
        cartContainer.innerHTML = '';
    }
    
    if (summaryContainer) {
        summaryContainer.innerHTML = '';
    }
    
    // If cart is empty
    if (cart.items.length === 0) {
        if (cartContainer) {
            cartContainer.innerHTML = '<div class="alert alert-info">Tu carrito está vacío</div>';
        }
        if (totalElement) {
            totalElement.textContent = '$0.00';
        }
        return;
    }
    
    // Render each item in cart
    cart.items.forEach((item, index) => {
        if (cartContainer) {
            const itemHTML = `
                <div class="bordered d-flex align-items-center mb-4" data-index="${index}">
                    <div class="media-body text-left">
                        <h5 class="mt-0">${item.name}</h5>
                        <p>Precio unitario: <span class="price" data-price="${item.price}">$${item.price.toFixed(2)}</span></p>
                        <p>Cantidad: <input type="number" class="form-control w-25 d-inline quantity-input" value="${item.quantity}" min="1"></p>
                        <p>Subtotal: <span class="subtotal">$${item.subtotal.toFixed(2)}</span></p>
                        <button class="btn btn-danger btn-sm remove-item"><i class="fa fa-trash"></i> Eliminar</button>
                    </div>
                    <img src="${item.imgSrc}" class="align-self-center product-img" alt="${item.name}">
                </div>
            `;
            cartContainer.innerHTML += itemHTML;
        }
        
        // Add to summary
        if (summaryContainer) {
            summaryContainer.innerHTML += `
                <li class="list-group-item">${item.name}: $${item.subtotal.toFixed(2)}</li>
            `;
        }
    });
    
    // Add shipping cost to summary
    if (summaryContainer) {
        summaryContainer.innerHTML += `
            <li class="list-group-item">Costo de envío: $${cart.shipping.toFixed(2)}</li>
        `;
    }
    
    // Update total
    if (totalElement) {
        totalElement.textContent = `$${cart.total.toFixed(2)}`;
    }
}

// Set up event listeners for the shopping cart page
function setupEventListeners() {
    const cartContainer = document.querySelector('.col-md-8');
    const payButton = document.querySelector('.btn-success');
    const cancelButton = document.querySelector('.btn-secondary');
    
    if (cartContainer) {
        // Quantity change event
        cartContainer.addEventListener('change', function(e) {
            if (e.target.classList.contains('quantity-input')) {
                const itemContainer = e.target.closest('.bordered');
                const index = parseInt(itemContainer.dataset.index);
                const newQuantity = parseInt(e.target.value);
                
                if (newQuantity < 1) {
                    e.target.value = 1;
                    return;
                }
                
                // Update quantity and subtotal
                cart.items[index].quantity = newQuantity;
                cart.items[index].subtotal = newQuantity * cart.items[index].price;
                
                // Update display
                itemContainer.querySelector('.subtotal').textContent = `$${cart.items[index].subtotal.toFixed(2)}`;
                
                // Update total and save
                calculateTotal();
                saveCart();
                renderCartPage();
            }
        });
        
        // Remove item event
        cartContainer.addEventListener('click', function(e) {
            if (e.target.classList.contains('remove-item') || e.target.closest('.remove-item')) {
                const itemContainer = e.target.closest('.bordered');
                const index = parseInt(itemContainer.dataset.index);
                
                // Remove item
                cart.items.splice(index, 1);
                
                // Update total and save
                calculateTotal();
                saveCart();
                renderCartPage();
            }
        });
    }
    
    // Payment button
    if (payButton) {
        payButton.addEventListener('click', function(e) {
            e.preventDefault();
            
            if (cart.items.length === 0) {
                alert('Tu carrito está vacío');
                return;
            }
            
            // Show payment modal
            showPaymentModal();
        });
    }
    
    // Cancel button
    if (cancelButton) {
        cancelButton.addEventListener('click', function(e) {
            e.preventDefault();
            
            if (confirm('¿Estás seguro de que deseas cancelar tu compra?')) {
                // Clear cart
                cart.items = [];
                calculateTotal();
                saveCart();
                renderCartPage();
            }
        });
    }
}

// Show payment modal
function showPaymentModal() {
    // Create modal if it doesn't exist
    if (!document.getElementById('paymentModal')) {
        const modalHTML = `
            <div class="modal fade" id="paymentModal" tabindex="-1" aria-labelledby="paymentModalLabel" aria-hidden="true">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title" id="paymentModalLabel">Procesar Pago</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body">
                            <form id="paymentForm">
                                <div class="mb-3">
                                    <label for="cardName" class="form-label">Nombre en la tarjeta</label>
                                    <input type="text" class="form-control" id="cardName" required>
                                </div>
                                <div class="mb-3">
                                    <label for="cardNumber" class="form-label">Número de tarjeta</label>
                                    <input type="text" class="form-control" id="cardNumber" placeholder="XXXX XXXX XXXX XXXX" required>
                                </div>
                                <div class="row">
                                    <div class="col-md-6 mb-3">
                                        <label for="expiryDate" class="form-label">Fecha de expiración</label>
                                        <input type="text" class="form-control" id="expiryDate" placeholder="MM/AA" required>
                                    </div>
                                    <div class="col-md-6 mb-3">
                                        <label for="cvv" class="form-label">CVV</label>
                                        <input type="text" class="form-control" id="cvv" placeholder="123" required>
                                    </div>
                                </div>
                                <div class="mb-3">
                                    <label for="billingAddress" class="form-label">Dirección de facturación</label>
                                    <textarea class="form-control" id="billingAddress" rows="3" required></textarea>
                                </div>
                                <p>Total a pagar: <strong>$${cart.total.toFixed(2)}</strong></p>
                                <div class="d-flex justify-content-end">
                                    <button type="button" class="btn btn-secondary me-2" data-bs-dismiss="modal">Cancelar</button>
                                    <button type="submit" class="btn btn-primary">Confirmar Pago</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        // Set up payment form submission
        document.getElementById('paymentForm').addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Process payment (simulate)
            processPayment();
        });
    }
    
    // Show the modal
    const paymentModal = new bootstrap.Modal(document.getElementById('paymentModal'));
    paymentModal.show();
}

// Process payment
function processPayment() {
    // Here you would normally integrate with a payment processor
    // For this demo, we'll just simulate a successful payment
    
    alert('¡Pago procesado con éxito! Tu pedido ha sido confirmado.');
    
    // Clear cart after successful payment
    cart.items = [];
    calculateTotal();
    saveCart();
    
    // Hide modal
    const paymentModal = bootstrap.Modal.getInstance(document.getElementById('paymentModal'));
    paymentModal.hide();
    
    // Redirect to orders page
    setTimeout(() => {
        window.location.href = 'orders.html';
    }, 1000);
}
