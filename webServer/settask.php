<?php

$servername = "localhost";
$username = "datacollector";
$password = "datacollector";
$dbname = "datacollector";

$conn = new mysqli($servername, $username, $password, $dbname);

$sample_id = $_POST['si'];
$temp = $_POST['tmp'];
$humidity = $_POST['hm'];
$pigment = $_POST['pi'];
$tweight = $_POST['wt'];

if ($conn->connect_error) {
    die("连接失败: " . $conn->connect_error);
}

$result = $conn->query('SELECT * FROM taskstatus') or die($conn->errno . ':' . $conn->error);
$rows = $result->fetch_row();

$current_status = $rows[0][0];

if ($current_status == 0) //free
{
    $conn->query('
    UPDATE taskstatus SET havetask=1 ,sample_id=' . $sample_id . ',
    temp="' . $temp . '", humidity="' . $humidity . '", pigment="' . $pigment . '", tweight="' . $tweight.'"');
    echo "1";
} else {
    echo "0";
}

$conn->close();
?>