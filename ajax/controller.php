<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Manejar preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    exit(0);
}

// Configuración de la base de datos
class Database {
    private $host = 'localhost';
    private $db_name = 'dblanding';
    private $username = 'root';
    private $password = '';
    private $conn;

    public function getConnection() {
        $this->conn = null;
        try {
            $this->conn = new PDO("mysql:host=" . $this->host . ";dbname=" . $this->db_name . ";charset=utf8", 
                                $this->username, $this->password);
            $this->conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        } catch(PDOException $exception) {
            error_log("Error de conexión: " . $exception->getMessage());
        }
        return $this->conn;
    }
}

class ProductController {
    private $conn;
    private $table_products = 'productos';
    private $table_categories = 'categorias';

    public function __construct($db) {
        $this->conn = $db;
    }

    // Obtener todas las categorías
    public function getCategories() {
        try {
            $query = "SELECT id, nombre, descripcion FROM " . $this->table_categories . " WHERE activo = 1 ORDER BY nombre";
            $stmt = $this->conn->prepare($query);
            $stmt->execute();

            $categories = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            return [
                'success' => true,
                'data' => $categories,
                'message' => 'Categorías cargadas correctamente'
            ];
        } catch(Exception $e) {
            return [
                'success' => false,
                'message' => 'Error al cargar categorías: ' . $e->getMessage()
            ];
        }
    }

    // Obtener productos con filtros y paginación
    public function getProducts($filters = []) {
        try {
            $page = isset($filters['page']) ? (int)$filters['page'] : 1;
            $limit = isset($filters['limit']) ? (int)$filters['limit'] : 9;
            $offset = ($page - 1) * $limit;

            // Construir la consulta base
            $query = "SELECT p.*, c.nombre as categoria_nombre 
                     FROM " . $this->table_products . " p 
                     LEFT JOIN " . $this->table_categories . " c ON p.categoria_id = c.id 
                     WHERE p.activo = 1";
            
            $params = [];

            // Aplicar filtros
            if (!empty($filters['category_id'])) {
                $query .= " AND p.categoria_id = :category_id";
                $params['category_id'] = $filters['category_id'];
            }

            if (!empty($filters['search'])) {
                $query .= " AND (p.nombre LIKE :search OR p.descripcion LIKE :search)";
                $params['search'] = '%' . $filters['search'] . '%';
            }

            if (!empty($filters['price_range'])) {
                $priceRange = explode('-', $filters['price_range']);
                if (count($priceRange) == 2) {
                    if ($priceRange[1] === '+') {
                        $query .= " AND p.precio >= :min_price";
                        $params['min_price'] = (float)$priceRange[0];
                    } else {
                        $query .= " AND p.precio BETWEEN :min_price AND :max_price";
                        $params['min_price'] = (float)$priceRange[0];
                        $params['max_price'] = (float)$priceRange[1];
                    }
                }
            }

            // Aplicar ordenamiento
            if (!empty($filters['sort'])) {
                switch ($filters['sort']) {
                    case 'name_asc':
                        $query .= " ORDER BY p.nombre ASC";
                        break;
                    case 'name_desc':
                        $query .= " ORDER BY p.nombre DESC";
                        break;
                    case 'price_asc':
                        $query .= " ORDER BY p.precio ASC";
                        break;
                    case 'price_desc':
                        $query .= " ORDER BY p.precio DESC";
                        break;
                    default:
                        $query .= " ORDER BY p.id DESC";
                }
            } else {
                $query .= " ORDER BY p.id DESC";
            }

            // Contar total de productos (para paginación)
            $countQuery = str_replace("SELECT p.*, c.nombre as categoria_nombre", "SELECT COUNT(*)", $query);
            $countQuery = preg_replace('/ORDER BY.*/', '', $countQuery);
            
            $countStmt = $this->conn->prepare($countQuery);
            foreach ($params as $key => $value) {
                $countStmt->bindValue(":$key", $value);
            }
            $countStmt->execute();
            $totalProducts = $countStmt->fetchColumn();
            $totalPages = ceil($totalProducts / $limit);

            // Agregar límite y offset para paginación
            $query .= " LIMIT :offset, :limit";

            $stmt = $this->conn->prepare($query);
            
            // Bind parameters
            foreach ($params as $key => $value) {
                $stmt->bindValue(":$key", $value);
            }
            $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
            $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
            
            $stmt->execute();
            $products = $stmt->fetchAll(PDO::FETCH_ASSOC);

            // Formatear productos
            $formattedProducts = array_map(function($product) {
                return [
                    'id' => (int)$product['id'],
                    'nombre' => $product['nombre'],
                    'descripcion' => $product['descripcion'],
                    'precio' => (float)$product['precio'],
                    'stock' => (int)$product['stock'],
                    'imagen' => $product['imagen'] ?? null,
                    'categoria_id' => (int)$product['categoria_id'],
                    'categoria_nombre' => $product['categoria_nombre'],
                    'created_at' => $product['created_at']
                ];
            }, $products);

            return [
                'success' => true,
                'data' => $formattedProducts,
                'pagination' => [
                    'current_page' => $page,
                    'total_pages' => $totalPages,
                    'total_products' => (int)$totalProducts,
                    'per_page' => $limit
                ],
                'message' => 'Productos cargados correctamente'
            ];

        } catch(Exception $e) {
            return [
                'success' => false,
                'message' => 'Error al cargar productos: ' . $e->getMessage()
            ];
        }
    }

    // Obtener un producto específico
    public function getProduct($id) {
        try {
            $query = "SELECT p.*, c.nombre as categoria_nombre 
                     FROM " . $this->table_products . " p 
                     LEFT JOIN " . $this->table_categories . " c ON p.categoria_id = c.id 
                     WHERE p.id = :id AND p.activo = 1";
            
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':id', $id, PDO::PARAM_INT);
            $stmt->execute();

            $product = $stmt->fetch(PDO::FETCH_ASSOC);

            if ($product) {
                $formattedProduct = [
                    'id' => (int)$product['id'],
                    'nombre' => $product['nombre'],
                    'descripcion' => $product['descripcion'],
                    'precio' => (float)$product['precio'],
                    'stock' => (int)$product['stock'],
                    'imagen' => $product['imagen'] ?? null,
                    'categoria_id' => (int)$product['categoria_id'],
                    'categoria_nombre' => $product['categoria_nombre'],
                    'created_at' => $product['created_at']
                ];

                return [
                    'success' => true,
                    'data' => $formattedProduct,
                    'message' => 'Producto encontrado'
                ];
            } else {
                return [
                    'success' => false,
                    'message' => 'Producto no encontrado'
                ];
            }

        } catch(Exception $e) {
            return [
                'success' => false,
                'message' => 'Error al obtener producto: ' . $e->getMessage()
            ];
        }
    }

    // Actualizar stock de producto
    public function updateStock($id, $quantity) {
        try {
            // Verificar stock actual
            $query = "SELECT stock FROM " . $this->table_products . " WHERE id = :id AND activo = 1";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':id', $id, PDO::PARAM_INT);
            $stmt->execute();
            
            $currentStock = $stmt->fetchColumn();
            
            if ($currentStock === false) {
                return [
                    'success' => false,
                    'message' => 'Producto no encontrado'
                ];
            }

            $newStock = $currentStock - $quantity;
            
            if ($newStock < 0) {
                return [
                    'success' => false,
                    'message' => 'Stock insuficiente. Stock disponible: ' . $currentStock
                ];
            }

            // Actualizar stock
            $updateQuery = "UPDATE " . $this->table_products . " SET stock = :stock WHERE id = :id";
            $updateStmt = $this->conn->prepare($updateQuery);
            $updateStmt->bindParam(':stock', $newStock, PDO::PARAM_INT);
            $updateStmt->bindParam(':id', $id, PDO::PARAM_INT);
            
            if ($updateStmt->execute()) {
                return [
                    'success' => true,
                    'data' => ['new_stock' => $newStock],
                    'message' => 'Stock actualizado correctamente'
                ];
            } else {
                return [
                    'success' => false,
                    'message' => 'Error al actualizar stock'
                ];
            }

        } catch(Exception $e) {
            return [
                'success' => false,
                'message' => 'Error al actualizar stock: ' . $e->getMessage()
            ];
        }
    }
}

// Manejo de las peticiones
try {
    $database = new Database();
    $db = $database->getConnection();

    if (!$db) {
        throw new Exception('No se pudo conectar a la base de datos');
    }

    $productController = new ProductController($db);
    $action = $_GET['action'] ?? $_POST['action'] ?? '';

    switch ($action) {
        case 'getCategories':
            $result = $productController->getCategories();
            break;

        case 'getProducts':
            $filters = [
                'page' => $_GET['page'] ?? 1,
                'limit' => $_GET['limit'] ?? 9,
                'category_id' => $_GET['category_id'] ?? '',
                'search' => $_GET['search'] ?? '',
                'price_range' => $_GET['price_range'] ?? '',
                'sort' => $_GET['sort'] ?? ''
            ];
            $result = $productController->getProducts($filters);
            break;

        case 'getProduct':
            $id = $_GET['id'] ?? 0;
            if (!$id) {
                throw new Exception('ID de producto requerido');
            }
            $result = $productController->getProduct($id);
            break;

        case 'updateStock':
            $id = $_POST['id'] ?? 0;
            $quantity = $_POST['quantity'] ?? 0;
            
            if (!$id || !$quantity) {
                throw new Exception('ID y cantidad son requeridos');
            }
            
            $result = $productController->updateStock($id, $quantity);
            break;

        default:
            throw new Exception('Acción no válida');
    }

    echo json_encode($result, JSON_UNESCAPED_UNICODE);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Error del servidor: ' . $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
}
?>