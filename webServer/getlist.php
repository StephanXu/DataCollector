<?php

$servername = "localhost";
$username = "datacollector";
$password = "datacollector";
$dbname = "datacollector";

$conn = new mysqli($servername, $username, $password, $dbname);

if ($conn->connect_error) {
    die("连接失败: " . $conn->connect_error);
}

$special = $_POST['sp'];
$length = $_POST['ln'];

if ($special == 'all') {
    $result = $conn->query('SELECT id,sample_id,scan_speed,result_index,temp,humidity,pigment,tweight,pigment_collection,result_file,addtime FROM datalist ORDER BY id DESC LIMIT '.$length) or die($conn->errno . ':' . $conn->error);
} else {
    $result = $conn->query('SELECT id,sample_id,scan_speed,result_index,temp,humidity,pigment,tweight,pigment_collection,result_file,addtime FROM datalist WHERE id=' . $special) or die($conn->errno . ':' . $conn->error);
}

$rows = $result->fetch_all();
echo json_encode($rows);
$conn->close();
?>