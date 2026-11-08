<?php
require_once "../modelos/Tienda.php";
header('Content-Type: application/json; charset=utf-8');

$tienda = new Tienda(); //instancia del modelo

// Decodifica las entidades HTML guardadas en la BD (ej: "70&amp;amp;quot;" → '70"') para mostrar texto limpio
function textoPlano($texto)
{
    $texto = (string)$texto;
    $anterior = null;
    while ($texto !== $anterior) {
        $anterior = $texto;
        $texto = html_entity_decode($texto, ENT_QUOTES, 'UTF-8');
    }
    return $texto;
}

// Recorta un texto recibido al largo máximo de la columna
function recortar($texto, $largo)
{
    $texto = trim((string)$texto);
    return function_exists('mb_substr') ? mb_substr($texto, 0, $largo, 'UTF-8') : substr($texto, 0, $largo);
}

// Arma el array de un producto para enviar al navegador
function armarProducto($reg)
{
    $reg = (object)$reg;
    return array(
        "idarticulo" => (int)$reg->idarticulo,
        "nombre" => textoPlano($reg->nombre),
        "categoria" => isset($reg->categoria) ? textoPlano($reg->categoria) : "",
        "marca" => isset($reg->marca) && $reg->marca !== null ? textoPlano($reg->marca) : "",
        "descripcion" => isset($reg->descripcion) ? textoPlano($reg->descripcion) : "",
        "codigo" => isset($reg->codigo) ? $reg->codigo : "",
        "precio_venta" => (float)$reg->precio_venta,
        "precio_formateado" => "$" . number_format((float)$reg->precio_venta, 2, ",", "."), // "$1.500.000,00"
        "stock" => isset($reg->stock) ? (int)$reg->stock : 0,
        "imagen" => !empty($reg->imagen) ? $reg->imagen : "" // vacío = el JS muestra la imagen por defecto
    );
}

// CAPTURA LOS PARÁMETROS GET
$categoria = isset($_GET["categoria"]) ? limpiarCadena($_GET["categoria"]) : "";
$marca = isset($_GET["marca"]) ? limpiarCadena($_GET["marca"]) : "";
$buscar = isset($_GET["buscar"]) ? limpiarCadena(trim($_GET["buscar"])) : "";
$precio_rango = isset($_GET["precio"]) ? limpiarCadena($_GET["precio"]) : "";
$ordenar = isset($_GET["ordenar"]) ? limpiarCadena($_GET["ordenar"]) : "";
$pagina = isset($_GET["pagina"]) ? max(1, (int)$_GET["pagina"]) : 1;
$idarticulo = isset($_GET["idarticulo"]) ? (int)$_GET["idarticulo"] : 0;

// Configuración de paginación
$productos_por_pagina = 8;
$offset = ($pagina - 1) * $productos_por_pagina;

// Procesar rango de precios: "min-max" o "min+" (sin tope)
$precio_min = "";
$precio_max = "";
if ($precio_rango !== "") {
    if (substr($precio_rango, -1) == "+") {
        $precio_min = (float)rtrim($precio_rango, "+");
    } else {
        $precios = explode("-", $precio_rango);
        $precio_min = isset($precios[0]) && $precios[0] !== "" ? (float)$precios[0] : "";
        $precio_max = isset($precios[1]) && $precios[1] !== "" ? (float)$precios[1] : "";
    }
}

$op = isset($_GET["op"]) ? $_GET["op"] : "";

switch ($op) {
    case 'listarProductos':
        $rspta = $tienda->listarProductos($categoria, $marca, $buscar, $precio_min, $precio_max, $ordenar, $productos_por_pagina, $offset);
        $data = Array();

        while ($reg = $rspta->fetch_object()) {
            $data[] = armarProducto($reg);
        }

        // Total de productos que coinciden con los filtros (para la paginación)
        $total_productos = $tienda->contarProductos($categoria, $marca, $buscar, $precio_min, $precio_max);
        $total = (int)$total_productos['total'];
        $total_paginas = (int)ceil($total / $productos_por_pagina);

        $results = array(
            "productos" => $data,
            "total_productos" => $total,
            "total_paginas" => $total_paginas,
            "pagina_actual" => $pagina
        );

        echo json_encode($results);
        break;

    case 'listarCategorias':
        $rspta = $tienda->listarCategorias();
        $data = Array();

        while ($reg = $rspta->fetch_object()) {
            $data[] = array(
                "idcategoria" => (int)$reg->idcategoria,
                "nombre" => textoPlano($reg->nombre)
            );
        }

        echo json_encode($data);
        break;

    case 'listarMarcas':
        $rspta = $tienda->listarMarcas();
        $data = Array();

        while ($reg = $rspta->fetch_object()) {
            $data[] = array(
                "idmarca" => (int)$reg->idmarca,
                "nombre" => textoPlano($reg->nombre)
            );
        }

        echo json_encode($data);
        break;

    case 'mostrarProducto':
        $rspta = $tienda->mostrarProducto($idarticulo);

        if ($rspta && $rspta['precio_venta'] !== null) {
            echo json_encode(armarProducto($rspta));
        } else {
            echo json_encode(array("error" => "Producto no encontrado"));
        }
        break;

    case 'productosRelacionados':
        $producto = $tienda->mostrarProducto($idarticulo);
        $data = Array();

        if ($producto) {
            $rspta = $tienda->productosRelacionados($producto['idcategoria'], $idarticulo, 4);
            while ($reg = $rspta->fetch_object()) {
                $data[] = armarProducto($reg);
            }
        }

        echo json_encode($data);
        break;

    case 'confirmarPedido':
        // Datos del cliente (se recortan al tamaño de las columnas de la tabla persona)
        $tipos_validos = array("DNI", "CUIT", "Pasaporte");
        $tipo_documento = isset($_POST["tipo_documento"]) && in_array($_POST["tipo_documento"], $tipos_validos) ? $_POST["tipo_documento"] : "DNI";
        $email_original = isset($_POST["email"]) ? trim($_POST["email"]) : "";

        $cliente = array(
            "nombre" => limpiarCadena(recortar(isset($_POST["nombre"]) ? $_POST["nombre"] : "", 100)),
            "tipo_documento" => $tipo_documento,
            "num_documento" => limpiarCadena(recortar(isset($_POST["num_documento"]) ? $_POST["num_documento"] : "", 20)),
            "direccion" => limpiarCadena(recortar(isset($_POST["direccion"]) ? $_POST["direccion"] : "", 70)),
            "telefono" => limpiarCadena(recortar(isset($_POST["telefono"]) ? $_POST["telefono"] : "", 20)),
            "email" => limpiarCadena(recortar($email_original, 50))
        );

        // Validaciones
        $errores = array();
        if (strlen($cliente["nombre"]) < 3) {
            $errores[] = "Ingresá tu nombre y apellido";
        }
        if (!preg_match('/^[0-9A-Za-z\-\.]{6,20}$/', $cliente["num_documento"])) {
            $errores[] = "Ingresá un número de documento válido";
        }
        if (!filter_var($email_original, FILTER_VALIDATE_EMAIL)) {
            $errores[] = "Ingresá un email válido";
        }
        if (strlen($cliente["direccion"]) < 5) {
            $errores[] = "Ingresá una dirección de entrega";
        }

        // Ítems del carrito: llegan como JSON [{idarticulo, cantidad}, ...]
        $items_json = isset($_POST["items"]) ? json_decode($_POST["items"], true) : null;
        $items = array();
        if (is_array($items_json)) {
            foreach ($items_json as $item) {
                $id = isset($item["idarticulo"]) ? (int)$item["idarticulo"] : 0;
                $cantidad = isset($item["cantidad"]) ? (int)$item["cantidad"] : 0;
                if ($id > 0 && $cantidad > 0 && $cantidad <= 999) {
                    $items[$id] = (isset($items[$id]) ? $items[$id] : 0) + $cantidad;
                }
            }
        }
        if (count($items) == 0) {
            $errores[] = "El carrito está vacío";
        }

        if (count($errores) > 0) {
            echo json_encode(array("ok" => false, "mensaje" => implode(". ", $errores)));
            break;
        }

        echo json_encode($tienda->registrarPedido($cliente, $items));
        break;

    default:
        echo json_encode(array("error" => "Operación no válida"));
        break;
}
?>