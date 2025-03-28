# -*- coding: utf-8 -*-
import configparser

# 初始化配置解析器对象
config = configparser.ConfigParser()
#获取ini文件数据
def getinivalue(section, *args):
    with open('config.ini', 'r', encoding='utf-8-sig') as f:
        config.read_file(f)
    #获取值
    array = []
    for arg in args:
        value = config.get(section, arg)
        array.append(str(value))
    return array

#将ini块转化为json
def getjson(section):
    with open('config.ini', 'r', encoding='utf-8-sig') as f:
        config.read_file(f)
    items = config[section]
    return dict(items)

#修改ini文件数据
def opinivalue(section, **kwargs):
    with open('config.ini', 'r', encoding='utf-8-sig') as f:
        config.read_file(f)
    for key, value in kwargs.items():
        if config.has_option(section, key):
            try:
                config.set(section, key, value)
            except Exception:
                pass
    config.write(open('config.ini', mode='w', encoding='utf-8-sig'))

