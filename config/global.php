<?php
// Configuración general. NO escribir credenciales acá.
// Los datos reales van en config/global.local.php (ignorado por git).
// Copiar config/global.local.example.php a config/global.local.php y completarlo.

$archivoLocal = __DIR__ . '/global.local.php';

if (!file_exists($archivoLocal)) {
	http_response_code(500);
	error_log('Falta config/global.local.php (copiar global.local.example.php y completar).');
	exit('Error de configuración del servidor.');
}

require_once $archivoLocal;

// Valores comunes (no sensibles) con valor por defecto
if (!defined('DB_PORT'))    define('DB_PORT', 3306);
if (!defined('DB_ENCODE'))  define('DB_ENCODE', 'utf8mb4');
if (!defined('PRO_NOMBRE')) define('PRO_NOMBRE', 'SkinKaro');
