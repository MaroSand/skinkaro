<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ITVentas - Instrumentos musicales</title>
    <!-- Tipografías -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Fraunces:opsz,wght@9..144,600;9..144,700&display=swap" rel="stylesheet">
    <!-- Estilos (el ?v= evita que el navegador use una versión vieja en caché) -->
    <link rel="stylesheet" href="../public2/styles.css?v=<?php echo @filemtime('../public2/styles.css'); ?>">
    <!-- jQuery -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.6.0/jquery.min.js"></script>
</head>
<body>

    <!-- Encabezado -->
    <header class="site-header">
        <div class="header-inner">
            <a class="brand" href="indexTienda.php">
                <span class="brand-mark">♪</span>
                <span class="brand-text">
                    <strong>ITVentas</strong>
                    <small>Instrumentos musicales</small>
                </span>
            </a>

            <form id="searchForm" class="search" role="search" autocomplete="off">
                <svg class="search-icon" viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>
                <input type="search" id="searchInput" class="search-input" placeholder="Buscar guitarras, marcas, códigos..." aria-label="Buscar productos">
                <button type="submit" class="search-btn">Buscar</button>
            </form>

            <button type="button" id="btnCarrito" class="cart-button" aria-label="Abrir carrito">
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 4h2l2.4 10.2a2 2 0 0 0 2 1.5h7.7a2 2 0 0 0 1.9-1.4L21 8H6.2"/><circle cx="10" cy="20" r="1.4"/><circle cx="17" cy="20" r="1.4"/></svg>
                <span class="cart-label">Carrito</span>
                <span id="cartCount" class="cart-count">0</span>
            </button>
        </div>
    </header>

    <!-- Portada -->
    <section class="hero">
        <div class="hero-inner">
            <p class="hero-kicker">Tienda online</p>
            <h1>Encontrá tu próximo sonido</h1>
            <p class="hero-text">Guitarras, bajos, baterías, vientos y accesorios de las mejores marcas, con stock real y envío a todo el país.</p>
        </div>
    </section>

    <main class="container" id="catalogo">

        <!-- Filtros -->
        <section class="toolbar" aria-label="Filtros">
            <div class="filter-field">
                <label for="categoryFilter">Categoría</label>
                <select id="categoryFilter" class="filter-select">
                    <option value="">Todas las categorías</option>
                </select>
            </div>
            <div class="filter-field">
                <label for="marcaFilter">Marca</label>
                <select id="marcaFilter" class="filter-select">
                    <option value="">Todas las marcas</option>
                </select>
            </div>
            <div class="filter-field">
                <label for="priceFilter">Precio</label>
                <select id="priceFilter" class="filter-select">
                    <option value="">Cualquier precio</option>
                    <option value="0-10000">Hasta $10.000</option>
                    <option value="10000-50000">$10.000 a $50.000</option>
                    <option value="50000-500000">$50.000 a $500.000</option>
                    <option value="500000+">Más de $500.000</option>
                </select>
            </div>
            <div class="filter-field">
                <label for="sortFilter">Ordenar por</label>
                <select id="sortFilter" class="filter-select">
                    <option value="">Destacados</option>
                    <option value="name_asc">Nombre A-Z</option>
                    <option value="name_desc">Nombre Z-A</option>
                    <option value="price_asc">Precio: menor a mayor</option>
                    <option value="price_desc">Precio: mayor a menor</option>
                </select>
            </div>
            <button type="button" id="btnLimpiarFiltros" class="btn btn-ghost">Limpiar filtros</button>
        </section>

        <!-- Cantidad de resultados -->
        <div class="results-bar">
            <p id="resultsCount" class="results-count"></p>
        </div>

        <!-- Contenedor de productos - se llena dinámicamente -->
        <div id="productsContainer" class="products-grid"></div>

        <!-- Paginación -->
        <nav id="pagination" class="pagination" aria-label="Paginación"></nav>
    </main>

    <footer class="site-footer">
        <p><strong>ITVentas</strong> · Instrumentos musicales · Envíos a todo el país</p>
    </footer>

    <!-- Modal de detalle de producto -->
    <div id="productModal" class="modal" hidden>
        <div class="modal-dialog" role="dialog" aria-modal="true" aria-label="Detalle del producto">
            <button type="button" class="modal-close" id="btnCerrarModal" aria-label="Cerrar">&times;</button>
            <div id="productModalBody" class="modal-body"></div>
        </div>
    </div>

    <!-- Carrito lateral -->
    <div id="cartOverlay" class="drawer-overlay"></div>
    <aside id="cartDrawer" class="cart-drawer" aria-hidden="true" aria-labelledby="drawerTitle">
        <div class="drawer-header">
            <h2 id="drawerTitle">Tu carrito</h2>
            <button type="button" id="btnCerrarCarrito" class="drawer-close" aria-label="Cerrar carrito">&times;</button>
        </div>

        <!-- Vista: ítems del carrito -->
        <div id="cartView" class="drawer-body"></div>
        <div id="cartFooter" class="drawer-footer" hidden>
            <div class="summary-row"><span>Productos (<span id="cartItemsCount">0</span>)</span><span id="cartSubtotal">$0,00</span></div>
            <div class="summary-row muted"><span>Envío</span><span>A coordinar</span></div>
            <div class="summary-row total"><span>Total</span><span id="cartTotal">$0,00</span></div>
            <p class="summary-note">Precios finales con IVA incluido.</p>
            <button type="button" id="btnIrCheckout" class="btn btn-primary btn-block">Finalizar compra</button>
            <button type="button" id="btnVaciarCarrito" class="btn btn-link btn-block">Vaciar carrito</button>
        </div>

        <!-- Vista: datos del comprador -->
        <form id="checkoutForm" class="drawer-body checkout" hidden novalidate>
            <p class="checkout-intro">Completá tus datos y te contactamos para coordinar el pago y la entrega.</p>
            <div class="form-field">
                <label for="ckNombre">Nombre y apellido *</label>
                <input type="text" id="ckNombre" name="nombre" maxlength="100" required>
            </div>
            <div class="form-row">
                <div class="form-field form-field-sm">
                    <label for="ckTipoDoc">Documento</label>
                    <select id="ckTipoDoc" name="tipo_documento">
                        <option value="DNI">DNI</option>
                        <option value="CUIT">CUIT</option>
                        <option value="Pasaporte">Pasaporte</option>
                    </select>
                </div>
                <div class="form-field">
                    <label for="ckDocumento">Número *</label>
                    <input type="text" id="ckDocumento" name="num_documento" maxlength="20" inputmode="numeric" required>
                </div>
            </div>
            <div class="form-field">
                <label for="ckEmail">Email *</label>
                <input type="email" id="ckEmail" name="email" maxlength="50" required>
            </div>
            <div class="form-field">
                <label for="ckTelefono">Teléfono</label>
                <input type="tel" id="ckTelefono" name="telefono" maxlength="20">
            </div>
            <div class="form-field">
                <label for="ckDireccion">Dirección de entrega *</label>
                <input type="text" id="ckDireccion" name="direccion" maxlength="70" required>
            </div>

            <div class="checkout-summary">
                <div class="summary-row total"><span>Total a pagar</span><span id="checkoutTotal">$0,00</span></div>
            </div>

            <p id="checkoutError" class="form-error" role="alert" hidden></p>

            <button type="submit" id="btnConfirmar" class="btn btn-primary btn-block">Confirmar pedido</button>
            <button type="button" id="btnVolverCarrito" class="btn btn-link btn-block">← Volver al carrito</button>
        </form>

        <!-- Vista: pedido confirmado -->
        <div id="orderSuccess" class="drawer-body order-success" hidden></div>
    </aside>

    <!-- Notificaciones -->
    <div id="toastContainer" class="toast-container" aria-live="polite"></div>

    <!-- Scripts -->
    <script type="text/javascript" src="scripts/tienda.js?v=<?php echo @filemtime('scripts/tienda.js'); ?>"></script>
</body>
</html>