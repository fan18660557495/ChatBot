# 定义工具函数，用于获取指定城市的天气信息
def get_weather(location: str) -> str:
    # 这里只是简单模拟返回天气信息，实际应用中可替换为真实的天气查询逻辑
    print("get_weather 方法被调用")
    print("参数location:", location)
    if location == "北京":
        return f"{location} 的天气是多云."
    elif location == "上海":
        return f"{location} 的天气是阴."
    else:
        # 默认返回晴天
        return f"{location} 的天气是晴天."

# 定义工具函数，用于获取指定城市的人口信息
def get_population(location: str) -> str:
    # 这里只是简单模拟返回人口信息，实际应用中可替换为真实的人口查询逻辑
    print("get_population 方法被调用")
    print("参数location:", location)
    if location == "北京":
        return f"{location} 的人口为 20000000."
    elif location == "上海":
        return f"{location} 的人口为 15000000."
    else:
        return f"{location} 的人口为 1000000."

# 定义工具函数，用于获取指定企业的年收入
def get_income(company: str, year: int) -> str:
    # 这里只是简单模拟返回年收入，实际应用中可替换为真实的年收入查询逻辑
    print("get_income 方法被调用")
    print("参数company:", company, "参数year:", year)
    if company == "幸福无限有限公司":
        if year == 2023:
            return f"{company} 的年收入是 10000亿人民币."
        elif year == 2022:
            return f"{company} 的年收入是 20000亿人民币."
        return f"{company} 的年收入是 30000亿人民币."
    else:
        return f"{company} 的年收入是 20万人民币."

# 定义工具函数，用于创建文本文件并写入内容
def create_text_file(content: str) -> str:
    import os
    # 获取当前脚本所在目录的根目录
    root_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
    # 指定文件夹路径
    folder_path = os.path.join(root_dir, "output")
    # 确保文件夹存在
    if not os.path.exists(folder_path):
        os.makedirs(folder_path)
    
    # 生成文件名（使用时间戳避免重名）
    import time
    timestamp = int(time.time())
    file_name = f"output_{timestamp}.txt"
    file_path = os.path.join(folder_path, file_name)
    
    # 写入内容
    with open(file_path, "w", encoding="utf-8") as f:
        f.write(content)
    
    return f"文件已创建，路径为：{os.path.abspath(file_path)}"