import time


def delay(n):
    n = n / 100
    i = 0
    while i < n:
        i += 1
        time.sleep(0.1)
