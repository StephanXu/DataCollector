<?php

$servername = 'localhost';
$username = 'datacollector';
$password = 'datacollector';
$dbname = 'datacollector';

$conn = new mysqli($servername, $username, $password, $dbname);

$sample_id = $_POST['si'];
$scan_speed = $_POST['ss'];
$result_index = $_POST['ri'];
$temp = $_POST['tmp'];
$humidity = $_POST['hm'];
$pigment = $_POST['pi'];
$tweight = $_POST['wt'];
$result_file = $_POST['rf'];
$result_file_content = $_POST['rfc'];

$current_pigment='赤藓红';

if ($conn->connect_error) {
    die('连接失败: ' . $conn->connect_error);
}
$sql = 'INSERT INTO datalist 
        (sample_id, scan_speed, result_index, temp, humidity, pigment, tweight, pigment_collection, result_file, result_file_content) VALUES
        ("' . $sample_id . '","' . $scan_speed . '","' . $result_index . '","' . $temp . '","' . $humidity . '","' . $pigment . '","' . $tweight . '","'. $current_pigment . '","' . $result_file . '","' .  base64_encode($result_file_content) . '")';

$conn->query($sql) or die($conn->errno . ':' . $conn->error);

echo '1';

$conn->close();

?>
