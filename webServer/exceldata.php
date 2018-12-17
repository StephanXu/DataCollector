<!DOCTYPE html>
<html>
<head>
</head>
<body>
<table>
    <thead>
        <tr>
            <th>记录ID</th>
            <th>样品ID</th>
            <th>扫描速率</th>
            <th>结果编号</th>
            <th>温度</th>
            <th>湿度</th>
            <th>色素质量</th>
            <th>总重</th>
            <th>结果文件</th>
            <th>生成时间</th>
            <th>文件内容</th>
        </tr>
    </thead>
    <tbody>
    <?php
        $servername = "localhost";
        $username = "datacollector";
        $password = "datacollector";
        $dbname = "datacollector";
        $conn = new mysqli($servername, $username, $password, $dbname);
        if ($conn->connect_error) {
            die("连接失败: " . $conn->connect_error);
        }
        $special = $_GET['sp'];
        if ($special == 'all') {
            $result = $conn->query('SELECT id,sample_id,scan_speed,result_index,temp,humidity,pigment,tweight,result_file,addtime,result_file_content FROM datalist') or die($conn->errno . ':' . $conn->error);
        } else {
            $result = $conn->query('SELECT id,sample_id,scan_speed,result_index,temp,humidity,pigment,tweight,result_file,addtime,result_file_content FROM datalist WHERE id=' . $special) or die($conn->errno . ':' . $conn->error);
        }
        $rows = $result->fetch_all();
        // echo json_encode($rows);
        foreach($rows as $item){
            echo '<tr>';
            foreach ($item as $block){
                echo '<td>'.$block.'</td>';
            }
            echo '</tr>';
        }
        $conn->close();
    ?>
    </tbody>
</table>

</body>
</html>