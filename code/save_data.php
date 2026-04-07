/*
<?php
// the $_POST[] array will contain the passed in filename and data
// the directory "data" is writable by the server (chmod 777)
$filename = 'data/'.$_POST['filename'];
$data = $_POST['filedata'];
// write the file to disk
$ret = file_put_contents($filename, $data);
?>
*/

<?php
$filename = $_POST['filename'];
$data = $_POST['filedata'];

// Heroku automatically sets the DATABASE_URL environment variable
$db_url = parse_url(getenv('DATABASE_URL'));
$conn = pg_connect(sprintf(
    "host=%s port=%s dbname=%s user=%s password=%s sslmode=require",
    $db_url['host'], $db_url['port'],
    ltrim($db_url['path'], '/'),
    $db_url['user'], $db_url['pass']
));

$result = pg_query_params($conn,
    'INSERT INTO files (filename, filedata) VALUES ($1, $2)
     ON CONFLICT (filename) DO UPDATE SET filedata = $2',
    [$filename, $data]
);
?>

<!DOCTYPE html>
<html>
    <head>
        <title>PHP Test</title>
    </head>
    <body>
        <?php echo $filename ?>
        <p>
        <?php echo $data ?>
        <p>
        <? if ($result): ?>
        RETURN CODE: <?php echo $result  ?>
        <? else: ?>
        FAILED
        <? endif ?> 
        <p>
        <?php echo __DIR__ ?>
        <p>
    </body>
</html>
