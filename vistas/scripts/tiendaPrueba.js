//Variables globales
var productos = [];      // Array que almacena los productos cargados
var paginaActual = 1;    // Número de página actual para la paginación
var totalPaginas = 1;    // Total de páginas disponibles
var carrito = JSON.parse(localStorage.getItem('carrito')) || []; 
// Recupera el carrito del localStorage o inicializa array vacío

//Función que se ejecuta al inicio
function init() {
    cargarCategorias();        // Carga las categorías disponibles
    cargarProductos();         // Carga los productos iniciales
    actualizarContadorCarrito(); 
    // Actualiza el contador visual del carrito
}
// Función para cargar categorías dinámicamente
function cargarCategorias() {
    $.ajax({
    	// Petición AJAX con jQuery
       	// Método HTTP GET
    	// Función que se ejecuta si la petición es exitosa
    	// Obtiene el elemento select de categorías
    	// Función que se ejecuta si hay error
    });
}


function cargarProductos(pagina = 1) {    // Función con parámetro por defecto
	mostrarCargando(true);                // Muestra indicador de carga
    ocultarMensajes();                    // Oculta mensajes previos 

    var categoria = $('#categoryFilter').val(); 
    var buscar = $('#searchInput').val();       
    var precio = $('#priceFilter').val();       
    var ordenar = $('#sortFilter').val();       
             
    
    $.ajax({ 
        url: '../ajax/tiendaPrueba.php?op=listarProductos',
        type: 'GET',
        data: {
            categoria: categoria,
            buscar: buscar,
            precio: precio,
            ordenar: ordenar,
            pagina: pagina
        },
        dataType: 'json',
        success: function(response) {
            productos = response.productos;
            paginaActual = response.pagina_actual;
            totalPaginas = response.total_paginas;
            
            mostrarProductos();
            crearPaginacion();
            mostrarCargando(false);
            
            if (productos.length === 0) {
                mostrarError('No se encontraron productos con los filtros seleccionados');
            }
        },
        error: function(xhr, status, error) {
            console.log('Error al cargar productos:', error);
            mostrarError('Error al cargar los productos. Intente nuevamente.');
            mostrarCargando(false);
        }
      });
}



function mostrarProductos() {
    var container = $('#productsContainer');
    container.empty();
    
    if (productos.length === 0) {
        container.html('<div class="no-products">No se encontraron productos</div>');
        return;
    }
    
    $.each(productos, function(index, producto) {
        var imagePath = producto.imagen !== 'default.jpg' 
            ? '../files/articulos/' + producto.imagen 
            : '../public2/default-product.jpg';
        
        var productCard = `
            <div class="product-card" onclick="verProducto(${producto.idarticulo})">
                <div class="product-image">
                    <img src="${imagePath}" alt="${producto.nombre}" onerror="this.src='../public2/default-product.jpg'">
                </div>
                <div class="product-info">
                    <div class="product-name">${producto.nombre}</div>
                    <div class="product-description">${producto.descripcion}</div>
                    <div class="product-price">${producto.precio_formateado}</div>
                    <div class="product-stock">Stock: ${producto.stock} unidades</div>
                    <button class="add-to-cart" onclick="agregarAlCarrito(event, ${producto.idarticulo}, '${producto.nombre}', ${producto.precio_venta})">
                        Agregar al carrito
                    </button>
                </div>
            </div>
        `;
        
        container.append(productCard);
    });


}

function crearPaginacion() {

    var paginationContainer = $('#pagination');
    paginationContainer.empty();
    
    if (totalPaginas < 1) {
        return;
    }
    
    // Botón anterior
    if (paginaActual > 1) {
        paginationContainer.append(`<button class="page-btn" onclick="cargarProductos(${paginaActual - 1})">‹ Anterior</button>`);
    }
    
    // Números de página
    var inicio = Math.max(1, paginaActual - 2);
    var fin = Math.min(totalPaginas, paginaActual + 2);
    
    
    for (var i = inicio; i <= fin; i++) {
        var activeClass = i === paginaActual ? 'active' : '';
        paginationContainer.append(`<button class="page-btn ${activeClass}" onclick="cargarProductos(${i})">${i}</button>`);
    }
    
    // Botón siguiente
    if (paginaActual < totalPaginas) {
        paginationContainer.append(`<button class="page-btn" onclick="cargarProductos(${paginaActual + 1})">Siguiente ›</button>`);
    }


 }


// Carga productos desde la página 1
 function buscarProductos() {
    cargarProductos(1);                                  
}


function limpiarFiltros() {
    $('#categoryFilter').val('');  // Limpia filtro de categoría
   // $('#marcaFilter').val('');     // Limpia filtro de marca
    $('#priceFilter').val('');     // Limpia filtro de precio
    $('#sortFilter').val('');      // Limpia criterio de ordenamiento
    $('#searchInput').val('');     // Limpia campo de búsqueda
    cargarProductos(1);            // Recarga productos sin filtros
}

function verProducto(idarticulo) {
    $.ajax({
        url: '../ajax/tiendaPrueba.php?op=mostrarProducto',
        type: 'GET',
        data: { idarticulo: idarticulo },
        dataType: 'json',
        success: function(producto) {
            if (producto.error) {
                mostrarError('Producto no encontrado');
                return;
            }
            
            mostrarDetalleProducto(producto);
        },
        error: function() {
            mostrarError('Error al cargar el producto');
        }

    	 // Petición AJAX para obtener detalles
    	 // Muestra modal con detalles
    });
}

 function mostrarDetalleProducto(producto) {
    // Determina ruta de imagen
    // Agrega el modal al DOM
    var imagePath = producto.imagen !== 'default.jpg' 
        ? '../files/articulos/' + producto.imagen 
        : '../public2/default-product.jpg';
    
    var modal = `
        <div id="productModal" class="modal-overlay" onclick="cerrarModal()">
            <div class="modal-content" onclick="event.stopPropagation()">
                <span class="close" onclick="cerrarModal()">&times;</span>
                <div class="modal-body">
                    <div class="product-detail-image">
                        <img src="${imagePath}" alt="${producto.nombre}" onerror="this.src='../public2/default-product.jpg'">
                    </div>
                    <div class="product-detail-info">
                        <h2>${producto.nombre}</h2>
                        <p class="category">Categoría: ${producto.categoria}</p>
                        <p class="description">${producto.descripcion}</p>
                        <p class="price">${producto.precio_formateado}</p>
                        <p class="stock">Stock disponible: ${producto.stock} unidades</p>
                        <button class="add-to-cart-large" onclick="agregarAlCarrito(event, ${producto.idarticulo}, '${producto.nombre}', ${producto.precio_venta})">
                            Agregar al Carrito
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    $('body').append(modal);
}

function cerrarModal() {
    $('#productModal').remove(); 
    // Elimina el modal del DOM
}

function agregarAlCarrito(event, idarticulo, nombre, precio) {
    // Agrega y Busca si el producto ya está en el carrito
     // Si ya existe
     // Incrementa la cantidad
    }

function actualizarContadorCarrito() {
       // Suma todas las cantidades
       // Actualiza el texto del contador
}

function verCarrito() {
    // Si el carrito está vacío Muestra mensaje
    // Variable para calcular total
    // Itera sobre cada item del carrito
    // usa template
}

function cambiarCantidad(idarticulo, cambio) {
    // Encuentra el item
    // Si existe, Aplica el cambio (+ o -)
 }

 function eliminarDelCarrito(idarticulo) {
 	// Filtra el item a eliminar
 	// Guarda cambios
 	// Actualiza contador
 }

 function vaciarCarrito() {
    carrito = [];                                        
    // Vacía el array
    localStorage.removeItem('carrito');                  
    // Elimina del localStorage
    actualizarContadorCarrito();                         
    // Actualiza contador
    cerrarCarrito();                                     
    // Cierra modal
    mostrarExito('Carrito vaciado');                     
    // Muestra mensaje
}

function cerrarCarrito() {
    $('#cartModal').remove(); // Elimina modal del carrito
}

function procederAlPago() {
    mostrarExito('Función de pago en desarrollo');       
    // Placeholder para función de pago
}

function mostrarCargando(mostrar) {
    if (mostrar) {                                       
    // Si debe mostrar
        $('#loadingMessage').show();                     
        // Muestra indicador de carga
    } else {                                             
    // Si debe ocultar
        $('#loadingMessage').hide();                     
        // Oculta indicador
    }
}

function mostrarError(mensaje) {
    $('#errorMessage').text(mensaje).show();             
    // Muestra mensaje de error
    setTimeout(() => $('#errorMessage').hide(), 5000);   
    // Auto-oculta después de 5 segundos
}

function mostrarExito(mensaje) {
    $('#successMessage').text(mensaje).show();           
    // Muestra mensaje de éxito
    setTimeout(() => $('#successMessage').hide(), 3000); 
    // Auto-oculta después de 3 segundos
}

function ocultarMensajes() {
    $('#errorMessage').hide();  // Oculta mensaje de error
    $('#successMessage').hide(); // Oculta mensaje de éxito
}

//// Cuando el DOM está listo, Ejecuta función de inicialización
// Event listeners
$(document).ready(function() {
    init();
    
    // Buscar al presionar Enter
    $('#searchInput').keypress(function(e) {
        if (e.which === 13) {
            buscarProductos();
        }
    });
    
    // Filtros en tiempo real
    $('#categoryFilter, #priceFilter, #sortFilter').change(function() {
        cargarProductos(1);
    });
});
// Estas funciones son alias para mantener compatibilidad con código HTML existente
function loadProducts(pagina) {
    cargarProductos(pagina);                             
    // Alias para cargarProductos
}

function searchProducts() {
    buscarProductos();         // Alias para buscarProductos
}

function clearFilters() {
    limpiarFiltros();         // Alias para limpiarFiltros
}

function viewProduct(idarticulo) {
    verProducto(idarticulo);   // Alias para verProducto
}

function addToCart(event, idarticulo, nombre, precio) {
    agregarAlCarrito(event, idarticulo, nombre, precio); // Alias para agregarAlCarrito
}

function viewCart() {
    verCarrito();    // Alias para verCarrito
}



