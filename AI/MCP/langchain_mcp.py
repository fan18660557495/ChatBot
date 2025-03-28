from langchain.tools import BaseTool
import requests

class TimeMCPServerTool(BaseTool):
    name = "time_mcp_server"
    description = "调用 Time MCP Server 获取当前时间"

    def _run(self, timezone: str = "UTC") -> str:
        url = "https://mcp-server.example.com/time"
        params = {"timezone": timezone}

        try:
            response = requests.get(url, params=params)
            if response.status_code == 200:
                data = response.json()
                return data.get("current_time", "时间信息未找到")
            else:
                return f"请求失败，状态码: {response.status_code}, 错误信息: {response.text}"
        except Exception as e:
            return f"请求异常: {str(e)}"

    async def _arun(self, timezone: str = "UTC") -> str:
        raise NotImplementedError("异步调用未实现")

# 在 LangChain 中使用工具
from langchain.agents import initialize_agent, Tool
from langchain.llms import OpenAI

# 初始化 LLM
llm = OpenAI(temperature=0)

# 创建工具实例
time_tool = TimeMCPServerTool()

# 定义工具列表
tools = [
    Tool(
        name="Time MCP Server",
        func=time_tool._run,
        description="调用 Time MCP Server 获取当前时间"
    )
]

# 初始化代理
agent = initialize_agent(tools, llm, agent="zero-shot-react-description", verbose=True)

# 运行代理
response = agent.run("获取上海的当前时间")
print(response)