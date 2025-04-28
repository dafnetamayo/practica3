// Orders management functionality
let orders = [];

// Fetch user orders from API
async function fetchOrders() {
  try {
    // Check if user is logged in
    if (!isLoggedIn()) {
      showAlert('Debes iniciar sesión para ver tus pedidos', 'warning');
      window.location.href = 'index.html';
      return [];
    }
    
    const token = localStorage.getItem('token');
    const response = await fetch('/api/orders', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      throw new Error('Error al cargar pedidos');
    }
    
    const data = await response.json();
    orders = data.data;
    return orders;
  } catch (error) {
    console.error('Error:', error);
    showAlert('Error al cargar pedidos: ' + error.message, 'danger');
    return [];
  }
}

// Render orders page
async function renderOrdersPage() {
  const ordersContainer = document.getElementById('orders-container');
  if (!ordersContainer) return;
  
  // Fetch orders
  await fetchOrders();
  
  // Clear existing content
  ordersContainer.innerHTML = '';
  
  // Check if there are orders to display
  if (orders.length === 0) {
    ordersContainer.innerHTML = `
      <div class="col-12 text-center p-5">
        <h3>No tienes pedidos</h3>
        <p>Realiza tu primer pedido en nuestra tienda</p>
        <a href="index.html" class="btn btn-primary">Ir a la tienda</a>
      </div>
    `;
    return;
  }
  
  // Render each order
  orders.forEach(order => {
    const orderDate = new Date(order.date).toLocaleDateString();
    const orderCard = document.createElement('div');
    orderCard.className = 'card mb-4';
    
    orderCard.innerHTML = `
      <div class="card-header d-flex justify-content-between align-items-center">
        <div>
          <h5 class="mb-0">Pedido #${order._id.substring(order._id.length - 8)}</h5>
          <small class="text-muted">Fecha: ${orderDate}</small>
        </div>
        <span class="badge bg-success">Completado</span>
      </div>
      <div class="card-body">
        <h6>Productos:</h6>
        <ul class="list-group mb-3 order-items-${order._id}">
          <!-- Order items will be loaded here -->
        </ul>
        <div class="d-flex justify-content-between">
          <p><strong>Total:</strong></p>
          <p><strong>$${order.total.toFixed(2)}</strong></p>
        </div>
      </div>
    `;
    
    ordersContainer.appendChild(orderCard);
    
    // Render order items
    const orderItemsList = document.querySelector(`.order-items-${order._id}`);
    
    order.products.forEach(item => {
      const product = item.productId;
      const listItem = document.createElement('li');
      listItem.className = 'list-group-item d-flex justify-content-between align-items-center';
      
      listItem.innerHTML = `
        <div>
          <h6 class="my-0">${product.name}</h6>
          <small class="text-muted">Cantidad: ${item.quantity}</small>
        </div>
        <span>$${(item.price * item.quantity).toFixed(2)}</span>
      `;
      
      orderItemsList.appendChild(listItem);
    });
  });
}

// Initialize orders
document.addEventListener('DOMContentLoaded', () => {
  // Check if we're on the orders page
  if (window.location.pathname.includes('orders.html')) {
    renderOrdersPage();
  }
});
