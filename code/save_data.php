<?php
// the $_POST[] array will contain the passed in filename and data
// the directory "data" is writable by the server (chmod 777)
$filename = "data/".$_POST['filename'];
$data = $_POST['filedata'];
// write the file to disk
$ret = file_put_contents($filename, $data);
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
        RETURN CODE: <?php echo $ret === true ?>
    </body>
</html>
