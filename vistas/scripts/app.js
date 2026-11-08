// scripts/app.js - JavaScript dinámico para E-commerce ITVentas

// Variables globales
let currentPage = 1;
let totalPages = 1;
let cart = [];
let isLoading = false;
const itemsPerPage = 9;
const API_BASE_URL = '../ajax/controller.php'; // Ajusta la ruta según tu estructura

// Configuración de iconos por categoría
const categoryIcons = {
    '1': '📱', // Smartphones
    '2': '💻', // Laptops  
    '3': '📟', // Tablets
    '4': '🎧', // Accesorios
    'default': '🛍️'
};

// Inicializar la aplicación
document.addEventListener('DOMContentLoaded', function() {
    console.log('ITVentas E-commerce iniciado - Modo Dinámico');
    loadCartFromStorage();
    initializeEventListeners();
    loadCategories();
    loadProducts();
    updateCartUI();
});

// Inicializar event listeners
function initializeEventListeners() {
    // Event listener para búsqueda en tiempo real
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('keyup', function(event) {
            if (event.key === 'Enter') {
                searchProducts();
            }
            // Búsqueda en tiempo real con delay
            clearTimeout(this.searchTimeout);
            this.searchTimeout = setTimeout(() => {
                if (this.value.length >= 3 || this.value.length === 0) {
                    searchProducts();
                }
            }, 500);
        });
    }

    // Event listeners para filtros
    const categoryFilter = document.getElementById('categoryFilter');
    const priceFilter = document.getElementById('priceFilter');
    const sortFilter = document.getElementById('sortFilter');

    if (categoryFilter) categoryFilter.addEventListener('change', loadProducts);
    if (priceFilter) priceFilter.addEventListener('change', loadProducts);
    if (sortFilter) sortFilter.addEventListener('change', loadProducts);

    // Event listener para cerrar mensajes
    document.addEventListener('click', function(event) {
        if (event.target.classList.contains('error-message') || 
            event.target.classList.contains('success-message')) {
            hideMessage(event.target);
        }
    });
}

// Cargar categorías dinámicamente desde el servidor
async function loadCategories() {
    try {
        const response = await fetch(`${API_BASE_URL}?action=getCategories`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.success && data.data) {
            const categoryFilter = document.getElementById('categoryFilter');
            if (categoryFilter) {
                // Limpiar opciones existentes excepto la primera
                while (categoryFilter.children.length > 1) {
                    categoryFilter.removeChild(categoryFilter.lastChild);
                }
                
                // Agregar nuevas categorías
                data.data.forEach(category => {
                    const option = document.createElement('option');
                    option.value = category.id;
                    option.textContent = category.nombre;
                    categoryFilter.appendChild(option);
                });
            }
            console.log('Categorías cargadas:', data.data.length);
        } else {
            showError(data.message || 'Error cargando categorías');
        }
    } catch (error) {
        console.error('Error cargando categorías:', error);
        showError('Error de conexión al cargar categorías');
    }
}

// Cargar productos dinámicamente
async function loadProducts(page = 1) {
    if (isLoading) return;
    
    try {
        isLoading = true;
        showLoading(true);

        // Obtener valores de filtros
        const categoryId = document.getElementById('categoryFilter')?.value || '';
        const priceRange = document.getElementById('priceFilter')?.value || '';
        const sort = document.getElementById('sortFilter')?.value || '';
        const search = document.getElementById('searchInput')?.value || '';

        // Construir URL con parámetros
        const params = new URLSearchParams({
            action: 'getProducts',
            page: page,
            limit: itemsPerPage,
            ...(categoryId && { category_id: categoryId }),
            ...(priceRange && { price_range: priceRange }),
            ...(sort && { sort: sort }),
            ...(search && { search: search })
        });

        const response = await fetch(`${API_BASE_URL}?${params}`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.success) {
            renderProducts(data.data);
            updatePagination(data.pagination);
            currentPage = data.pagination.current_page;
            totalPages = data.pagination.total_pages;
            
            console.log(`Productos cargados: ${data.data.length}/${data.pagination.total_products}`);
        } else {
            showError(data.message || 'Error cargando productos');
            renderProducts([]); // Mostrar grid vacío
        }
    } catch (error) {
        console.error('Error cargando productos:', error);
        showError('Error de conexión al cargar productos');
        renderProducts([]); // Mostrar grid vacío
    } finally {
        isLoading = false;
        showLoading(false);
    }
}

// Renderizar productos dinámicamente
function renderProducts(products) {
    const container = document.getElementById('productsContainer');
    if (!container) return;

    if (!products || products.length === 0) {
        container.innerHTML = `
            <div class="no-products">
                <h3>No se encontraron productos</h3>
                <p>Intenta ajustar los filtros o términos de búsqueda</p>
            </div>
        `;
        return;
    }

    container.innerHTML = products.map(product => `
        <div class="product-card" onclick="viewProduct(${product.id})">
            <div class="product-image ${getCategoryClass(product.categoria_id)}">
                ${getProductIcon(product.categoria_id, product.imagen)}
            </div>
            <div class="product-info">
                <div class="product-name">${escapeHtml(product.nombre)}</div>
                <div class="product-description">${escapeHtml(product.descripcion)}</div>
                <div class="product-price">$${formatPrice(product.precio)}</div>
                <div class="product-stock ${product.stock <= 5 ? 'low-stock' : ''}">
                    Stock: ${product.stock} unidades
                </div>
                <button class="add-to-cart ${product.stock <= 0 ? 'disabled' : ''}" 
                        onclick="addToCart(event, ${product.id}, '${escapeHtml(product.nombre)}', ${product.precio})"
                        ${product.stock <= 0 ? 'disabled' : ''}>
                    ${product.stock <= 0 ? 'Sin Stock' : 'Agregar al carrito'}
                </button>
            </div>
        </div>
    `).join('');
}

// Actualizar paginación
function updatePagination(pagination) {
    const paginationContainer = document.getElementById('pagination');
    if (!paginationContainer || !pagination) return;

    let paginationHTML = '';
    
    // Botón anterior
    if (pagination.current_page > 1) {
        paginationHTML += `<button class="page-btn" onclick="loadProducts(${pagination.current_page - 1})">‹ Anterior</button>`;
    }

    // Botones de páginas
    const startPage = Math.max(1, pagination.current_page - 2);
    const endPage = Math.min(pagination.total_pages, pagination.current_page + 2);

    if (startPage > 1) {
        paginationHTML += `<button class="page-btn" onclick="loadProducts(1)">1</button>`;
        if (startPage > 2) {
            paginationHTML += `<span class="page-dots">...</span>`;
        }
    }

    for (let i = startPage; i <= endPage; i++) {
        paginationHTML += `<button class="page-btn ${i === pagination.current_page ? 'active' : ''}" onclick="loadProducts(${i})">${i}</button>`;
    }

    if (endPage < pagination.total_pages) {
        if (endPage < pagination.total_pages - 1) {
            paginationHTML += `<span class="page-dots">...</span>`;
        }
        paginationHTML += `<button class="page-btn" onclick="loadProducts(${pagination.total_pages})">${pagination.total_pages}</button>`;
    }

    // Botón siguiente
    if (pagination.current_page < pagination.total_pages) {
        paginationHTML += `<button class="page-btn" onclick="loadProducts(${pagination.current_page + 1})">Siguiente ›</button>`;
    }

    paginationContainer.innerHTML = paginationHTML;
}

// Funciones de búsqueda
function searchProducts() {
    currentPage = 1; // Resetear a primera página
    loadProducts(currentPage);
}

// Limpiar filtros
function clearFilters() {
    document.getElementById('categoryFilter').value = '';
    document.getElementById('priceFilter').value = '';
    document.getElementById('sortFilter').value = '';
    document.getElementById('searchInput').value = '';
    currentPage = 1;
    loadProducts(currentPage);
}

// Ver producto individual
async function viewProduct(productId) {
    try {
        showLoading(true);
        const response = await fetch(`${API_BASE_URL}?action=getProduct&id=${productId}`);
        const data = await response.json();
        
        if (data.success) {
            // Aquí puedes implementar un modal o redirigir a página de producto
            showProductModal(data.data);
        } else {
            showError(data.message || 'Error al cargar el producto');
        }
    } catch (error) {
        console.error('Error al ver producto:', error);
        showError('Error de conexión al cargar el producto');
    } finally {
        showLoading(false);
    }
}

// Mostrar modal de producto (implementación básica)
function showProductModal(product) {
    const modal = document.createElement('div');
    modal.className = 'product-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2>${escapeHtml(product.nombre)}</h2>
                <button class="modal-close" onclick="closeModal()">&times;</button>
            </div>
            <div class="modal-body">
                <div class="product-image-large ${getCategoryClass(product.categoria_id)}">
                    ${getProductIcon(product.categoria_id, product.imagen)}
                </div>
                <div class="product-details">
                    <p class="product-description">${escapeHtml(product.descripcion)}</p>
                    <p class="product-price">$${formatPrice(product.precio)}</p>
                    <p class="product-stock">Stock disponible: ${product.stock} unidades</p>
                    <p class="product-category">Categoría: ${escapeHtml(product.categoria_nombre)}</p>
                    <button class="add-to-cart ${product.stock <= 0 ? 'disabled' : ''}" 
                            onclick="addToCart(event, ${product.id}, '${escapeHtml(product.nombre)}', ${product.precio}); closeModal()"
                            ${product.stock <= 0 ? 'disabled' : ''}>
                        ${product.stock <= 0 ? 'Sin Stock' : 'Agregar al carrito'}
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    setTimeout(() => modal.classList.add('show'), 10);
}

function closeModal() {
    const modal = document.querySelector('.product-modal');
    if (modal) {
        modal.classList.remove('show');
        setTimeout(() => modal.remove(), 300);
    }
}

// Funciones del carrito
function addToCart(event, productId, productName, productPrice) {
    event.stopPropagation();
    
    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            id: productId,
            name: productName,
            price: productPrice,
            quantity: 1
        });
    }
    
    saveCartToStorage();
    updateCartUI();
    showSuccess(`${productName} agregado al carrito`);
    
    console.log('Producto agregado al carrito:', { productId, productName, productPrice });
}

function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    saveCartToStorage();
    updateCartUI();
}

function updateCartQuantity(productId, quantity) {
    const item = cart.find(item => item.id === productId);
    if (item) {
        if (quantity <= 0) {
            removeFromCart(productId);
        } else {
            item.quantity = quantity;
            saveCartToStorage();
            updateCartUI();
        }
    }
}

function clearCart() {
    cart = [];
    saveCartToStorage();
    updateCartUI();
}

function updateCartUI() {
    const cartCount = document.getElementById('cartCount');
    if (cartCount) {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartCount.textContent = totalItems;
        cartCount.style.display = totalItems > 0 ? 'inline' : 'none';
    }
}

function viewCart() {
    if (cart.length === 0) {
        showError('El carrito está vacío');
        return;
    }
    
    const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    const cartModal = document.createElement('div');
    cartModal.className = 'product-modal';
    cartModal.innerHTML = `
        <div class="modal-content cart-modal">
            <div class="modal-header">
                <h2>🛒 Carrito de Compras</h2>
                <button class="modal-close" onclick="closeModal()">&times;</button>
            </div>
            <div class="modal-body">
                <div class="cart-items">
                    ${cart.map(item => `
                        <div class="cart-item">
                            <div class="item-info">
                                <h4>${escapeHtml(item.name)}</h4>
                                <p>$${formatPrice(item.price)} c/u</p>
                            </div>
                            <div class="item-controls">
                                <button onclick="updateCartQuantity(${item.id}, ${item.quantity - 1})">-</button>
                                <span class="quantity">${item.quantity}</span>
                                <button onclick="updateCartQuantity(${item.id}, ${item.quantity + 1})">+</button>
                                <button class="remove-btn" onclick="removeFromCart(${item.id})">🗑️</button>
                            </div>
                            <div class="item-total">$${formatPrice(item.price * item.quantity)}</div>
                        </div>
                    `).join('')}
                </div>
                <div class="cart-total">
                    <h3>Total: $${formatPrice(totalPrice)}</h3>
                    <div class="cart-actions">
                        <button class="btn" onclick="clearCart(); closeModal();">Vaciar Carrito</button>
                        <button class="btn btn-primary" onclick="checkout()">Proceder al Pago</button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(cartModal);
    setTimeout(() => cartModal.classList.add('show'), 10);
}

function checkout() {
    // Implementar lógica de checkout
    showSuccess('Funcionalidad de pago en desarrollo');
    closeModal();
}

// Funciones de utilidad
function saveCartToStorage() {
    try {
        localStorage.setItem('itventas_cart', JSON.stringify(cart));
    } catch (error) {
        console.error('Error guardando carrito:', error);
    }
}

function loadCartFromStorage() {
    try {
        const savedCart = localStorage.getItem('itventas_cart');
        if (savedCart) {
            cart = JSON.parse(savedCart);
        }
    } catch (error) {
        console.error('Error cargando carrito:', error);
        cart = [];
    }
}

function showLoading(show) {
    const loadingElement = document.getElementById('loadingMessage');
    if (loadingElement) {
        loadingElement.style.display = show ? 'block' : 'none';
    }
}

function showError(message) {
    showMessage(message, 'error');
}

function showSuccess(message) {
    showMessage(message, 'success');
}

function showMessage(message, type = 'info') {
    const messageElement = document.getElementById(type === 'error' ? 'errorMessage' : 'successMessage');
    if (messageElement) {
        messageElement.textContent = message;
        messageElement.style.display = 'block';
        
        // Auto-hide después de 5 segundos
        setTimeout(() => {
            hideMessage(messageElement);
        }, 5000);
    }
}

function hideMessage(element) {
    if (element) {
        element.style.opacity = '0';
        setTimeout(() => {
            element.style.display = 'none';
            element.style.opacity = '1';
        }, 300);
    }
}

function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, function(m) { return map[m]; });
}

function formatPrice(price) {
    return parseFloat(price).toLocaleString('es-AR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

function getCategoryClass(categoryId) {
    const classes = {
        '1': 'smartphone',
        '2': 'laptop',
        '3': 'tablet',
        '4': 'accessory'
    };
    return classes[categoryId] || 'default';
}

function getProductIcon(categoryId, imageUrl) {
    if (imageUrl && imageUrl !== '') {
        return `<img src="${imageUrl}" alt="Producto" style="max-width: 100%; height: auto;">`;
    }
    
    const icons = {
        '1': '📱',
        '2': '💻',  
        '3': '📟',
        '4': '🎧'
    };
    return icons[categoryId] || '🛍️';
}

// Manejo de errores globales
window.addEventListener('error', function(event) {
    console.error('Error global:', event.error);
    if (window.ITVentasConfig && window.ITVentasConfig.debug) {
        showError('Ha ocurrido un error inesperado. Revisa la consola para más detalles.');
    }
});

// Manejo de errores de red
window.addEventListener('unhandledrejection', function(event) {
    console.error('Promise rechazada:', event.reason);
    if (window.ITVentasConfig && window.ITVentasConfig.debug) {
        showError('Error de conexión. Verifica tu conexión a internet.');
    }
});

console.log('ITVentas E-commerce - JavaScript dinámico cargado correctamente');