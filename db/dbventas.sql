-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 04-10-2026 a las 13:28:16
-- Versión del servidor: 10.4.32-MariaDB
-- Versión de PHP: 8.2.12
--
-- MODIFICADO: se agregó la tabla `marca` y la columna `articulo.idmarca`
-- (clave foránea hacia `marca`). Todos los datos originales se conservan.

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `dbventas`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `articulo`
--

CREATE TABLE `articulo` (
  `idarticulo` int(11) NOT NULL,
  `idcategoria` int(11) NOT NULL,
  `idmarca` int(11) DEFAULT NULL,
  `codigo` varchar(50) DEFAULT NULL,
  `nombre` varchar(100) NOT NULL,
  `stock` int(11) NOT NULL,
  `descripcion` varchar(256) DEFAULT NULL,
  `imagen` varchar(50) DEFAULT NULL,
  `condicion` tinyint(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

--
-- Volcado de datos para la tabla `articulo`
--

INSERT INTO `articulo` (`idarticulo`, `idcategoria`, `idmarca`, `codigo`, `nombre`, `stock`, `descripcion`, `imagen`, `condicion`) VALUES
(1, 1, 1, '87678687687687', 'Guitarra Fender Strato Mexico', 39, 'Strato 70&amp;amp;quot;', '1562715791.jpg', 1),
(2, 2, 2, '678678767jjyu6767', 'Bajo Squier by Fender Mod Jass Bazz7', 18, 'mmmmBajos', '1562794813.jpg', 1),
(3, 4, 3, '32423423432432432432', 'Caña Saxo Alto Rico 2 1/2', 25, 'cañas', '1562715843.jpg', 1),
(4, 11, 4, '34534534543543', 'Saxo Tenor Yamaha mod YTS', 0, 'Saxo', '1562715863.jpg', 1),
(5, 12, 5, '65464654654654665', 'Armónica Oscar Diatónica C', 9, 'Arm', '1562715882.jpg', 1),
(6, 3, 6, '2343242343242332', 'Bateria Mapex Prodigy', 5, 'batera', '1562794768.jpg', 1),
(7, 5, 7, '45451121454545454', 'Consola BLG 150 watts 2 x 15&quot;', 5, 'bafles', '1562794723.jpg', 1),
(8, 13, 8, '5455464654', 'Funda guitarra eléctrica', 9, 'fundas guitarras con colcha', '', 1),
(9, 13, 8, '654645dasdas', 'Funda guitarra criolla', 20, 'fundas acolchadas guitarra criolla', '', 1),
(10, 1, 8, '654654654kjhkhkhj', 'Guitarra Electrica Modelo B', 0, 'Modelo Stratocaster', '1788794917.jpg', 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `categoria`
--

CREATE TABLE `categoria` (
  `idcategoria` int(11) NOT NULL,
  `nombre` varchar(50) NOT NULL,
  `descripcion` varchar(256) DEFAULT NULL,
  `condicion` tinyint(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

--
-- Volcado de datos para la tabla `categoria`
--

INSERT INTO `categoria` (`idcategoria`, `nombre`, `descripcion`, `condicion`) VALUES
(1, 'Guitarras Eléctricas', 'Distintos Modelos', 1),
(2, 'Bajos Eléctricos', 'Acá van los bajos', 1),
(3, 'Baterias Acústicas', 'Acá van las baterias', 1),
(4, 'Accesorios Instrum. Viento', 'accesorios', 1),
(5, 'Bafles y Consolas', 'Sonido - Varios', 1),
(8, 'Amplificadores - Varios', 'Amplis', 1),
(9, 'Pedales de Efectos', 'Pedales', 1),
(10, 'Pianos', 'aca va pianos', 1),
(11, 'Vientos', 'Vientos', 1),
(12, 'Armónicas', 'aca van las armonicas', 1),
(13, 'Fundas', 'Fundas para instrumentos musicales', 1),
(14, 'Guitarras Clásicashhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhh', 'Rubro de todas las guiatrras criollas', 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `detalle_ingreso`
--

CREATE TABLE `detalle_ingreso` (
  `iddetalle_ingreso` int(11) NOT NULL,
  `idingreso` int(11) NOT NULL,
  `idarticulo` int(11) NOT NULL,
  `cantidad` int(11) NOT NULL,
  `precio_compra` decimal(11,2) NOT NULL,
  `precio_venta` decimal(11,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

--
-- Volcado de datos para la tabla `detalle_ingreso`
--

INSERT INTO `detalle_ingreso` (`iddetalle_ingreso`, `idingreso`, `idarticulo`, `cantidad`, `precio_compra`, `precio_venta`) VALUES
(1, 7, 1, 10, 10.00, 20.00),
(2, 7, 2, 10, 10.00, 20.00),
(3, 8, 1, 10, 200.00, 300.00),
(4, 9, 1, 2, 500000.00, 1000000.00),
(5, 10, 8, 10, 15000.00, 30000.00),
(6, 10, 9, 20, 12000.00, 28000.00),
(7, 11, 3, 10, 2500.00, 5000.00),
(8, 11, 5, 10, 12000.00, 25000.00),
(9, 12, 1, 5, 800000.00, 1500000.00),
(10, 12, 2, 2, 900000.00, 1900000.00);

--
-- Disparadores `detalle_ingreso`
--
DELIMITER $$
CREATE TRIGGER `tr_updStockIngreso` AFTER INSERT ON `detalle_ingreso` FOR EACH ROW BEGIN
 UPDATE articulo SET stock = stock + NEW.cantidad 
 WHERE articulo.idarticulo = NEW.idarticulo;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `detalle_venta`
--

CREATE TABLE `detalle_venta` (
  `iddetalle_venta` int(11) NOT NULL,
  `idventa` int(11) NOT NULL,
  `idarticulo` int(11) NOT NULL,
  `cantidad` int(11) NOT NULL,
  `precio_venta` decimal(11,2) NOT NULL,
  `descuento` decimal(11,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

--
-- Volcado de datos para la tabla `detalle_venta`
--

INSERT INTO `detalle_venta` (`iddetalle_venta`, `idventa`, `idarticulo`, `cantidad`, `precio_venta`, `descuento`) VALUES
(1, 1, 1, 1, 20.00, 0.00),
(2, 1, 2, 1, 20.00, 0.00),
(3, 2, 3, 1, 400.00, 0.00),
(4, 3, 3, 1, 200.00, 10.00),
(5, 4, 1, 2, 300.00, 0.00),
(6, 4, 2, 1, 20.00, 0.00),
(7, 5, 1, 1, 300.00, 0.00),
(8, 6, 1, 2, 300.00, 0.00),
(9, 6, 2, 1, 20.00, 0.00),
(10, 7, 8, 1, 30000.00, 1000.00),
(11, 8, 2, 1, 250000.00, 0.00),
(12, 9, 5, 1, 25000.00, 2000.00),
(13, 9, 3, 1, 5000.00, 0.00),
(14, 10, 1, 1, 1000000.00, 20000.00),
(15, 11, 1, 1, 1500000.00, 50000.00),
(16, 12, 3, 2, 5000.00, 0.00);

--
-- Disparadores `detalle_venta`
--
DELIMITER $$
CREATE TRIGGER `tr_updStockVenta` AFTER INSERT ON `detalle_venta` FOR EACH ROW BEGIN
 UPDATE articulo SET stock = stock - NEW.cantidad 
 WHERE articulo.idarticulo = NEW.idarticulo;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `ingreso`
--

CREATE TABLE `ingreso` (
  `idingreso` int(11) NOT NULL,
  `idproveedor` int(11) NOT NULL,
  `idusuario` int(11) NOT NULL,
  `tipo_comprobante` varchar(20) NOT NULL,
  `serie_comprobante` varchar(7) DEFAULT NULL,
  `num_comprobante` varchar(10) NOT NULL,
  `fecha_hora` datetime NOT NULL,
  `impuesto` decimal(4,2) NOT NULL,
  `total_compra` decimal(11,2) NOT NULL,
  `estado` varchar(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

--
-- Volcado de datos para la tabla `ingreso`
--

INSERT INTO `ingreso` (`idingreso`, `idproveedor`, `idusuario`, `tipo_comprobante`, `serie_comprobante`, `num_comprobante`, `fecha_hora`, `impuesto`, `total_compra`, `estado`) VALUES
(1, 1, 3, 'Boleta', '0001', '0000222222', '2019-01-21 00:00:00', 0.00, 500.00, 'Anulado'),
(2, 1, 3, 'Boleta', '33333', '33333', '2019-01-21 00:00:00', 0.00, 144.00, 'Anulado'),
(3, 1, 3, 'Boleta', '0001111', '0000011111', '2019-01-21 00:00:00', 0.00, 100.00, 'Anulado'),
(4, 1, 3, 'Boleta', '2222', '2222', '2019-01-22 00:00:00', 0.00, 100.00, 'Aceptado'),
(5, 1, 3, 'Boleta', '44', '444', '2019-01-22 00:00:00', 40.00, 4.00, 'Aceptado'),
(6, 1, 3, 'Boleta', '111', '111', '2019-01-22 00:00:00', 0.00, 10.00, 'Aceptado'),
(7, 1, 3, 'Boleta', '555', '55555', '2019-01-22 00:00:00', 0.00, 200.00, 'Aceptado'),
(8, 1, 3, 'Boleta', '4444', '44444', '2019-01-26 00:00:00', 0.00, 2000.00, 'Aceptado'),
(9, 6, 3, 'Boleta', '0001', '000021245', '2026-09-02 00:00:00', 21.00, 1000000.00, 'Aceptado'),
(10, 8, 1, 'Factura', '0001', '000212332', '2026-09-06 00:00:00', 21.00, 390000.00, 'Aceptado'),
(11, 6, 1, 'Factura', '0001', '00002325', '2026-09-06 00:00:00', 21.00, 145000.00, 'Aceptado'),
(12, 11, 1, 'Factura', '0001', '00001245', '2026-09-07 00:00:00', 21.00, 5800000.00, 'Aceptado');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `marca`  (NUEVA)
--

CREATE TABLE `marca` (
  `idmarca` int(11) NOT NULL,
  `nombre` varchar(50) NOT NULL,
  `descripcion` varchar(256) DEFAULT NULL,
  `condicion` tinyint(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

--
-- Volcado de datos para la tabla `marca`
--

INSERT INTO `marca` (`idmarca`, `nombre`, `descripcion`, `condicion`) VALUES
(1, 'Fender', 'Guitarras y bajos', 1),
(2, 'Squier', 'Línea económica de Fender', 1),
(3, 'Rico', 'Cañas para instrumentos de viento', 1),
(4, 'Yamaha', 'Instrumentos varios', 1),
(5, 'Oscar', 'Armónicas', 1),
(6, 'Mapex', 'Baterías', 1),
(7, 'BLG', 'Sonido - Bafles y consolas', 1),
(8, 'Sin marca', 'Artículos genéricos o sin marca definida', 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `permiso`
--

CREATE TABLE `permiso` (
  `idpermiso` int(11) NOT NULL,
  `nombre` varchar(30) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

--
-- Volcado de datos para la tabla `permiso`
--

INSERT INTO `permiso` (`idpermiso`, `nombre`) VALUES
(1, 'Escritorio'),
(2, 'Almacen'),
(3, 'Compras'),
(4, 'Ventas'),
(5, 'Acceso'),
(6, 'Consulta Compras'),
(7, 'Consulta Ventas');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `persona`
--

CREATE TABLE `persona` (
  `idpersona` int(11) NOT NULL,
  `tipo_persona` varchar(20) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `tipo_documento` varchar(20) DEFAULT NULL,
  `num_documento` varchar(20) DEFAULT NULL,
  `direccion` varchar(70) DEFAULT NULL,
  `telefono` varchar(20) DEFAULT NULL,
  `email` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

--
-- Volcado de datos para la tabla `persona`
--

INSERT INTO `persona` (`idpersona`, `tipo_persona`, `nombre`, `tipo_documento`, `num_documento`, `direccion`, `telefono`, `email`) VALUES
(1, 'Proveedor', 'Son Latino SRL', 'DNI', '26606550', 'San Martín 721', '', ''),
(2, '', '', NULL, NULL, NULL, NULL, NULL),
(3, '', 'TODOMUSICA SA', '', '26655541', 'KJSDHKASJDHKASJ', '', ''),
(4, '', 'AAAAA', '', '1414114', 'AAAAA', '', ''),
(5, 'Cliente', 'Gustavo Paszco', 'DNI', '26606550', 'San Martín 721', '03644452256', 'gustavo@yahoo.com.ar'),
(6, 'Proveedor', 'Todomusica S.A.', 'DNI', '21221456', 'Las Heras 4587', '011-45214554', 'ventas@todomusica.com.ar'),
(7, 'Proveedor', 'Import Music S.A', 'DNI', '41812399', '', '0642-4451145', 'import@hotmail.com'),
(8, 'Proveedor', 'Nusdeo Fundas', 'DNI', '26606553', 'Sarmiento 5558 - Buenos Aires', '1154785698', 'nusdeo@gmail.com'),
(9, 'Cliente', 'Maradona Diego', 'DNI', '1245784578', 'Las Heras 4512 - Sáenz Peña - Chaco', '3644587457', 'diego@gmail.com'),
(10, 'Cliente', 'Messi Lionel Andres', 'DNI', '36547987', 'Calle 22 entre 1 y 3', '3644785874', 'lionel@yahoo.com.ar'),
(11, 'Proveedor', 'IMSA', 'DNI', '25478569', 'Sarmiento 5478  - Resistencia - Chaco', '1145789654', 'imsa@gmail.com');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuario`
--

CREATE TABLE `usuario` (
  `idusuario` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `tipo_documento` varchar(20) NOT NULL,
  `num_documento` varchar(20) NOT NULL,
  `direccion` varchar(70) DEFAULT NULL,
  `telefono` varchar(20) DEFAULT NULL,
  `email` varchar(50) DEFAULT NULL,
  `cargo` varchar(20) DEFAULT NULL,
  `login` varchar(20) NOT NULL,
  `clave` varchar(64) NOT NULL,
  `imagen` varchar(50) NOT NULL,
  `condicion` tinyint(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

--
-- Volcado de datos para la tabla `usuario`
--

INSERT INTO `usuario` (`idusuario`, `nombre`, `tipo_documento`, `num_documento`, `direccion`, `telefono`, `email`, `cargo`, `login`, `clave`, `imagen`, `condicion`) VALUES
(1, 'Gustavo Paszco', 'DNI', '26606550', 'San Martín 721', '364420268', 'gustavopaszco@yahoo.com.ar', 'Profesor', 'admin', '8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918', '1562716667.jpg', 1),
(2, 'sdfsdfdsf', 'DNI', '32423432', 'wrwerew', '2423432', 'werwerew@erwerwre.com', 'weqweqw', 'vendendor', '7d77d86f7ded63285f39fa6a670274773d589b8647182ecc6ea2bf4b5ca658a3', '1547075569.jpg', 0),
(3, 'Ana Dias', 'DNI', '25444551', '', '', '', '', 'Ana', 'dea210f058b407db5c1b5ea89b2e42a57221c003dba55e2f1776a75a3254d386', '', 1),
(4, 'werewrew', 'DNI', '3423432', '23423432werwer', '23423432', '', '', 'wwww', '6b4a1673b225e8bf5f093b91be8c864427df32ca41b17cc0b82112b8f0185e41', '', 0),
(5, 'sdsds', 'DNI', '32332', 'wqewqewq', '213213', '', '', 'aaa', '9834876dcfb05cb167a5c24953eba58c4ac89b1adf57f28f2f9d09af107ee8f0', '', 0),
(7, 'bbbbbbbbbbbb', 'DNI', '222222', 'bbbbb', '222222', '', '', 'bbb', '3e744b9dc39389baf0c5a0660589b8402f3dbb49b89b3e75f2c9355852a3c677', '', 1),
(8, 'www', 'DNI', '21312312312', 'sds', '23213', 'gustavopaszco@yahoo.com.ar', 'dfsdf', 'www', 'www', '', 1),
(9, 'usuario1', 'DNI', '23232323', 'gjhgjhghg', '654654564', 'jkjlkj', '465465465', 'usuario1', 'a0ccddd9e5ddd2617e88f6515a2998f0119b6e99fd2bfef049550ad983af9fa0', '', 1),
(10, 'Gastón Gonzalez', 'DNI', '33363665', 'Sarmiento 289', '3644589874', 'gaston@gmail.com', 'Vendedor', 'gaston', '777addbc9f618b134908e300782cb83c63d9e59120051b6b36e32cae3ecf2f0d', '', 1),
(11, 'Ginobilli Manuel', 'DNI', '25478965', 'Las Heras 4445', '3644587478', 'manuel@gmail.com', 'Vendedor', 'manuel', 'cca457407f24b80c72d89dd061837112cb99a0aa050c155514b320b7aaffe95c', '1788796159.jpg', 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuario_permiso`
--

CREATE TABLE `usuario_permiso` (
  `idusuario_permiso` int(11) NOT NULL,
  `idusuario` int(11) NOT NULL,
  `idpermiso` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

--
-- Volcado de datos para la tabla `usuario_permiso`
--

INSERT INTO `usuario_permiso` (`idusuario_permiso`, `idusuario`, `idpermiso`) VALUES
(12, 7, 1),
(13, 7, 2),
(14, 7, 3),
(24, 3, 1),
(25, 3, 2),
(26, 3, 3),
(27, 3, 4),
(28, 3, 5),
(29, 3, 6),
(30, 3, 7),
(57, 1, 1),
(58, 1, 2),
(59, 1, 3),
(60, 1, 4),
(61, 1, 5),
(62, 1, 6),
(63, 1, 7),
(64, 9, 1),
(65, 9, 2),
(66, 9, 3),
(67, 9, 4),
(68, 9, 5),
(69, 9, 6),
(70, 9, 7),
(71, 10, 1),
(72, 10, 2),
(73, 10, 4),
(74, 10, 7),
(79, 11, 1),
(80, 11, 2),
(81, 11, 4),
(82, 11, 7);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `venta`
--

CREATE TABLE `venta` (
  `idventa` int(11) NOT NULL,
  `idcliente` int(11) NOT NULL,
  `idusuario` int(11) NOT NULL,
  `tipo_comprobante` varchar(20) NOT NULL,
  `serie_comprobante` varchar(7) DEFAULT NULL,
  `num_comprobante` varchar(10) NOT NULL,
  `fecha_hora` datetime NOT NULL,
  `impuesto` decimal(4,2) NOT NULL,
  `total_venta` decimal(11,2) NOT NULL,
  `estado` varchar(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

--
-- Volcado de datos para la tabla `venta`
--

INSERT INTO `venta` (`idventa`, `idcliente`, `idusuario`, `tipo_comprobante`, `serie_comprobante`, `num_comprobante`, `fecha_hora`, `impuesto`, `total_venta`, `estado`) VALUES
(1, 5, 3, 'Boleta', '0001', '00001111|', '2019-01-23 00:00:00', 0.00, 40.00, 'Aceptado'),
(2, 5, 3, 'Boleta', '555', '5555', '2019-01-26 00:00:00', 0.00, 400.00, 'Aceptado'),
(3, 5, 3, 'Boleta', '0001', '000022222', '2019-02-08 00:00:00', 0.00, 190.00, 'Aceptado'),
(4, 5, 3, 'Factura', '0002', '00004444', '2019-02-12 00:00:00', 18.00, 620.00, 'Aceptado'),
(5, 5, 3, 'Factura', '0008', '000011111', '2019-02-14 00:00:00', 18.00, 300.00, 'Aceptado'),
(6, 5, 1, 'Boleta', '0001', '00022222', '2019-05-22 00:00:00', 0.00, 620.00, 'Aceptado'),
(7, 9, 1, 'Factura', '0001', '000021245', '2026-09-06 00:00:00', 21.00, 29000.00, 'Aceptado'),
(8, 9, 10, 'Ticket', '0001', '2225147', '2026-09-06 00:00:00', 21.00, 250000.00, 'Aceptado'),
(9, 9, 10, 'Boleta', '0001', '2215475', '2026-09-06 00:00:00', 21.00, 28000.00, 'Aceptado'),
(10, 5, 10, 'Factura', '0001', '00001245', '2026-09-06 00:00:00', 21.00, 980000.00, 'Aceptado'),
(11, 10, 11, 'Factura', '0001', '00002145', '2026-09-07 00:00:00', 21.00, 1450000.00, 'Aceptado'),
(12, 9, 11, 'Ticket', '0004', '000124578', '2026-09-07 00:00:00', 21.00, 10000.00, 'Aceptado');

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `articulo`
--
ALTER TABLE `articulo`
  ADD PRIMARY KEY (`idarticulo`),
  ADD UNIQUE KEY `nombre_UNIQUE` (`nombre`),
  ADD KEY `fk_articulo_categoria_idx` (`idcategoria`),
  ADD KEY `fk_articulo_marca_idx` (`idmarca`);

--
-- Indices de la tabla `categoria`
--
ALTER TABLE `categoria`
  ADD PRIMARY KEY (`idcategoria`),
  ADD UNIQUE KEY `nombre_UNIQUE` (`nombre`);

--
-- Indices de la tabla `detalle_ingreso`
--
ALTER TABLE `detalle_ingreso`
  ADD PRIMARY KEY (`iddetalle_ingreso`),
  ADD KEY `fk_detalle_ingreso_ingreso_idx` (`idingreso`),
  ADD KEY `fk_detalle_ingreso_articulo_idx` (`idarticulo`);

--
-- Indices de la tabla `detalle_venta`
--
ALTER TABLE `detalle_venta`
  ADD PRIMARY KEY (`iddetalle_venta`),
  ADD KEY `fk_detalle_venta_venta_idx` (`idventa`),
  ADD KEY `fk_detalle_venta_articulo_idx` (`idarticulo`);

--
-- Indices de la tabla `ingreso`
--
ALTER TABLE `ingreso`
  ADD PRIMARY KEY (`idingreso`),
  ADD KEY `fk_ingreso_persona_idx` (`idproveedor`),
  ADD KEY `fk_ingreso_usuario_idx` (`idusuario`);

--
-- Indices de la tabla `marca`
--
ALTER TABLE `marca`
  ADD PRIMARY KEY (`idmarca`),
  ADD UNIQUE KEY `nombre_UNIQUE` (`nombre`);

--
-- Indices de la tabla `permiso`
--
ALTER TABLE `permiso`
  ADD PRIMARY KEY (`idpermiso`);

--
-- Indices de la tabla `persona`
--
ALTER TABLE `persona`
  ADD PRIMARY KEY (`idpersona`);

--
-- Indices de la tabla `usuario`
--
ALTER TABLE `usuario`
  ADD PRIMARY KEY (`idusuario`),
  ADD UNIQUE KEY `login_UNIQUE` (`login`);

--
-- Indices de la tabla `usuario_permiso`
--
ALTER TABLE `usuario_permiso`
  ADD PRIMARY KEY (`idusuario_permiso`),
  ADD KEY `fk_usuario_permiso_permiso_idx` (`idpermiso`),
  ADD KEY `fk_usuario_permiso_usuario_idx` (`idusuario`);

--
-- Indices de la tabla `venta`
--
ALTER TABLE `venta`
  ADD PRIMARY KEY (`idventa`),
  ADD KEY `fk_venta_persona_idx` (`idcliente`),
  ADD KEY `fk_venta_usuario_idx` (`idusuario`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `articulo`
--
ALTER TABLE `articulo`
  MODIFY `idarticulo` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT de la tabla `categoria`
--
ALTER TABLE `categoria`
  MODIFY `idcategoria` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT de la tabla `detalle_ingreso`
--
ALTER TABLE `detalle_ingreso`
  MODIFY `iddetalle_ingreso` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT de la tabla `detalle_venta`
--
ALTER TABLE `detalle_venta`
  MODIFY `iddetalle_venta` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT de la tabla `ingreso`
--
ALTER TABLE `ingreso`
  MODIFY `idingreso` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT de la tabla `marca`
--
ALTER TABLE `marca`
  MODIFY `idmarca` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT de la tabla `permiso`
--
ALTER TABLE `permiso`
  MODIFY `idpermiso` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT de la tabla `persona`
--
ALTER TABLE `persona`
  MODIFY `idpersona` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT de la tabla `usuario`
--
ALTER TABLE `usuario`
  MODIFY `idusuario` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT de la tabla `usuario_permiso`
--
ALTER TABLE `usuario_permiso`
  MODIFY `idusuario_permiso` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=83;

--
-- AUTO_INCREMENT de la tabla `venta`
--
ALTER TABLE `venta`
  MODIFY `idventa` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `articulo`
--
ALTER TABLE `articulo`
  ADD CONSTRAINT `fk_articulo_categoria` FOREIGN KEY (`idcategoria`) REFERENCES `categoria` (`idcategoria`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  ADD CONSTRAINT `fk_articulo_marca` FOREIGN KEY (`idmarca`) REFERENCES `marca` (`idmarca`) ON DELETE NO ACTION ON UPDATE NO ACTION;

--
-- Filtros para la tabla `detalle_ingreso`
--
ALTER TABLE `detalle_ingreso`
  ADD CONSTRAINT `fk_detalle_ingreso_articulo` FOREIGN KEY (`idarticulo`) REFERENCES `articulo` (`idarticulo`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  ADD CONSTRAINT `fk_detalle_ingreso_ingreso` FOREIGN KEY (`idingreso`) REFERENCES `ingreso` (`idingreso`) ON DELETE NO ACTION ON UPDATE NO ACTION;

--
-- Filtros para la tabla `detalle_venta`
--
ALTER TABLE `detalle_venta`
  ADD CONSTRAINT `fk_detalle_venta_articulo` FOREIGN KEY (`idarticulo`) REFERENCES `articulo` (`idarticulo`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  ADD CONSTRAINT `fk_detalle_venta_venta` FOREIGN KEY (`idventa`) REFERENCES `venta` (`idventa`) ON DELETE NO ACTION ON UPDATE NO ACTION;

--
-- Filtros para la tabla `ingreso`
--
ALTER TABLE `ingreso`
  ADD CONSTRAINT `fk_ingreso_persona` FOREIGN KEY (`idproveedor`) REFERENCES `persona` (`idpersona`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  ADD CONSTRAINT `fk_ingreso_usuario` FOREIGN KEY (`idusuario`) REFERENCES `usuario` (`idusuario`) ON DELETE NO ACTION ON UPDATE NO ACTION;

--
-- Filtros para la tabla `usuario_permiso`
--
ALTER TABLE `usuario_permiso`
  ADD CONSTRAINT `fk_usuario_permiso_permiso` FOREIGN KEY (`idpermiso`) REFERENCES `permiso` (`idpermiso`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  ADD CONSTRAINT `fk_usuario_permiso_usuario` FOREIGN KEY (`idusuario`) REFERENCES `usuario` (`idusuario`) ON DELETE NO ACTION ON UPDATE NO ACTION;

--
-- Filtros para la tabla `venta`
--
ALTER TABLE `venta`
  ADD CONSTRAINT `fk_venta_persona` FOREIGN KEY (`idcliente`) REFERENCES `persona` (`idpersona`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  ADD CONSTRAINT `fk_venta_usuario` FOREIGN KEY (`idusuario`) REFERENCES `usuario` (`idusuario`) ON DELETE NO ACTION ON UPDATE NO ACTION;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
