<?php
// Control de acceso para los endpoints de administración (carpeta ajax/).
// Permisos válidos (se cargan en la sesión al iniciar sesión): escritorio, almacen,
// compras, ventas, acceso, consultac, consultav.

if (!function_exists('requerirPermiso')) {

	function responderErrorAcceso($codigo, $mensaje)
	{
		http_response_code($codigo);
		header('Content-Type: text/plain; charset=utf-8');
		echo $mensaje;
		exit;
	}

	// Exige sesión iniciada y, si se indican permisos, que el usuario tenga AL MENOS UNO.
	function requerirPermiso(...$permisos)
	{
		if (session_status() === PHP_SESSION_NONE) {
			session_start();
		}

		if (!isset($_SESSION['idusuario'])) {
			responderErrorAcceso(401, 'Sesión expirada. Volvé a iniciar sesión.');
		}

		if (count($permisos) === 0) {
			return;
		}

		foreach ($permisos as $permiso) {
			if (!empty($_SESSION[$permiso])) {
				return;
			}
		}

		responderErrorAcceso(403, 'No tenés permiso para realizar esta acción.');
	}
}
