// =====================================================
// ITVentas - Tienda online
// =====================================================

// Variables globales
var productos = [];          // Productos de la página actual
var relacionados = [];       // Productos relacionados del modal abierto
var productoActual = null;   // Producto abierto en el modal
var paginaActual = 1;
var totalPaginas = 1;
var peticionActual = 0;      // Evita que una respuesta vieja pise a una nueva
var temporizadorBusqueda = null;
var carrito = leerCarrito();

// Imagen por defecto (SVG embebido: no depende de ningún archivo, nunca falla)
var IMAGEN_DEFECTO = 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300">' +
    '<rect width="400" height="300" fill="#f4eee7"/>' +
    '<path fill="#d6c7b6" d="M232 92v92.5a26 26 0 1 1-12-21.9V112l-56 14v74.5a26 26 0 1 1-12-21.9V102z"/>' +
    '<text x="200" y="262" text-anchor="middle" font-family="Arial, sans-serif" font-size="16" fill="#b09f8d">Sin imagen</text>' +
    '</svg>'
);

var formatoMoneda = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 2 });

// =====================================================
// Inicio
// =====================================================
function init() {
    cargarCategorias();
    cargarMarcas();
    cargarProductos(1);
    actualizarCarritoUI();
    registrarEventos();
}

function registrarEventos() {
    // Búsqueda: al enviar el formulario o mientras se escribe (con una pequeña espera)
    $('#searchForm').on('submit', function (e) {
        e.preventDefault();
        clearTimeout(temporizadorBusqueda);
        cargarProductos(1);
    });
    $('#searchInput').on('input', function () {
        clearTimeout(temporizadorBusqueda);
        temporizadorBusqueda = setTimeout(function () { cargarProductos(1); }, 450);
    });

    // Filtros
    $('#categoryFilter, #marcaFilter, #priceFilter, #sortFilter').on('change', function () {
        cargarProductos(1);
    });
    $('#btnLimpiarFiltros').on('click', limpiarFiltros);

    // Acciones de tarjetas, modal y carrito (delegación de eventos)
    $(document).on('click', '[data-accion]', function (e) {
        e.preventDefault();
        var id = parseInt($(this).data('id'), 10);
        switch ($(this).data('accion')) {
            case 'ver':            verProducto(id); break;
            case 'agregar':        agregarDesdeListado(id); break;
            case 'agregar-modal':  agregarDesdeModal(); break;
            case 'modal-menos':    cambiarCantidadModal(-1); break;
            case 'modal-mas':      cambiarCantidadModal(1); break;
            case 'menos':          cambiarCantidad(id, -1); break;
            case 'mas':            cambiarCantidad(id, 1); break;
            case 'eliminar':       eliminarDelCarrito(id); break;
            case 'seguir':         cerrarCarrito(); break;
            case 'reintentar':     cargarProductos(paginaActual); break;
        }
    });

    // Paginación
    $(document).on('click', '[data-pagina]', function () {
        cargarProductos(parseInt($(this).data('pagina'), 10));
        $('html, body').animate({ scrollTop: $('#catalogo').offset().top - 90 }, 250);
    });

    // Cantidad escrita a mano en el carrito
    $(document).on('change', '.qty-input', function () {
        establecerCantidad(parseInt($(this).data('id'), 10), parseInt($(this).val(), 10));
    });

    // Modal
    $('#btnCerrarModal').on('click', cerrarModal);
    $('#productModal').on('click', function (e) {
        if (e.target === this) cerrarModal();
    });

    // Carrito
    $('#btnCarrito').on('click', abrirCarrito);
    $('#btnCerrarCarrito, #cartOverlay').on('click', cerrarCarrito);
    $('#btnIrCheckout').on('click', function () { mostrarVista('checkout'); });
    $('#btnVolverCarrito').on('click', function () { mostrarVista('carrito'); });
    $('#btnVaciarCarrito').on('click', vaciarCarrito);
    $('#checkoutForm').on('submit', function (e) {
        e.preventDefault();
        confirmarPedido();
    });

    // Tecla Esc cierra lo que esté abierto
    $(document).on('keydown', function (e) {
        if (e.key === 'Escape') {
            if (!$('#productModal').prop('hidden')) cerrarModal();
            else if ($('#cartDrawer').hasClass('open')) cerrarCarrito();
        }
    });

    // Si el carrito se modifica en otra pestaña, lo sincronizamos
    $(window).on('storage', function (e) {
        if (e.originalEvent.key === 'carrito') {
            carrito = leerCarrito();
            actualizarCarritoUI();
        }
    });
}

// =====================================================
// Utilidades
// =====================================================
function escapeHtml(texto) {
    return String(texto === null || texto === undefined ? '' : texto)
        .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function formatoPrecio(valor) {
    return formatoMoneda.format(parseFloat(valor) || 0);
}

function rutaImagen(imagen) {
    return imagen ? '../files/articulos/' + encodeURIComponent(imagen) : IMAGEN_DEFECTO;
}

// Si la imagen no existe en el servidor se reemplaza UNA sola vez por la imagen por defecto
function imagenError(img) {
    img.onerror = null;
    img.src = IMAGEN_DEFECTO;
    img.classList.add('is-placeholder');
}

function etiquetaImagen(imagen, alt, clase) {
    return '<img src="' + rutaImagen(imagen) + '" alt="' + escapeHtml(alt) + '" class="' + (clase || '') +
        (imagen ? '' : ' is-placeholder') + '" loading="lazy" onerror="imagenError(this)">';
}

function mostrarToast(mensaje, tipo) {
    var $toast = $('<div class="toast" role="status"></div>')
        .addClass(tipo === 'error' ? 'toast-error' : 'toast-ok')
        .text(mensaje);
    $('#toastContainer').append($toast);
    requestAnimationFrame(function () { $toast.addClass('show'); });
    setTimeout(function () {
        $toast.removeClass('show');
        setTimeout(function () { $toast.remove(); }, 300);
    }, 3200);
}

function bloquearScroll(bloquear) {
    $('body').toggleClass('no-scroll', bloquear);
}

// =====================================================
// Filtros
// =====================================================
function cargarCategorias() {
    $.ajax({
        url: '../ajax/tienda.php?op=listarCategorias',
        type: 'GET',
        dataType: 'json',
        success: function (data) {
            var opciones = '<option value="">Todas las categorías</option>';
            $.each(data, function (i, categoria) {
                opciones += '<option value="' + categoria.idcategoria + '">' + escapeHtml(categoria.nombre) + '</option>';
            });
            $('#categoryFilter').html(opciones);
        },
        error: function (xhr) {
            console.log('Error al cargar categorías:', xhr.responseText);
        }
    });
}

function cargarMarcas() {
    $.ajax({
        url: '../ajax/tienda.php?op=listarMarcas',
        type: 'GET',
        dataType: 'json',
        success: function (data) {
            var opciones = '<option value="">Todas las marcas</option>';
            $.each(data, function (i, marca) {
                opciones += '<option value="' + marca.idmarca + '">' + escapeHtml(marca.nombre) + '</option>';
            });
            $('#marcaFilter').html(opciones);
        },
        error: function (xhr) {
            console.log('Error al cargar marcas:', xhr.responseText);
        }
    });
}

function limpiarFiltros() {
    $('#categoryFilter, #marcaFilter, #priceFilter, #sortFilter').val('');
    $('#searchInput').val('');
    cargarProductos(1);
}

function hayFiltros() {
    return $('#categoryFilter').val() || $('#marcaFilter').val() || $('#priceFilter').val() || $.trim($('#searchInput').val());
}

// =====================================================
// Listado de productos
// =====================================================
function cargarProductos(pagina) {
    pagina = pagina || 1;
    var numeroPeticion = ++peticionActual;
    mostrarSkeleton();

    $.ajax({
        url: '../ajax/tienda.php?op=listarProductos',
        type: 'GET',
        dataType: 'json',
        data: {
            categoria: $('#categoryFilter').val(),
            marca: $('#marcaFilter').val(),
            buscar: $.trim($('#searchInput').val()),
            precio: $('#priceFilter').val(),
            ordenar: $('#sortFilter').val(),
            pagina: pagina
        },
        success: function (response) {
            if (numeroPeticion !== peticionActual) return; // llegó una respuesta más nueva
            productos = response.productos || [];
            paginaActual = parseInt(response.pagina_actual, 10) || 1;
            totalPaginas = parseInt(response.total_paginas, 10) || 0;

            // Si la página quedó vacía (por ejemplo, se agotó un producto), volvemos a la última
            if (productos.length === 0 && paginaActual > 1 && totalPaginas > 0) {
                cargarProductos(totalPaginas);
                return;
            }

            mostrarProductos();
            crearPaginacion();
            mostrarCantidadResultados(parseInt(response.total_productos, 10) || 0);
        },
        error: function (xhr) {
            if (numeroPeticion !== peticionActual) return;
            console.log('Error al cargar productos:', xhr.responseText);
            $('#productsContainer').html(estadoVacio('No pudimos cargar los productos', 'Revisá tu conexión e intentá nuevamente.', true));
            $('#pagination').empty();
            $('#resultsCount').text('');
        }
    });
}

function mostrarSkeleton() {
    var html = '';
    for (var i = 0; i < 8; i++) {
        html += '<div class="product-card skeleton" aria-hidden="true">' +
            '<div class="product-media"></div>' +
            '<div class="product-body"><span class="sk-line sk-short"></span><span class="sk-line"></span><span class="sk-line sk-mid"></span></div>' +
            '</div>';
    }
    $('#productsContainer').attr('aria-busy', 'true').html(html);
}

function mostrarCantidadResultados(total) {
    var texto = total === 1 ? '1 producto' : total + ' productos';
    var buscar = $.trim($('#searchInput').val());
    if (buscar) texto += ' para “' + buscar + '”';
    $('#resultsCount').text(total ? texto : '');
}

function estadoVacio(titulo, texto, reintentar) {
    return '<div class="empty-state">' +
        '<div class="empty-icon">♪</div>' +
        '<h3>' + escapeHtml(titulo) + '</h3>' +
        '<p>' + escapeHtml(texto) + '</p>' +
        (reintentar ? '<button type="button" class="btn btn-primary" data-accion="reintentar">Reintentar</button>' : '') +
        '</div>';
}

function mostrarProductos() {
    var container = $('#productsContainer');
    container.attr('aria-busy', 'false');

    if (productos.length === 0) {
        container.html(hayFiltros()
            ? estadoVacio('No encontramos productos', 'Probá con otra búsqueda o limpiá los filtros.')
            : estadoVacio('Todavía no hay productos', 'Muy pronto vas a encontrar novedades acá.'));
        return;
    }

    var html = '';
    $.each(productos, function (index, producto) {
        html += tarjetaProducto(producto, index);
    });
    container.html(html);
}

function tarjetaProducto(p, index) {
    var stock = parseInt(p.stock, 10) || 0;
    var sinDisponible = cantidadEnCarrito(p.idarticulo) >= stock;
    var avisoStock = '';
    if (stock <= 5) {
        avisoStock = '<span class="badge badge-low">' + (stock === 1 ? '¡Última unidad!' : '¡Últimas ' + stock + '!') + '</span>';
    }

    return '' +
        '<article class="product-card" style="animation-delay:' + (index * 40) + 'ms">' +
            '<a href="#" class="product-media" data-accion="ver" data-id="' + p.idarticulo + '" aria-label="Ver ' + escapeHtml(p.nombre) + '">' +
                etiquetaImagen(p.imagen, p.nombre) +
                (p.marca ? '<span class="badge badge-brand">' + escapeHtml(p.marca) + '</span>' : '') +
                avisoStock +
            '</a>' +
            '<div class="product-body">' +
                '<span class="product-category">' + escapeHtml(p.categoria) + '</span>' +
                '<h3 class="product-name"><a href="#" data-accion="ver" data-id="' + p.idarticulo + '">' + escapeHtml(p.nombre) + '</a></h3>' +
                (p.descripcion ? '<p class="product-description">' + escapeHtml(p.descripcion) + '</p>' : '') +
                '<div class="product-footer">' +
                    '<div class="product-pricing">' +
                        '<span class="product-price">' + formatoPrecio(p.precio_venta) + '</span>' +
                        '<span class="product-stock">' + stock + ' en stock</span>' +
                    '</div>' +
                    '<button type="button" class="btn-add" data-accion="agregar" data-id="' + p.idarticulo + '"' + (sinDisponible ? ' disabled' : '') + '>' +
                        (sinDisponible ? 'En tu carrito' : '+ Agregar') +
                    '</button>' +
                '</div>' +
            '</div>' +
        '</article>';
}

// Actualiza los botones "Agregar" sin volver a dibujar la grilla
function actualizarBotonesListado() {
    $.each(productos, function (i, p) {
        var sinDisponible = cantidadEnCarrito(p.idarticulo) >= p.stock;
        $('.btn-add[data-id="' + p.idarticulo + '"]')
            .prop('disabled', sinDisponible)
            .text(sinDisponible ? 'En tu carrito' : '+ Agregar');
    });
}

function crearPaginacion() {
    var contenedor = $('#pagination').empty();
    if (totalPaginas <= 1) return;

    var html = botonPagina(paginaActual - 1, '‹', paginaActual === 1, false, 'Página anterior');

    // Primera, última y las vecinas a la actual; el resto se resume con "…"
    var anterior = 0;
    for (var i = 1; i <= totalPaginas; i++) {
        if (i === 1 || i === totalPaginas || Math.abs(i - paginaActual) <= 1) {
            if (i - anterior > 1) html += '<span class="page-dots">…</span>';
            html += botonPagina(i, i, false, i === paginaActual, 'Página ' + i);
            anterior = i;
        }
    }

    html += botonPagina(paginaActual + 1, '›', paginaActual === totalPaginas, false, 'Página siguiente');
    contenedor.html(html);
}

function botonPagina(numero, texto, deshabilitado, activo, etiqueta) {
    return '<button type="button" class="page-btn' + (activo ? ' active' : '') + '" data-pagina="' + numero + '"' +
        (deshabilitado ? ' disabled' : '') + (activo ? ' aria-current="page"' : '') +
        ' aria-label="' + etiqueta + '">' + texto + '</button>';
}

// =====================================================
// Modal de detalle
// =====================================================
function verProducto(idarticulo) {
    abrirModal('<div class="modal-loading"><span class="spinner"></span>Cargando producto...</div>');

    $.ajax({
        url: '../ajax/tienda.php?op=mostrarProducto',
        type: 'GET',
        data: { idarticulo: idarticulo },
        dataType: 'json',
        success: function (producto) {
            if (producto.error) {
                cerrarModal();
                mostrarToast('El producto ya no está disponible', 'error');
                return;
            }
            productoActual = producto;
            mostrarDetalleProducto(producto);
            cargarRelacionados(idarticulo);
        },
        error: function () {
            cerrarModal();
            mostrarToast('Error al cargar el producto', 'error');
        }
    });
}

function mostrarDetalleProducto(p) {
    var stock = parseInt(p.stock, 10) || 0;
    var disponible = Math.max(0, stock - cantidadEnCarrito(p.idarticulo));

    var estadoStock;
    if (stock <= 0) estadoStock = '<span class="stock-pill out">Sin stock</span>';
    else if (stock <= 5) estadoStock = '<span class="stock-pill low">Quedan ' + stock + ' unidades</span>';
    else estadoStock = '<span class="stock-pill ok">En stock · ' + stock + ' unidades</span>';

    var html = '' +
        '<div class="detail">' +
            '<div class="detail-media">' + etiquetaImagen(p.imagen, p.nombre) + '</div>' +
            '<div class="detail-info">' +
                '<div class="detail-tags">' +
                    (p.marca ? '<span class="tag tag-brand">' + escapeHtml(p.marca) + '</span>' : '') +
                    '<span class="tag">' + escapeHtml(p.categoria) + '</span>' +
                '</div>' +
                '<h2 class="detail-title">' + escapeHtml(p.nombre) + '</h2>' +
                (p.codigo ? '<p class="detail-code">Código: ' + escapeHtml(p.codigo) + '</p>' : '') +
                '<p class="detail-price">' + formatoPrecio(p.precio_venta) + '</p>' +
                estadoStock +
                (p.descripcion ? '<p class="detail-description">' + escapeHtml(p.descripcion) + '</p>' : '') +
                '<div class="detail-actions">' +
                    (disponible > 0
                        ? '<div class="qty qty-lg">' +
                              '<button type="button" data-accion="modal-menos" aria-label="Restar">−</button>' +
                              '<span id="modalCantidad" data-max="' + disponible + '">1</span>' +
                              '<button type="button" data-accion="modal-mas" aria-label="Sumar"' + (disponible <= 1 ? ' disabled' : '') + '>+</button>' +
                          '</div>' +
                          '<button type="button" class="btn btn-primary" data-accion="agregar-modal">Agregar al carrito</button>'
                        : '<p class="detail-note">Ya tenés en el carrito todo el stock disponible de este producto.</p>') +
                '</div>' +
            '</div>' +
        '</div>' +
        '<section id="relacionados" class="related" hidden>' +
            '<h3>También te puede interesar</h3>' +
            '<div class="related-grid"></div>' +
        '</section>';

    $('#productModalBody').html(html);
}

function cambiarCantidadModal(cambio) {
    var $cant = $('#modalCantidad');
    var maximo = parseInt($cant.data('max'), 10) || 1;
    var valor = Math.min(maximo, Math.max(1, (parseInt($cant.text(), 10) || 1) + cambio));
    $cant.text(valor);
    $('[data-accion="modal-menos"]').prop('disabled', valor <= 1);
    $('[data-accion="modal-mas"]').prop('disabled', valor >= maximo);
}

function cargarRelacionados(idarticulo) {
    $.ajax({
        url: '../ajax/tienda.php?op=productosRelacionados',
        type: 'GET',
        data: { idarticulo: idarticulo },
        dataType: 'json',
        success: function (data) {
            relacionados = data || [];
            if (!relacionados.length || !productoActual || productoActual.idarticulo !== idarticulo) return;

            var html = '';
            $.each(relacionados, function (i, r) {
                html += '<a href="#" class="related-card" data-accion="ver" data-id="' + r.idarticulo + '">' +
                    '<span class="related-media">' + etiquetaImagen(r.imagen, r.nombre) + '</span>' +
                    '<span class="related-name">' + escapeHtml(r.nombre) + '</span>' +
                    '<span class="related-price">' + formatoPrecio(r.precio_venta) + '</span>' +
                    '</a>';
            });
            $('#relacionados').prop('hidden', false).find('.related-grid').html(html);
        }
    });
}

function abrirModal(contenido) {
    $('#productModalBody').html(contenido);
    $('#productModal').prop('hidden', false);
    requestAnimationFrame(function () { $('#productModal').addClass('open'); });
    $('#productModal .modal-dialog').scrollTop(0);
    bloquearScroll(true);
}

function cerrarModal() {
    productoActual = null;
    $('#productModal').removeClass('open').prop('hidden', true);
    $('#productModalBody').empty();
    if (!$('#cartDrawer').hasClass('open')) bloquearScroll(false);
}

// =====================================================
// Carrito
// =====================================================
function leerCarrito() {
    try {
        var datos = JSON.parse(localStorage.getItem('carrito'));
        if (!Array.isArray(datos)) return [];
        return datos.map(normalizarItem).filter(function (item) {
            return item.idarticulo > 0 && item.cantidad > 0;
        });
    } catch (e) {
        return [];
    }
}

// Asegura que cada ítem tenga los tipos correctos (también convierte carritos guardados con la versión anterior)
function normalizarItem(item) {
    return {
        idarticulo: parseInt(item.idarticulo, 10) || 0,
        nombre: String(item.nombre || ''),
        marca: String(item.marca || ''),
        precio: parseFloat(item.precio) || 0,
        cantidad: parseInt(item.cantidad, 10) || 0,
        stock: parseInt(item.stock, 10) || 0, // 0 = desconocido (carritos viejos): lo valida el servidor
        imagen: item.imagen || ''
    };
}

function guardarCarrito() {
    try {
        localStorage.setItem('carrito', JSON.stringify(carrito));
    } catch (e) {
        console.log('No se pudo guardar el carrito', e);
    }
}

function buscarItem(idarticulo) {
    return carrito.find(function (item) { return item.idarticulo === idarticulo; });
}

function cantidadEnCarrito(idarticulo) {
    var item = buscarItem(parseInt(idarticulo, 10));
    return item ? item.cantidad : 0;
}

function buscarProductoLocal(idarticulo) {
    var lista = productos.concat(relacionados);
    if (productoActual) lista.push(productoActual);
    return lista.find(function (p) { return p.idarticulo === idarticulo; });
}

function agregarDesdeListado(idarticulo) {
    var producto = buscarProductoLocal(idarticulo);
    if (producto) agregarAlCarrito(producto, 1);
}

function agregarDesdeModal() {
    if (!productoActual) return;
    var cantidad = parseInt($('#modalCantidad').text(), 10) || 1;
    if (agregarAlCarrito(productoActual, cantidad)) {
        cerrarModal();
    }
}

function agregarAlCarrito(producto, cantidad) {
    cantidad = cantidad || 1;
    var id = parseInt(producto.idarticulo, 10);
    var stock = parseInt(producto.stock, 10) || 0;
    var item = buscarItem(id);
    var enCarrito = item ? item.cantidad : 0;
    var disponible = stock - enCarrito;

    if (disponible <= 0) {
        mostrarToast('Ya agregaste todo el stock disponible de ' + producto.nombre, 'error');
        return false;
    }

    var agregar = Math.min(cantidad, disponible);

    if (item) {
        item.cantidad += agregar;
        item.stock = stock;
        item.precio = parseFloat(producto.precio_venta) || item.precio;
        item.imagen = producto.imagen || '';
        item.marca = producto.marca || '';
    } else {
        carrito.push({
            idarticulo: id,
            nombre: producto.nombre,
            marca: producto.marca || '',
            precio: parseFloat(producto.precio_venta) || 0,
            cantidad: agregar,
            stock: stock,
            imagen: producto.imagen || ''
        });
    }

    guardarCarrito();
    actualizarCarritoUI(true);
    mostrarToast(agregar < cantidad
        ? 'Se agregaron ' + agregar + ' unidades (máximo disponible)'
        : producto.nombre + ' se agregó al carrito');
    return true;
}

function cambiarCantidad(idarticulo, cambio) {
    var item = buscarItem(idarticulo);
    if (item) establecerCantidad(idarticulo, item.cantidad + cambio);
}

function establecerCantidad(idarticulo, cantidad) {
    var item = buscarItem(idarticulo);
    if (!item) return;

    if (isNaN(cantidad) || cantidad < 1) {
        eliminarDelCarrito(idarticulo);
        return;
    }
    if (item.stock > 0 && cantidad > item.stock) {
        cantidad = item.stock;
        mostrarToast('Solo hay ' + item.stock + ' unidades disponibles', 'error');
    }
    item.cantidad = cantidad;
    guardarCarrito();
    actualizarCarritoUI();
}

function eliminarDelCarrito(idarticulo) {
    var item = buscarItem(idarticulo);
    carrito = carrito.filter(function (i) { return i.idarticulo !== idarticulo; });
    guardarCarrito();
    actualizarCarritoUI();
    if (item) mostrarToast(item.nombre + ' se quitó del carrito');
}

function vaciarCarrito() {
    if (!carrito.length) return;
    if (!confirm('¿Querés vaciar el carrito?')) return;
    carrito = [];
    guardarCarrito();
    actualizarCarritoUI();
    mostrarToast('Carrito vaciado');
}

function totalCarrito() {
    return carrito.reduce(function (total, item) { return total + item.precio * item.cantidad; }, 0);
}

function unidadesCarrito() {
    return carrito.reduce(function (total, item) { return total + item.cantidad; }, 0);
}

// Refresca contador, contenido del carrito y botones del listado
function actualizarCarritoUI(animar) {
    var unidades = unidadesCarrito();
    var $contador = $('#cartCount').text(unidades).toggleClass('empty', unidades === 0);
    if (animar) {
        $contador.removeClass('bump');
        void $contador[0].offsetWidth; // reinicia la animación
        $contador.addClass('bump');
    }
    renderCarrito();
    actualizarBotonesListado();
}

function renderCarrito() {
    var $vista = $('#cartView');

    if (!carrito.length) {
        $vista.html(
            '<div class="cart-empty">' +
                '<div class="empty-icon">🛒</div>' +
                '<h3>Tu carrito está vacío</h3>' +
                '<p>Agregá productos para empezar tu compra.</p>' +
                '<button type="button" class="btn btn-primary" data-accion="seguir">Ver productos</button>' +
            '</div>'
        );
        $('#cartFooter').prop('hidden', true);
        if ($('#cartDrawer').hasClass('open') && !$('#checkoutForm').prop('hidden')) mostrarVista('carrito');
        return;
    }

    var html = '<ul class="cart-items">';
    $.each(carrito, function (i, item) {
        var enMaximo = item.stock > 0 && item.cantidad >= item.stock;
        html += '<li class="cart-item">' +
            '<span class="cart-thumb">' + etiquetaImagen(item.imagen, item.nombre) + '</span>' +
            '<div class="cart-item-info">' +
                '<h4>' + escapeHtml(item.nombre) + '</h4>' +
                '<span class="cart-item-unit">' + (item.marca ? escapeHtml(item.marca) + ' · ' : '') + formatoPrecio(item.precio) + ' c/u</span>' +
                '<div class="qty">' +
                    '<button type="button" data-accion="menos" data-id="' + item.idarticulo + '" aria-label="Restar">−</button>' +
                    '<input type="number" class="qty-input" data-id="' + item.idarticulo + '" value="' + item.cantidad + '" min="1"' +
                        (item.stock > 0 ? ' max="' + item.stock + '"' : '') + ' aria-label="Cantidad">' +
                    '<button type="button" data-accion="mas" data-id="' + item.idarticulo + '" aria-label="Sumar"' + (enMaximo ? ' disabled' : '') + '>+</button>' +
                '</div>' +
                (enMaximo ? '<small class="cart-item-warn">Máximo disponible</small>' : '') +
            '</div>' +
            '<div class="cart-item-side">' +
                '<strong>' + formatoPrecio(item.precio * item.cantidad) + '</strong>' +
                '<button type="button" class="link-danger" data-accion="eliminar" data-id="' + item.idarticulo + '">Quitar</button>' +
            '</div>' +
        '</li>';
    });
    html += '</ul>';
    $vista.html(html);

    var total = formatoPrecio(totalCarrito());
    $('#cartItemsCount').text(unidadesCarrito());
    $('#cartSubtotal, #cartTotal, #checkoutTotal').text(total);
    $('#cartFooter').prop('hidden', !$('#checkoutForm').prop('hidden') || !$('#orderSuccess').prop('hidden'));
}

function abrirCarrito() {
    mostrarVista('carrito');
    $('#cartOverlay').addClass('open');
    $('#cartDrawer').addClass('open').attr('aria-hidden', 'false');
    bloquearScroll(true);
}

function cerrarCarrito() {
    $('#cartOverlay').removeClass('open');
    $('#cartDrawer').removeClass('open').attr('aria-hidden', 'true');
    if ($('#productModal').prop('hidden')) bloquearScroll(false);
}

// Cambia entre las vistas del panel: 'carrito', 'checkout' o 'exito'
function mostrarVista(vista) {
    $('#cartView').prop('hidden', vista !== 'carrito');
    $('#cartFooter').prop('hidden', vista !== 'carrito' || !carrito.length);
    $('#checkoutForm').prop('hidden', vista !== 'checkout');
    $('#orderSuccess').prop('hidden', vista !== 'exito');
    $('#checkoutError').prop('hidden', true);

    var titulos = { carrito: 'Tu carrito', checkout: 'Datos de compra', exito: 'Pedido confirmado' };
    $('#drawerTitle').text(titulos[vista]);

    if (vista === 'checkout') {
        if (!carrito.length) { mostrarVista('carrito'); return; }
        $('#checkoutTotal').text(formatoPrecio(totalCarrito()));
        setTimeout(function () { $('#ckNombre').trigger('focus'); }, 250);
    }
    $('#cartDrawer .drawer-body').scrollTop(0);
}

// =====================================================
// Checkout
// =====================================================
function validarCheckout() {
    var errores = [];
    var $form = $('#checkoutForm');
    $form.find('.invalid').removeClass('invalid');

    function marcar(selector, mensaje) {
        $(selector).addClass('invalid');
        errores.push(mensaje);
    }

    if ($.trim($('#ckNombre').val()).length < 3) marcar('#ckNombre', 'Ingresá tu nombre y apellido');
    if (!/^[0-9A-Za-z\-\.]{6,20}$/.test($.trim($('#ckDocumento').val()))) marcar('#ckDocumento', 'Ingresá un número de documento válido');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test($.trim($('#ckEmail').val()))) marcar('#ckEmail', 'Ingresá un email válido');
    if ($.trim($('#ckDireccion').val()).length < 5) marcar('#ckDireccion', 'Ingresá una dirección de entrega');

    if (errores.length) {
        $('#checkoutError').text(errores.join('. ') + '.').prop('hidden', false);
        $form.find('.invalid').first().trigger('focus');
        return false;
    }
    return true;
}

function confirmarPedido() {
    if (!carrito.length) return;
    if (!validarCheckout()) return;

    var $boton = $('#btnConfirmar').prop('disabled', true).addClass('is-loading').text('Procesando...');
    var datos = $('#checkoutForm').serializeArray();
    datos.push({
        name: 'items',
        value: JSON.stringify(carrito.map(function (item) {
            return { idarticulo: item.idarticulo, cantidad: item.cantidad };
        }))
    });
    var nombreCliente = $.trim($('#ckNombre').val());
    var emailCliente = $.trim($('#ckEmail').val());

    $.ajax({
        url: '../ajax/tienda.php?op=confirmarPedido',
        type: 'POST',
        data: $.param(datos),
        dataType: 'json',
        success: function (r) {
            if (r.ok) {
                carrito = [];
                guardarCarrito();
                actualizarCarritoUI();
                $('#checkoutForm')[0].reset();
                mostrarPedidoConfirmado(r, nombreCliente, emailCliente);
                cargarProductos(paginaActual); // refresca el stock en pantalla
                return;
            }
            // Si cambió el stock de algún producto, ajustamos el carrito y volvemos a mostrarlo
            if (r.stock) {
                ajustarStockCarrito(r.stock);
                mostrarVista('carrito');
                mostrarToast(r.mensaje, 'error');
                cargarProductos(paginaActual);
            } else {
                $('#checkoutError').text(r.mensaje || 'No se pudo registrar el pedido.').prop('hidden', false);
            }
        },
        error: function (xhr) {
            console.log('Error al confirmar pedido:', xhr.responseText);
            $('#checkoutError').text('No se pudo procesar el pedido. Intentá nuevamente.').prop('hidden', false);
        },
        complete: function () {
            $boton.prop('disabled', false).removeClass('is-loading').text('Confirmar pedido');
        }
    });
}

// stock: { idarticulo: stockDisponible }
function ajustarStockCarrito(stock) {
    $.each(stock, function (id, disponible) {
        var item = buscarItem(parseInt(id, 10));
        if (!item) return;
        disponible = parseInt(disponible, 10) || 0;
        if (disponible <= 0) {
            carrito = carrito.filter(function (i) { return i.idarticulo !== item.idarticulo; });
        } else {
            item.stock = disponible;
            item.cantidad = Math.min(item.cantidad, disponible);
        }
    });
    guardarCarrito();
    actualizarCarritoUI();
}

function mostrarPedidoConfirmado(r, nombre, email) {
    var primerNombre = nombre.split(' ')[0];
    $('#orderSuccess').html(
        '<div class="success-icon">✓</div>' +
        '<h3>¡Gracias por tu compra, ' + escapeHtml(primerNombre) + '!</h3>' +
        '<p>Registramos tu pedido correctamente.</p>' +
        '<div class="order-box">' +
            '<div class="summary-row"><span>N° de pedido</span><strong>' + escapeHtml(r.num_comprobante) + '</strong></div>' +
            '<div class="summary-row total"><span>Total</span><strong>' + formatoPrecio(r.total) + '</strong></div>' +
        '</div>' +
        '<p class="muted-text">Te vamos a escribir a <strong>' + escapeHtml(email) + '</strong> para coordinar el pago y la entrega.</p>' +
        '<button type="button" class="btn btn-primary btn-block" data-accion="seguir">Seguir comprando</button>'
    );
    mostrarVista('exito');
}

// =====================================================
$(document).ready(init);