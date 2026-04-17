<?php
$config_name = $_GET['config_name'] ?? null;
$load_default = $_GET['load_default'] ?? null;

$database_url = getenv('DATABASE_URL');
if ($database_url) {
    $db_url = parse_url($database_url);
    $conn = pg_connect(sprintf(
        "host=%s port=%s dbname=%s user=%s password=%s sslmode=require",
        $db_url['host'], $db_url['port'],
        ltrim($db_url['path'], '/'),
        $db_url['user'], $db_url['pass']
    ));
} else {
    $conn = pg_connect("host=localhost dbname=rossspoon user=rossspoon");
}

if (!$conn) {
    header('Content-Type: application/json');
    echo json_encode(['error' => 'Database connection failed']);
    exit;
}

header('Content-Type: application/json');

// Load the default config
if ($load_default) {
    $result = pg_query($conn, 'SELECT * FROM session_configs WHERE is_default = TRUE LIMIT 1');
    $row = pg_fetch_assoc($result);
    echo $row ? json_encode($row) : json_encode(['error' => 'No default config set']);
    exit;
}

// List all configs if no name given
if (!$config_name) {
    $result = pg_query($conn, 'SELECT config_name, is_default, updated_at FROM session_configs ORDER BY updated_at DESC');
    $rows = pg_fetch_all($result) ?: [];
    echo json_encode($rows);
    exit;
}

// Load a specific config by name
$result = pg_query_params($conn,
    'SELECT * FROM session_configs WHERE config_name = $1',
    [$config_name]
);

$row = pg_fetch_assoc($result);
if ($row) {
    echo json_encode($row);
} else {
    http_response_code(404);
    echo json_encode(['error' => 'Config not found']);
}
