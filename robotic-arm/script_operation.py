from utils import delay
from absl import logging

import win32com.client


class ScriptOperation():
    def __init__(self, base_dir: str) -> None:
        self.dm = win32com.client.Dispatch('dm.dmsoft')
        self.hwnd = self.dm.GetMousePointWindow()
        self.dm.SetPath(base_dir)
        logging.info(f'Script plugin version: {self.dm.ver()}')
        logging.info(f'Base directory: {base_dir}')

    def click_pic(self, picname: str, offx: int, offy: int, post_delay: int = 500):
        intX = -1
        intY = -1
        while intX < 0:
            ret, intX, intY = self.dm.FindPic(
                0, 0, 2000, 2000, picname, "000000", 0.9, 0, intX, intY)
        self.dm.MoveTo(intX + offx, intY + offy)
        delay(100)
        self.dm.LeftClick()
        delay(post_delay)

    def wait_pic(self, picname: str, outtime: int):
        intX = - 1
        intY = - 1
        time_count = 0
        while intX < 0 and time_count < outtime:
            _, intX, intY = self.dm.FindPic(
                0, 0, 2000, 2000, picname, "000000", 0.9, 0, intX, intY)
            delay(1000)
            time_count = time_count + 1
        if time_count >= outtime:
            return 'timeout'
        return 'find'

    def keypress(self,
                 key: int,
                 repeat: int = 1,
                 repeat_delay: int = 5,
                 post_delay: int = 500):
        for _ in range(repeat):
            self.dm.KeyPress(key)
            delay(repeat_delay)
        delay(post_delay)

    def click(self, x: int, y: int, post_delay: int = 500):
        self.dm.MoveTo(x, y)
        delay(100)
        self.dm.LeftClick()
        delay(post_delay)

    def input_by_clipboard(self, text: str, post_delay: int = 500):
        self.dm.SetClipboard(text)
        self.dm.KeyDown(17)
        delay(100)
        self.dm.KeyPress(86)
        self.dm.KeyUp(17)
        delay(post_delay)
