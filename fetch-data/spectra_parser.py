# -*- coding: utf-8 -*-
from pandas import DataFrame
from typing import List
import requests


def __parse_dot(result_file_content):
    lines = result_file_content.split('\n')
    start_parse_flag = False
    points = []
    for line in lines:
        if line.strip() == 'DATA':
            start_parse_flag = True
            continue
        elif not start_parse_flag:
            continue
        if len(line.strip()) <= 0:
            continue
        tmp = line.split('\t')
        points.append((float(tmp[0]), float(tmp[1])))
    return points


def parse_spectra_results(result_list: List) -> DataFrame:
    for result in result_list:
        for x, y in __parse_dot(result['resultContent']):
            result[x] = y
        result.pop('resultContent')
    return DataFrame(result_list)


def fetch_results(url: str) -> DataFrame:
    response = requests.get(url)
    return parse_spectra_results(response.json())
