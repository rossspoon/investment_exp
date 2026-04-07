<?php
// Connect to Postgres
$db_url = parse_url(getenv('DATABASE_URL'));
$conn = pg_connect(sprintf(
    "host=%s port=%s dbname=%s user=%s password=%s sslmode=require",
    $db_url['host'], $db_url['port'],
    ltrim($db_url['path'], '/'),
    $db_url['user'], $db_url['pass']
));

// Query for all files
$result = pg_query($conn, 'SELECT filename, filedata FROM files ORDER BY created_at DESC');
$rows = pg_fetch_all($result);

if (!$rows) {
    die('No records found.');
}

// Create a temp file for the zip
$zipPath = tempnam(sys_get_temp_dir(), 'data_export_') . '.zip';
$zip = new ZipArchive();

if ($zip->open($zipPath, ZipArchive::CREATE) !== TRUE) {
    die('Could not create zip file.');
}

// Add each record as a file inside the zip
foreach ($rows as $row) {
    $zip->addFromString($row['filename'], $row['filedata']);
}

$zip->close();

// Send the zip to the browser as a download
header('Content-Type: application/zip');
header('Content-Disposition: attachment; filename="data_export.zip"');
header('Content-Length: ' . filesize($zipPath));

readfile($zipPath);

// Clean up the temp file
unlink($zipPath);
exit;
