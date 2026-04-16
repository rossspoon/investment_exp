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
$result = pg_query($conn, 'SELECT filename, filedata, created_at FROM files ORDER BY created_at DESC');

$rows = pg_fetch_all($result);
?>

<!DOCTYPE html>
<html>
    <head>
        <title>All Data</title>
    </head>
    <body>
        <?php if ($rows): ?>
            <p><strong>Total records: <?php echo count($rows) ?></strong></p>
            <hr>
            <?php foreach ($rows as $row): ?>
                <p><strong>Filename:</strong> <?php echo htmlspecialchars($row['filename']) ?></p>
                <p><strong>Saved at:</strong> <?php echo $row['created_at'] ?></p>
                <p><strong>Data:</strong></p>
                <pre><?php echo htmlspecialchars($row['filedata']) ?></pre>
                <hr>
            <?php endforeach ?>
        <?php else: ?>
            <p>No records found.</p>
        <?php endif ?>
    </body>
</html>
