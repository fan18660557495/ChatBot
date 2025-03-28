import warnings
from langchain.schema import HumanMessage
from services.agent_service import create_tools, create_llm, create_agent

# 过滤功能废弃类型警告信息，主要目的是忽略LangChainDeprecationWarning警告信息
warnings.filterwarnings("ignore", category=DeprecationWarning)

def main():
    # 创建工具列表
    tools = create_tools()
    
    # 创建LLM实例
    llm = create_llm()
    
    # 创建Agent实例
    agent = create_agent(tools, llm)
    
    # 创建用户消息
    # 示例：
    # 1. 获取北京的天气？
    # 2. 北京的人口有多少？ 
    # 3. 幸福无限有限公司2023年的年收入是多少？
    # 复杂问题，尝试调用多个工具函数
    # 4. 将幸福无限有限公司2023年的年收入写入到一个文本中，并告诉我文件路径
    message = HumanMessage(content="将幸福无限有限公司2023年的年收入写入到一个文本中,并告诉我文件路径")
    
    # 处理用户请求
    response = agent.invoke({"input": message.content})
    
    # 打印结果
    print("用户问题:", message.content)
    print("模型回复:", response.get('output'))

if __name__ == "__main__":
    main()