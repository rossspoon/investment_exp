<?php
$config_name = $_GET['config_name'] ?? null;

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

if (!$config_name) {
    header('Content-Type: application/json');
    echo json_encode(['error' => 'No config name provided']);
    exit;
}

$result = pg_query_params($conn,
    'DELETE FROM session_configs WHERE config_name = $1',
    [$config_name]
);

header('Content-Type: application/json');
echo json_encode([
    'success' => $result !== false && pg_affected_rows($result) > 0,
    'config_name' => $config_name,
]);
