import sys
import os
import win32com.client
import requests
import time

baseWebUrl = "http://192.168.31.185:13500/"
speednum = ["7.14", "6.25", "5.00"]
outputPath = "C:\\Users\\root\\Desktop\\SPoutput\\"
dm = win32com.client.Dispatch('dm.dmsoft')
print(dm.SetPath("C:\\Users\\root\\Desktop"))
print(dm.ver())
Hwnd = dm.GetMousePointWindow()
sClass = dm.GetWindowClass(Hwnd)
print("Hwnd:" + str(Hwnd))
if sClass != "#32770":
    print('窗口无效')
    exit()
dm.SetWindowSize(Hwnd, 1024, 768)


def main(argv):
    if argv[1] == 'reset':
        print('reset...')
        post_method(baseWebUrl + "finishtask.php", "")
    while True:
        current_sample_id = ""
        current_temp = ""
        current_humidity = ""
        current_pigment = ""
        current_tweight = ""

        while True:
            task_content = post_method(baseWebUrl + "gettask.php", "")
            print(task_content)
            task_content_arr = task_content.split("|")
            current_sample_id = task_content_arr[1]
            current_temp = task_content_arr[2]
            current_humidity = task_content_arr[3]
            current_pigment = task_content_arr[4]
            current_tweight = task_content_arr[5]
            if int(task_content_arr[0]) == 1:
                break
            Delay(1000)
        print(
            "GOT TASK:" + current_sample_id + "|" + current_temp + "|" + current_humidity + "|" + current_pigment + "|" + current_tweight)
        scan_sample(current_sample_id, current_temp, current_humidity, current_pigment, current_tweight)
    pass


def get_file_list(path):
    return os.listdir(path)
    pass


def scan_sample(sampleID, tempt, humidity, pigment, tweight):
    for i in range(0, 3):
        change_scan_speed(i)
        Delay(150)
        for times in range(0, 1):
            speedstr = speednum[i]

            origin_file = get_file_list("C:\\Lumex\\SpectraLUMPro\\Results\\Spectra")

            click_pic("ANALYSE_PROJECT.bmp", 246, 32)
            Delay(500)
            click_pic("ANALYSE_PROJECT.bmp", 74, 60 + 29 * 1)
            Delay(500)
            click_pic("sample.bmp", 25, 28)
            Delay(500)
            for tmp in range(0, 10):
                dm.KeyPress(8)
                Delay(5)
                dm.KeyPress(46)
            Delay(500)
            dm.SetClipboard(str(sampleID) + "-" + speedstr + "-" + str(times))
            dm.KeyDown(17)
            Delay(100)
            dm.KeyPress(86)
            dm.KeyUp(17)

            Delay(500)
            click_pic("sample.bmp", 0, 0)
            Delay(1000)

            has_started = False
            while has_started == False:
                click_pic("start.bmp", 0, 0)
                Delay(1000)
                if "timeout" != wait_pic("stopmeasure.bmp", 10):
                    has_started = True
            Delay(1000)
            dm.MoveTo(20, 20)
            click_pic("savebtn.bmp", 0, 0)
            wait_pic("start.bmp", 1000)

            has_found_file = False
            while has_found_file == False:
                last_file = get_file_list("C:\\Lumex\\SpectraLUMPro\\Results\\Spectra")
                output_file_name_arr = list(set(last_file).difference(set(origin_file)))
                print(output_file_name_arr)
                if len(output_file_name_arr) > 0:
                    has_found_file = True
                    output_file_name = output_file_name_arr[0]
                    print("copied " + output_file_name)
                    file_content = dm.ReadFile("C:\\Lumex\\SpectraLUMPro\\Results\\Spectra\\" + output_file_name)
                    dm.CopyFile("C:\\Lumex\\SpectraLUMPro\\Results\\Spectra\\" + output_file_name,
                                outputPath + str(sampleID) + "-" + speedstr + "-" + str(times) + ".spa", 1)
                    submit_result(sampleID, speedstr, times, tempt, humidity, pigment, tweight,
                                  str(sampleID) + "-" + speedstr + "-" + str(times) + ".spa", file_content)
                Delay(150)
    post_method(baseWebUrl + "finishtask.php", "")
    pass


def change_scan_speed(nScanSpeed):
    click_pic("opt.bmp", 0, 0)

    click_pic("settings.bmp", 0, 0)
    click_pic("inssetting.bmp", 2, 2)
    setH = 0
    setX = setY = setR = setB = 0
    while setH == 0:
        setH = dm.FindWindow(0, "Settings. SpectraLUM/Pro v.4.01.461")
        ret, setX, setY, setR, setB = dm.GetClientRect(setH, setX, setY, setR, setB)
        Delay(100)
    dm.MoveTo(setX + 307, setY + 168)
    Delay(150)
    dm.LeftClick()
    Delay(150)
    dm.MoveTo(setX + 275, setY + 188 + 13 * nScanSpeed)
    Delay(150)
    dm.LeftClick()
    Delay(150)
    dm.MoveTo(setX + 561, setY + 545)
    Delay(150)
    dm.LeftClick()
    Delay(150)
    click_pic("inscali.bmp", 0, 0)
    pass


def post_method(post_url, data):
    r = requests.post(post_url, data=data)
    return r.text
    pass


def click_pic(picname, offx, offy):
    intX = -1
    intY = -1
    while intX < 0:
        ret, intX, intY = dm.FindPic(0, 0, 2000, 2000, picname, "000000", 0.9, 0, intX, intY)
    dm.MoveTo(intX + offx, intY + offy)
    Delay(100)
    dm.LeftClick()


def wait_pic(picname, outtime):
    intX = - 1
    intY = - 1
    time_count = 0
    while intX < 0 and time_count < outtime:
        ret, intX, intY = dm.FindPic(0, 0, 2000, 2000, picname, "000000", 0.9, 0, intX, intY)
        Delay(1000)
        time_count = time_count + 1
    if time_count >= outtime:
        return "timeout"
    return "find"


def submit_result(sample_id, scan_speed, result_index, temp, humidity, pigment, tweight, result_file,
                  result_file_content):
    data = {
        'si': sample_id,
        'ss': scan_speed,
        'ri': result_index,
        'tmp': temp,
        'hm': humidity,
        'pi': pigment,
        'wt': tweight,
        'rf': result_file,
        'rfc': result_file_content
    }
    ret = post_method(baseWebUrl + "submitresult.php", data)
    print("submit_ret:" + ret)
    return ret
    pass

    import time


def Delay(n):
    n = n / 100
    i = 0
    while i < n:
        i += 1
        time.sleep(0.1)


if __name__ == '__main__':
    main(sys.argv)
