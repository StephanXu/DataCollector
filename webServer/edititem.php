<?php

$servername = "localhost";
$username = "datacollector";
$password = "datacollector";
$dbname = "datacollector";

$conn = new mysqli($servername, $username, $password, $dbname);

if ($conn->connect_error) {
    die("连接失败: " . $conn->connect_error);
}

$item_id = $_POST['iid'];
$sample_id = $_POST['si'];
$temp = $_POST['tmp'];
$humidity = $_POST['hm'];
$pigment = $_POST['pi'];
$tweight = $_POST['wt'];

$res = $conn->query('SELECT id FROM datalist');
$rows = $res->fetch_all();
if (count($rows) > 0) {
    $conn->query('
        UPDATE datalist SET sample_id=' . $sample_id . ', temp=' . $temp . ', 
        humidity=' . $humidity . ',pigment=' . $pigment . ', tweight=' . $tweight .
        ' WHERE id=' . $item_id);//mark doing flag
    echo '1';
} else {
    echo '0';
}
$conn->close();
?>