<?php
// Copiar este archivo como config/global.local.php y completar con los datos reales.
// global.local.php NO se sube a git (está en .gitignore): se crea a mano en cada
// entorno (tu PC y el hosting de InfinityFree).

// --- Entorno local (XAMPP) ---
define('DB_HOST', 'localhost');
define('DB_NAME', 'skinkaro');
define('DB_USERNAME', 'root');
define('DB_PASSWORD', '');
define('DB_PORT', 3306);

// --- InfinityFree: usar los datos del panel (MySQL Databases) ---
// define('DB_HOST', 'sqlXXX.infinityfree.com');
// define('DB_NAME', 'if0_XXXXXXXX_nombrebase');
// define('DB_USERNAME', 'if0_XXXXXXXX');
// define('DB_PASSWORD', 'CONTRASEÑA_NUEVA');
