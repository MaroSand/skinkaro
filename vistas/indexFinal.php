<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="../public2/styles.css">
          
    
</head>
<body>
    <div class="container">
        <header>
            <div class="header-content">
                <div class="logo">🛒 ITVentas</div>
                <div class="search-bar">
                    <input type="text" id="searchInput" class="search-input" placeholder="Buscar productos...">
                    <button onclick="searchProducts()" class="btn">Buscar</button>
                </div>
            </div>
        </header>

        <div class="filters">
            <h3>Filtros</h3>
            <div class="filter-group">
                <select id="categoryFilter" class="filter-select">
                    <option value="">Todas las categorías</option>
                    <!-- Las categorías se cargarán dinámicamente -->
                </select>
                <select id="priceFilter" class="filter-select">
                    <option value="">Todos los precios</option>
                    <option value="0-100">$0 - $100</option>
                    <option value="100-500">$100 - $500</option>
                    <option value="500-1000">$500 - $1000</option>
                    <option value="1000+">$1000+</option>
                </select>
                <select id="sortFilter" class="filter-select">
                    <option value="">Ordenar por</option>
                    <option value="name_asc">Nombre A-Z</option>
                    <option value="name_desc">Nombre Z-A</option>
                    <option value="price_asc">Precio menor a mayor</option>
                    <option value="price_desc">Precio mayor a menor</option>
                </select>
                <button onclick="clearFilters()" class="btn">Limpiar filtros</button>
            </div>
        </div>

        <!-- Mensajes de estado -->
        <div id="loadingMessage" class="loading" style="display: none;">
            Cargando productos... ⏳
        </div>

        <div id="errorMessage" class="error-message" style="display: none;"></div>
        <div id="successMessage" class="success-message" style="display: none;"></div>

        <!-- Contenedor de productos (se llenará dinámicamente) -->
        <div id="productsContainer" class="products-grid">
            <!-- Los productos se cargarán aquí dinámicamente -->
        </div>

        <!-- Paginación (se actualizará dinámicamente) -->
        <div id="pagination" class="pagination">
            <!-- La paginación se generará dinámicamente -->
        </div>
    </div>

    <!-- Icono del carrito -->
    <div class="cart-icon" onclick="viewCart()">
        🛒 Carrito <span id="cartCount" class="cart-count" style="display: none;">0</span>
    </div>

    <!-- Scripts -->
    <script>
        // Configuración global
        window.ITVentasConfig = {
            apiUrl: '../ajax/controller.php', // Ajusta esta ruta según tu estructura
            debug: true // Cambiar a false en producción
        };

        // Funciones de utilidad globales
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

        function formatPrice(precio) {
            return parseFloat(price).toLocaleString('es-AR', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            });
        }

        function getCategoryClass(id) {
            const classes = {
                '1': 'smartphone',
                '2': 'laptop',
                '3': 'tablet',
                '4': 'accessory'
            };
            return classes[categoryId] || 'default';
        }

        function getProductIcon(id, imageUrl) {
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

        function showError(message) {
            console.error('Error:', message);
            showMessage(message, 'error');
        }

        function showSuccess(message) {
            console.log('Success:', message);
            showMessage(message, 'success');
        }

        // Log de inicialización
        console.log('ITVentas - Sistema de E-commerce cargado');
        console.log('Modo: Dinámico con AJAX');
        console.log('API URL:', window.ITVentasConfig.apiUrl);
    </script>
    <script src="scripts/app.js"></script>
</body>
</html>