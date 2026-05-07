<?php
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

$result = pg_query($conn, 'DELETE FROM files');

header('Content-Type: application/json');
echo json_encode([
    'success' => $result !== false,
    'rows_deleted' => pg_affected_rows($result),
]);
