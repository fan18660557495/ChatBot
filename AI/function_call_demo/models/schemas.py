# 从 pydantic 模块导入 BaseModel 和 Field 类，用于定义数据模型和字段
from pydantic import BaseModel, Field

# 定义一个名为 GetWeather 的类，继承自 BaseModel，用于获取指定城市的天气信息
class GetWeather(BaseModel):
    '''用于获取指定城市的天气信息'''

    # 定义一个字符串类型的字段 location，用于表示城市或地区名称
    # ... 表示该字段是必需的
    # description 为该字段提供描述信息，方便理解和使用
    location: str = Field(..., description="城市或地区名称, 如 北京、上海、深圳、朝阳区")

# 定义一个名为 GetPopulation 的类，继承自 BaseModel，用于获取指定城市的人口信息
class GetPopulation(BaseModel):
    '''用于获取指定城市的人口信息'''

    # 定义一个字符串类型的字段 location，用于表示城市或地区名称
    # ... 表示该字段是必需的
    # description 为该字段提供描述信息，方便理解和使用
    location: str = Field(..., description="城市或地区名称, 如 北京、上海、深圳、朝阳区")

# 定义一个名为 GetIncome 的类，继承自 BaseModel，用于获取指定企业的年收入
# 多参数的模型示例
class GetIncome(BaseModel):
    '''获取指定企业的年收入'''

    # 定义一个字符串类型的字段 company，用于表示企业名称
    # ... 表示该字段是必需的
    # description 为该字段提供描述信息，方便理解和使用
    company: str = Field(..., description="企业名称, 如 华为、腾讯、阿里巴巴、幸福无限有限公司")
    year: int = Field(..., description="年份, 如 2023、2022、2021、2020")

# 定义一个名为 CreateTextFile 的类，继承自 BaseModel，用于创建文本文件
class CreateTextFile(BaseModel):
    '''用于创建文本文件'''

    # 定义一个字符串类型的字段 content，用于表示文件内容
    # ... 表示该字段是必需的
    # description 为该字段提供描述信息，方便理解和使用
    content: str = Field(..., description="要写入文件的内容")