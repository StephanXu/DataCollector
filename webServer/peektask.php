<?php

$servername = "localhost";
$username = "datacollector";
$password = "datacollector";
$dbname = "datacollector";

$conn = new mysqli($servername, $username, $password, $dbname);

if ($conn->connect_error) {
    die("连接失败: " . $conn->connect_error);
}
$result = $conn->query('SELECT * FROM taskstatus') or die($conn->errno . ':' . $conn->error);
$rows = $result->fetch_row();

$current_status = $rows[0];

echo $rows[0] . '|' . $rows[1] . '|' . $rows[2] . '|' . $rows[3] . '|' . $rows[4] . '|'.$rows[5];

$conn->close();
?>