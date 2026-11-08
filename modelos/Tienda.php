<?php
//Incluímos inicialmente la conexión a la base de datos
require "../config/Conexion.php";

Class Tienda
{
    //Usuario del sistema (tabla usuario) al que se le asignan las ventas hechas desde la tienda web
    const ID_USUARIO_WEB = 1;

    //Implementamos nuestro constructor
    public function __construct()
    {

    }

    //Consulta base: artículos activos, con stock, su categoría, su marca y el último precio de venta (detalle_ingreso)
    private function consultaBase()
    {
        return "SELECT a.idarticulo, a.idcategoria, c.nombre as categoria, a.idmarca, m.nombre as marca, a.codigo, a.nombre, a.stock, a.descripcion, a.imagen,
                (SELECT precio_venta FROM detalle_ingreso WHERE idarticulo=a.idarticulo ORDER BY iddetalle_ingreso DESC LIMIT 1) as precio_venta
                FROM articulo a
                INNER JOIN categoria c ON a.idcategoria=c.idcategoria
                LEFT JOIN marca m ON a.idmarca=m.idmarca
                WHERE a.condicion='1' AND a.stock > 0";
    }

    //Arma la consulta con todos los filtros (se usa para listar y para contar, así siempre coinciden)
    private function consultaFiltrada($categoria, $marca, $buscar, $precio_min, $precio_max)
    {
        $sql = $this->consultaBase();

        // Filtro por categoría
        if ($categoria !== "") {
            $categoria = (int)$categoria;
            $sql .= " AND a.idcategoria = '$categoria'";
        }

        // Filtro por marca
        if ($marca !== "") {
            $marca = (int)$marca;
            $sql .= " AND a.idmarca = '$marca'";
        }

        // Filtro por búsqueda: nombre, descripción, código, marca o categoría
        if ($buscar !== "") {
            $sql .= " AND (a.nombre LIKE '%$buscar%' OR a.descripcion LIKE '%$buscar%' OR a.codigo LIKE '%$buscar%' OR m.nombre LIKE '%$buscar%' OR c.nombre LIKE '%$buscar%')";
        }

        // Envolvemos la consulta para poder filtrar por el precio calculado
        $sql = "SELECT * FROM ($sql) as productos WHERE precio_venta IS NOT NULL";

        if ($precio_min !== "") {
            $sql .= " AND precio_venta >= " . (float)$precio_min;
        }
        if ($precio_max !== "") {
            $sql .= " AND precio_venta <= " . (float)$precio_max;
        }

        return $sql;
    }

    //Implementar un método para listar los artículos activos con precios para la tienda pública
    public function listarProductos($categoria = "", $marca = "", $buscar = "", $precio_min = "", $precio_max = "", $ordenar = "", $limite = 8, $offset = 0)
    {
        $sql = $this->consultaFiltrada($categoria, $marca, $buscar, $precio_min, $precio_max);

        // Ordenamiento (por defecto ordena por nombre)
        switch ($ordenar) {
            case 'name_asc':
                $sql .= " ORDER BY nombre ASC";
                break;
            case 'name_desc':
                $sql .= " ORDER BY nombre DESC";
                break;
            case 'price_asc':
                $sql .= " ORDER BY precio_venta ASC";
                break;
            case 'price_desc':
                $sql .= " ORDER BY precio_venta DESC";
                break;
            default:
                $sql .= " ORDER BY nombre ASC";
                break;
        }

        // Límite y offset para paginación
        $limite = (int)$limite;
        $offset = (int)$offset;
        $sql .= " LIMIT $limite OFFSET $offset";

        return ejecutarConsulta($sql);
    }

    //Implementar un método para contar el total de productos (para paginación)
    public function contarProductos($categoria = "", $marca = "", $buscar = "", $precio_min = "", $precio_max = "")
    {
        $sql = "SELECT COUNT(*) as total FROM (" . $this->consultaFiltrada($categoria, $marca, $buscar, $precio_min, $precio_max) . ") as conteo";
        return ejecutarConsultaSimpleFila($sql);
    }

    //Implementar un método para obtener las categorías activas
    public function listarCategorias()
    {
        $sql = "SELECT idcategoria, nombre FROM categoria WHERE condicion=1 ORDER BY nombre ASC";
        return ejecutarConsulta($sql);
    }

    //Implementar un método para obtener las marcas activas
    public function listarMarcas()
    {
        $sql = "SELECT idmarca, nombre FROM marca WHERE condicion=1 ORDER BY nombre ASC";
        return ejecutarConsulta($sql);
    }

    //Implementar un método para mostrar un producto específico
    public function mostrarProducto($idarticulo)
    {
        $idarticulo = (int)$idarticulo;
        $sql = "SELECT a.idarticulo, a.idcategoria, c.nombre as categoria, a.idmarca, m.nombre as marca, a.codigo, a.nombre, a.stock, a.descripcion, a.imagen,
                (SELECT precio_venta FROM detalle_ingreso WHERE idarticulo=a.idarticulo ORDER BY iddetalle_ingreso DESC LIMIT 1) as precio_venta
                FROM articulo a
                INNER JOIN categoria c ON a.idcategoria=c.idcategoria
                LEFT JOIN marca m ON a.idmarca=m.idmarca
                WHERE a.idarticulo='$idarticulo' AND a.condicion='1'";
        return ejecutarConsultaSimpleFila($sql);
    }

    //Implementar un método para productos relacionados (misma categoría, con stock y precio)
    public function productosRelacionados($idcategoria, $idarticulo, $limite = 4)
    {
        $idcategoria = (int)$idcategoria;
        $idarticulo = (int)$idarticulo;
        $limite = (int)$limite;
        $sql = "SELECT * FROM (
                    SELECT a.idarticulo, a.nombre, a.imagen, m.nombre as marca,
                    (SELECT precio_venta FROM detalle_ingreso WHERE idarticulo=a.idarticulo ORDER BY iddetalle_ingreso DESC LIMIT 1) as precio_venta
                    FROM articulo a
                    LEFT JOIN marca m ON a.idmarca=m.idmarca
                    WHERE a.idcategoria='$idcategoria' AND a.idarticulo != '$idarticulo' AND a.condicion='1' AND a.stock > 0
                ) as relacionados
                WHERE precio_venta IS NOT NULL
                ORDER BY RAND()
                LIMIT $limite";
        return ejecutarConsulta($sql);
    }

    //Implementar un método para registrar un pedido de la tienda como venta
    //$cliente: datos ya limpiados con limpiarCadena | $items: array(idarticulo => cantidad)
    //Usa las tablas existentes: persona (cliente), venta y detalle_venta (el trigger tr_updStockVenta descuenta el stock)
    public function registrarPedido($cliente, $items)
    {
        $this->iniciarTransaccion();

        try {
            $detalle = array();
            $total = 0;
            $stockActual = array();
            $mensajes = array();

            // 1) Validamos stock y tomamos el precio desde la BD (nunca el que manda el navegador)
            foreach ($items as $idarticulo => $cantidad) {
                $idarticulo = (int)$idarticulo;
                $cantidad = (int)$cantidad;

                $sql = "SELECT a.idarticulo, a.nombre, a.stock, a.condicion,
                        (SELECT precio_venta FROM detalle_ingreso WHERE idarticulo=a.idarticulo ORDER BY iddetalle_ingreso DESC LIMIT 1) as precio_venta
                        FROM articulo a WHERE a.idarticulo='$idarticulo' FOR UPDATE";
                $art = ejecutarConsultaSimpleFila($sql);

                if (!$art || $art['condicion'] != 1 || $art['precio_venta'] === null) {
                    $stockActual[$idarticulo] = 0;
                    $mensajes[] = "Un artículo de tu carrito ya no está disponible";
                    continue;
                }
                if ((int)$art['stock'] < $cantidad) {
                    $stockActual[$idarticulo] = (int)$art['stock'];
                    $mensajes[] = "Solo quedan " . (int)$art['stock'] . " unidad(es) de " . $art['nombre'];
                    continue;
                }

                $precio = (float)$art['precio_venta'];
                $total += $precio * $cantidad;
                $detalle[] = array("idarticulo" => $idarticulo, "cantidad" => $cantidad, "precio" => $precio);
            }

            if (count($stockActual) > 0) {
                $this->cancelarTransaccion();
                return array("ok" => false, "mensaje" => implode(". ", $mensajes), "stock" => $stockActual);
            }

            // 2) Cliente (se reutiliza si ya existe con ese documento)
            $idcliente = $this->obtenerCliente($cliente);
            if (!$idcliente) {
                throw new Exception("No se pudo registrar el cliente");
            }

            // 3) Cabecera de la venta
            $idusuario = self::ID_USUARIO_WEB;
            $total_sql = number_format($total, 2, ".", "");
            $sql = "INSERT INTO venta (idcliente,idusuario,tipo_comprobante,serie_comprobante,num_comprobante,fecha_hora,impuesto,total_venta,estado)
                    VALUES ('$idcliente','$idusuario','Ticket','WEB','0',NOW(),'21.00','$total_sql','Aceptado')";
            $idventa = $this->insertarRetornarID($sql);
            if (!$idventa) {
                throw new Exception("No se pudo registrar la venta");
            }

            // El número de comprobante es el id de la venta con ceros a la izquierda
            $num_comprobante = str_pad($idventa, 8, "0", STR_PAD_LEFT);
            ejecutarConsulta("UPDATE venta SET num_comprobante='$num_comprobante' WHERE idventa='$idventa'");

            // 4) Detalle de la venta
            foreach ($detalle as $d) {
                $precio_sql = number_format($d["precio"], 2, ".", "");
                $sql = "INSERT INTO detalle_venta (idventa,idarticulo,cantidad,precio_venta,descuento)
                        VALUES ('$idventa','{$d["idarticulo"]}','{$d["cantidad"]}','$precio_sql','0')";
                if (!ejecutarConsulta($sql)) {
                    throw new Exception("No se pudo registrar el detalle");
                }
            }

            $this->confirmarTransaccion();

            return array(
                "ok" => true,
                "idventa" => (int)$idventa,
                "num_comprobante" => "WEB-" . $num_comprobante,
                "total" => $total
            );
        } catch (Throwable $e) {
            $this->cancelarTransaccion();
            return array("ok" => false, "mensaje" => "No se pudo registrar el pedido. Intentá nuevamente.");
        }
    }

    //Busca el cliente por número de documento; si no existe lo crea. Devuelve el idpersona
    private function obtenerCliente($c)
    {
        $sql = "SELECT idpersona FROM persona WHERE tipo_persona='Cliente' AND num_documento='{$c["num_documento"]}' LIMIT 1";
        $existente = ejecutarConsultaSimpleFila($sql);
        if ($existente) {
            return (int)$existente['idpersona'];
        }

        $sql = "INSERT INTO persona (tipo_persona,nombre,tipo_documento,num_documento,direccion,telefono,email)
                VALUES ('Cliente','{$c["nombre"]}','{$c["tipo_documento"]}','{$c["num_documento"]}','{$c["direccion"]}','{$c["telefono"]}','{$c["email"]}')";
        return $this->insertarRetornarID($sql);
    }

    //Inserta y devuelve el id generado (usa la función de Conexion.php si existe)
    private function insertarRetornarID($sql)
    {
        if (function_exists('ejecutarConsulta_retornarID')) {
            return ejecutarConsulta_retornarID($sql);
        }
        global $conexion;
        $conexion->query($sql);
        return $conexion->insert_id;
    }

    //Manejo de transacciones sobre la conexión global de Conexion.php
    private function iniciarTransaccion()
    {
        global $conexion;
        if (isset($conexion) && $conexion instanceof mysqli) {
            $conexion->begin_transaction();
        }
    }

    private function confirmarTransaccion()
    {
        global $conexion;
        if (isset($conexion) && $conexion instanceof mysqli) {
            $conexion->commit();
        }
    }

    private function cancelarTransaccion()
    {
        global $conexion;
        if (isset($conexion) && $conexion instanceof mysqli) {
            $conexion->rollback();
        }
    }
}

?>