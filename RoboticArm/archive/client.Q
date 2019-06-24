[General]
SyntaxVersion=2
BeginHotkey=121
BeginHotkeyMod=0
PauseHotkey=0
PauseHotkeyMod=0
StopHotkey=123
StopHotkeyMod=0
RunOnce=1
EnableWindow=
MacroID=b84f3ed7-51e8-49a2-abcb-90355af45b4c
Description=样本采集客户端
Enable=1
AutoRun=0
[Repeat]
Type=0
Number=1
[SetupUI]
Type=2
QUI=
[Relative]
SetupOCXFile=
[Comment]

[Script]
Set dm = createobject("dm.dmsoft")
OutputDebugString dm.Ver()
dm.SetPath "C:\Users\root\Desktop"
outputPath = "C:\Users\root\Desktop\SPoutput\"

baseWebUrl = "http://192.168.31.185:13500/"

Dim speednum(3)
speednum(0) = "7.14"
speednum(1) = "6.25"
speednum(2) = "5.00"

Hwnd = Plugin.Window.MousePoint()
sClass = Plugin.Window.GetClass(Hwnd)
OutputDebugString "Hwnd:" & Hwnd
If sClass <> "#32770" Then 
	OutputDebugString "请将光标移至程序窗口左上角灰色部分"
	ExitScript 
End If
Call Plugin.Window.Size(Hwnd, 1024, 768)

Do

    current_sample_id = ""
    current_temp = ""
    current_humidity = ""
    current_pigment = ""
    current_tweight = ""
    Do
        task_content = post_method(baseWebUrl & "gettask.php", "")
        OutputDebugString task_content
        task_content_arr = split(task_content, "|")
        current_sample_id = task_content_arr(1)
        current_temp = task_content_arr(2)
        current_humidity = task_content_arr(3)
        current_pigment = task_content_arr(4)
        current_tweight = task_content_arr(5)
        If CLng(task_content_arr(0)) = 1 Then 
            Exit Do
        End If
        Delay 1000
    Loop
    OutputDebugString "GOT TASK:" & current_sample_id & "|" & current_temp & "|" & current_humidity & "|" & current_pigment & "|" & current_tweight

    scanSample current_sample_id, current_temp, current_humidity, current_pigment, current_tweight
Loop

Sub scanSample(sampleID, tempt, humidity, pigment, tweight)
    For i = 0 To 2 Step 1
        changeScanSpeed i
        Delay 150
        For times = 0 To 2 Step 1
            
            speedstr = speednum(i)
            
            originFile = Lib.文件.遍历指定目录下所有文件名("C:\Lumex\SpectraLUMPro\Results\Spectra")
        	
            click_pic "ANALYSE_PROJECT.bmp", 246, 32
            Delay 500
            click_pic "ANALYSE_PROJECT.bmp", 74, 60
            Delay 500
            click_pic "sample.bmp", 25, 28
            Delay 500
            For 20
                dm.KeyPress 8
                Delay 5
                dm.KeyPress 46
            Next
            Delay 500
            SayString CStr(SampleID) & "-" & speedstr & "-" & CStr(times)
            Delay 500
            click_pic "sample.bmp", 0, 0
            Delay 1000
            Rem restart
            click_pic "start.bmp", 0, 0
            Delay 1000
            If "timeout" = wait_pic("stopmeasure.bmp", 10) Then 
            	Goto restart
            End If
            Delay 1000
            dm.MoveTo 20, 20
            click_pic "savebtn.bmp", 0, 0
            wait_pic "start.bmp",1000
			
            lastFile = Lib.文件.遍历指定目录下所有文件名("C:\Lumex\SpectraLUMPro\Results\Spectra")

            For lastfilename = 0 To UBound(lastFile) Step 1
                foundflag = 0
                
                For i2 = 0 To UBound(originFile) Step 1
                    If lastFile(lastfilename) = originFile(i2) Then 
                        foundflag = 1
                    End If
                Next
                outputfilename = lastfile(lastfilename)
                If foundflag = 0 Then 
                    OutputDebugString "copied " & outputfilename
                    file_content = dm.ReadFile("C:\Lumex\SpectraLUMPro\Results\Spectra\" &  outputfilename)
                    dm.CopyFile "C:\Lumex\SpectraLUMPro\Results\Spectra\" &  outputfilename, outputPath & CStr(SampleID) & "-" & speedstr & "-" & CStr(times) & ".spa",1
                    submit_result sampleID, speedstr, times, tempt, humidity, pigment, tweight, CStr(SampleID) & "-" & speedstr & "-" & CStr(times) & ".spa", file_content
                    Exit For
                End If
            Next
            Delay 150
        Next
    Next
	post_method baseWebUrl & "finishtask.php", ""
	
End Sub
 
Sub changeScanSpeed(nScanSpeed)
    click_pic "opt.bmp", 0, 0
    click_pic "settings.bmp", 0, 0
    click_pic "inssetting.bmp", 2, 2
    setH = 0
    setX = 0 : setY = 0 : setR = 0 : setB = 0
    While (setH=0)
        setH = dm.FindWindow(0, "Settings. SpectraLUM/Pro v.4.01.461")
        Call dm.GetClientRect(setH, setX, setY, setR, setB)
        Delay 100
    Wend
    dm.MoveTo setX + 307, setY + 168
    Delay 150
    dm.LeftClick 
    Delay 150
    dm.MoveTo setX + 275, setY + 188+ 13 * nScanSpeed
    Delay 150
    dm.LeftClick 
    Delay 150
    dm.MoveTo setX + 561, setY + 545
    Delay 150
    dm.LeftClick 
    Delay 150
    click_pic "inscali.bmp", 0, 0
End Sub

Sub click_pic(picname,offx,offy)
    intX = -1
    intY = -1
    While (intX < 0)
        pic_ret = dm.FindPic(0, 0, 2000, 2000, picname, "000000", 0.9, 0, intX, intY)
    Wend

    dm.MoveTo intX+offx, intY+offy
    Delay 100
    dm.LeftClick 
End Sub

Function wait_pic(picname,outtime)
    intX = - 1 
    intY = - 1 
    timecount = 0
    While (intX < 0 and timecount < outtime)
        pic_ret = dm.FindPic(0, 0, 2000, 2000, picname, "000000", 0.9, 0, intX, intY)
    	Delay 1000
    	timecount = timecount + 1
    Wend
    If (timecount >= outtime) Then 
    	wait_pic = "timeout"
    	Exit Function
    End If
    wait_pic = "find"
    Exit Function
End Function

Function submit_result(sample_id, scan_speed, result_index, temp, humidity, pigment, tweight, result_file, result_file_content)
    str = "si=" & sample_id & "&ss=" & scan_speed & "&ri=" & result_index & "&tmp=" & temp & "&hm=" & humidity & "&pi=" & pigment & "&wt=" & tweight & "&rf=" & result_file & "&rfc=" & result_file_content
    ret = post_method(baseWebUrl & "submitresult.php", str)
    OutputDebugString "submit_ret:" & ret
    submit_result = ret
End Function

Function post_method(post_url, data)
    restext = ""
    URL = post_url //改成post提交数据的地址("?"前面的哪些)
    str=data
    Set http = CreateObject("WinHttp.WinHttpRequest.5.1")//创建XHR对象
    http.open "POST", url, false//改成POST方式提交
    http.setrequestheader "Content-Type", "application/x-www-form-urlencoded" //在header里设置提交提交的数据类型(post方式必须的)
    http.setrequestheader "Content-Length",len(str) //在header设置提交的数据的长度,其实就是字符串长度嘛(post方式必须的)
    http.send str //开始发送,提交的内容在这呢,..看到米...
    If Not isEmpty(http.responsetext) Then 
        restext = http.responsetext
    Else 
        restext = "error"
    End If
    post_method = restext
End Function

Sub OnScriptExit()
    post_method baseWebUrl & "finishtask.php", ""
End Sub

Sub OutputDebugString(str)
	TracePrint "[" & now() & "]:" & CStr(str)
End Sub