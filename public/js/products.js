// Products management functionality
let products = [];

// Fetch all products from API
async function fetchProducts() {
  try {
    const response = await fetch('/api/products');
    if (!response.ok) {
      throw new Error('Error al cargar productos');
    }
    const data = await response.json();
    products = data.data;
    return products;
  } catch (error) {
    console.error('Error:', error);
    showAlert('Error al cargar productos: ' + error.message, 'danger');
    return [];
  }
}

// Render products in the product container
function renderProducts(productsToRender = products) {
  const productsContainer = document.querySelector('.container .row');
  
  if (!productsContainer) return;
  
  // Clear existing content
  productsContainer.innerHTML = '';
  
  // Check if there are products to display
  if (productsToRender.length === 0) {
    productsContainer.innerHTML = '<div class="col-12 text-center"><p>No hay productos disponibles.</p></div>';
    return;
  }
  
  // Add products to container
  productsToRender.forEach(product => {
    // Create product card
    const productCard = document.createElement('div');
    productCard.className = 'col-lg-3 col-md-4 col-sm-6 mb-4';
    
    // Image fallback if no image is provided
    const imageUrl = product.image || 'https://via.placeholder.com/300x200?text=Producto';
    
    productCard.innerHTML = `
      <div class="card">
        <img src="${imageUrl}" class="card-img-top" alt="${product.name}">
        <div class="card-body">
          <h5 class="card-title">${product.name}</h5>
          <p>${product.description}</p>
          <p class="card-text">$${product.price.toFixed(2)}</p>
          <button class="btn btn-primary add-to-cart" data-id="${product._id}">
            Añadir al carrito
          </button>
        </div>
      </div>
    `;
    
    productsContainer.appendChild(productCard);
  });
  
  // Add event listeners for "Add to Cart" buttons
  document.querySelectorAll('.add-to-cart').forEach(button => {
    button.addEventListener('click', function() {
      const productId = this.getAttribute('data-id');
      addToCart(productId);
    });
  });
}

// For admin users: render product management interface
function renderProductManagement() {
  // Check if user is admin
  const currentUser = JSON.parse(localStorage.getItem('user'));
  if (!currentUser || currentUser.role !== 'admin') return;
  
  // Check if we're on admin page
  const adminProductsContainer = document.getElementById('admin-products');
  if (!adminProductsContainer) return;
  
  // Clear existing content
  adminProductsContainer.innerHTML = `
    <div class="row mb-3">
      <div class="col-12">
        <h3>Gestión de Productos</h3>
        <button class="btn btn-success" data-bs-toggle="modal" data-bs-target="#addProductModal">
          <i class="fa fa-plus"></i> Añadir Producto
        </button>
      </div>
    </div>
    <div class="table-responsive">
      <table class="table table-striped">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Descripción</th>
            <th>Precio</th>
            <th>Stock</th>
            <th>Categoría</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody id="products-table-body">
          <!-- Products will be loaded here -->
        </tbody>
      </table>
    </div>
  `;
  
  // Add product modal
  const modalContainer = document.createElement('div');
  modalContainer.innerHTML = `
    <div class="modal fade" id="addProductModal" tabindex="-1" aria-labelledby="addProductModalLabel" aria-hidden="true">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="addProductModalLabel">Añadir Producto</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <form id="add-product-form">
              <div class="mb-3">
                <label for="productName" class="form-label">Nombre</label>
                <input type="text" class="form-control" id="productName" required>
              </div>
              <div class="mb-3">
                <label for="productDescription" class="form-label">Descripción</label>
                <textarea class="form-control" id="productDescription" rows="3" required></textarea>
              </div>
              <div class="mb-3">
                <label for="productPrice" class="form-label">Precio</label>
                <input type="number" class="form-control" id="productPrice" min="0" step="0.01" required>
              </div>
              <div class="mb-3">
                <label for="productStock" class="form-label">Stock</label>
                <input type="number" class="form-control" id="productStock" min="0" required>
              </div>
              <div class="mb-3">
                <label for="productCategory" class="form-label">Categoría</label>
                <input type="text" class="form-control" id="productCategory" required>
              </div>
              <button type="submit" class="btn btn-primary">Guardar Producto</button>
            </form>
          </div>
        </div>
      </div>
    </div>
    
    <div class="modal fade" id="editProductModal" tabindex="-1" aria-labelledby="editProductModalLabel" aria-hidden="true">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="editProductModalLabel">Editar Producto</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <form id="edit-product-form">
              <input type="hidden" id="editProductId">
              <div class="mb-3">
                <label for="editProductName" class="form-label">Nombre</label>
                <input type="text" class="form-control" id="editProductName" required>
              </div>
              <div class="mb-3">
                <label for="editProductDescription" class="form-label">Descripción</label>
                <textarea class="form-control" id="editProductDescription" rows="3" required></textarea>
              </div>
              <div class="mb-3">
                <label for="editProductPrice" class="form-label">Precio</label>
                <input type="number" class="form-control" id="editProductPrice" min="0" step="0.01" required>
              </div>
              <div class="mb-3">
                <label for="editProductStock" class="form-label">Stock</label>
                <input type="number" class="form-control" id="editProductStock" min="0" required>
              </div>
              <div class="mb-3">
                <label for="editProductCategory" class="form-label">Categoría</label>
                <input type="text" class="form-control" id="editProductCategory" required>
              </div>
              <button type="submit" class="btn btn-primary">Actualizar Producto</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  `;
  
  document.body.appendChild(modalContainer);
  
  // Load products into table
  loadProductsTable();
  
  // Add event listener for the add product form
  document.getElementById('add-product-form').addEventListener('submit', handleAddProduct);
  
  // Add event listener for the edit product form
  document.getElementById('edit-product-form').addEventListener('submit', handleEditProduct);
}

// Load products into admin table
async function loadProductsTable() {
  const tableBody = document.getElementById('products-table-body');
  if (!tableBody) return;
  
  // Clear existing rows
  tableBody.innerHTML = '';
  
  // Get latest products
  await fetchProducts();
  
  // Add product rows
  products.forEach(product => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${product.name}</td>
      <td>${product.description.substring(0, 50)}${product.description.length > 50 ? '...' : ''}</td>
      <td>$${product.price.toFixed(2)}</td>
      <td>${product.stock}</td>
      <td>${product.category}</td>
      <td>
        <button class="btn btn-sm btn-primary edit-product" data-id="${product._id}">
          <i class="fa fa-edit"></i>
        </button>
        <button class="btn btn-sm btn-danger delete-product" data-id="${product._id}">
          <i class="fa fa-trash"></i>
        </button>
      </td>
    `;
    
    tableBody.appendChild(row);
  });
  
  // Add event listeners for edit buttons
  document.querySelectorAll('.edit-product').forEach(button => {
    button.addEventListener('click', function() {
      const productId = this.getAttribute('data-id');
      openEditProductModal(productId);
    });
  });
  
  // Add event listeners for delete buttons
  document.querySelectorAll('.delete-product').forEach(button => {
    button.addEventListener('click', function() {
      const productId = this.getAttribute('data-id');
      deleteProduct(productId);
    });
  });
}

// Open edit product modal and populate with product data
function openEditProductModal(productId) {
  const product = products.find(p => p._id === productId);
  if (!product) return;
  
  // Set form values
  document.getElementById('editProductId').value = product._id;
  document.getElementById('editProductName').value = product.name;
  document.getElementById('editProductDescription').value = product.description;
  document.getElementById('editProductPrice').value = product.price;
  document.getElementById('editProductStock').value = product.stock;
  document.getElementById('editProductCategory').value = product.category;
  
  // Open modal
  const editModal = new bootstrap.Modal(document.getElementById('editProductModal'));
  editModal.show();
}

// Handle add product form submission
async function handleAddProduct(event) {
  event.preventDefault();
  
  // Get form values
  const name = document.getElementById('productName').value;
  const description = document.getElementById('productDescription').value;
  const price = parseFloat(document.getElementById('productPrice').value);
  const stock = parseInt(document.getElementById('productStock').value);
  const category = document.getElementById('productCategory').value;
  
  // Create product object
  const product = {
    name,
    description,
    price,
    stock,
    category
  };
  
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No estás autenticado');
    }
    
    const response = await fetch('/api/products', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(product)
    });
    
    if (!response.ok) {
      throw new Error('Error al crear producto');
    }
    
    // Get updated products
    await fetchProducts();
    
    // Reload products table
    loadProductsTable();
    
    // Reset form
    document.getElementById('add-product-form').reset();
    
    // Close modal
    const addModal = bootstrap.Modal.getInstance(document.getElementById('addProductModal'));
    addModal.hide();
    
    // Show success message
    showAlert('Producto creado correctamente', 'success');
  } catch (error) {
    console.error('Error:', error);
    showAlert('Error al crear producto: ' + error.message, 'danger');
  }
}

// Handle edit product form submission
async function handleEditProduct(event) {
  event.preventDefault();
  
  // Get form values
  const productId = document.getElementById('editProductId').value;
  const name = document.getElementById('editProductName').value;
  const description = document.getElementById('editProductDescription').value;
  const price = parseFloat(document.getElementById('editProductPrice').value);
  const stock = parseInt(document.getElementById('editProductStock').value);
  const category = document.getElementById('editProductCategory').value;
  
  // Create product object
  const product = {
    name,
    description,
    price,
    stock,
    category
  };
  
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No estás autenticado');
    }
    
    const response = await fetch(`/api/products/${productId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(product)
    });
    
    if (!response.ok) {
      throw new Error('Error al actualizar producto');
    }
    
    // Get updated products
    await fetchProducts();
    
    // Reload products table
    loadProductsTable();
    
    // Close modal
    const editModal = bootstrap.Modal.getInstance(document.getElementById('editProductModal'));
    editModal.hide();
    
    // Show success message
    showAlert('Producto actualizado correctamente', 'success');
  } catch (error) {
    console.error('Error:', error);
    showAlert('Error al actualizar producto: ' + error.message, 'danger');
  }
}

// Delete product
async function deleteProduct(productId) {
  // Confirm deletion
  if (!confirm('¿Estás seguro de que deseas eliminar este producto?')) {
    return;
  }
  
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No estás autenticado');
    }
    
    const response = await fetch(`/api/products/${productId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      throw new Error('Error al eliminar producto');
    }
    
    // Get updated products
    await fetchProducts();
    
    // Reload products table
    loadProductsTable();
    
    // Show success message
    showAlert('Producto eliminado correctamente', 'success');
  } catch (error) {
    console.error('Error:', error);
    showAlert('Error al eliminar producto: ' + error.message, 'danger');
  }
}

// Initialize products
document.addEventListener('DOMContentLoaded', async () => {
  // Fetch and render products
  await fetchProducts();
  renderProducts();
  
  // Render product management for admin users
  renderProductManagement();
});
