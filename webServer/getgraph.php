<?php

$servername = "localhost";
$username = "datacollector";
$password = "datacollector";
$dbname = "datacollector";

$conn = new mysqli($servername, $username, $password, $dbname);

if ($conn->connect_error) {
    die("连接失败: " . $conn->connect_error);
}

$ids = $_POST['ids'];
if ($ids=='all'){
    $length = $_POST['ln'];
    $result = $conn->query('SELECT id, result_file, result_file_content FROM datalist ORDER BY id DESC LIMIT '.$length) or die($conn->errno . ':' . $conn->error);
}
else {
    $result = $conn->query('SELECT id, result_file, result_file_content FROM datalist WHERE id IN ' . $ids) or die($conn->errno . ':' . $conn->error);
}

$rows = $result->fetch_all();
echo json_encode($rows);
$conn->close();
?>