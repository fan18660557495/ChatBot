from langchain.tools import Tool, StructuredTool
from langchain_ollama import OllamaLLM
from langchain.agents import initialize_agent, AgentType
from langchain.memory import ConversationBufferMemory
from langchain.callbacks.base import BaseCallbackHandler
from langchain.schema import AgentAction, AgentFinish, LLMResult
from typing import Dict, List, Any

from models.schemas import GetWeather, GetPopulation, GetIncome, CreateTextFile
from tools.info_tools import get_weather, get_population, get_income, create_text_file
from config.settings import OLLAMA_BASE_URL, OLLAMA_MODEL, OLLAMA_TEMPERATURE

def create_tools():
    """创建工具列表
    
    Returns:
        list: 包含天气查询、人口查询和企业收入查询三个工具的列表
    """
    # 创建一个名为 "GetWeather" 的工具实例，用于获取指定城市或地区的天气信息
    weather_tool = Tool(
        name="GetWeather",
        func=get_weather,
        args_schema=GetWeather,
        description="使用本工具获取指定城市或地区的天气信息."
    )

    # 创建一个名为 "GetPopulation" 的工具实例，用于获取指定城市或地区的人口信息
    population_tool = Tool(
        name="GetPopulation",
        func=get_population,
        args_schema=GetPopulation,
        description="使用本工具获取指定城市或地区的人口信息."
    )

    # 创建一个名为 "GetIncome" 的工具实例，用于获取指定企业的年收入
    income_tool = StructuredTool(
        name="GetIncome",
        func=get_income,
        args_schema=GetIncome,
        description="使用本工具获取指定企业的年收入."
    )

    # 创建一个名为 "CreateTextFile" 的工具实例，用于创建文本文件并写入内容
    text_file_tool = Tool(
        name="CreateTextFile",
        func=create_text_file,
        args_schema=CreateTextFile,
        description="使用本工具创建文本文件并写入内容."
    )

    return [weather_tool, population_tool, income_tool, text_file_tool]

def create_llm():
    """创建LLM实例
    
    Returns:
        OllamaLLM: 基于Ollama的大语言模型实例
    """
    return OllamaLLM(
        model=OLLAMA_MODEL,
        base_url=OLLAMA_BASE_URL,
        temperature=OLLAMA_TEMPERATURE
    )

class StreamingCallbackHandler(BaseCallbackHandler):
    """流式输出的回调处理器"""
    def __init__(self, on_new_token=None):
        self.on_new_token = on_new_token

    def on_llm_start(self, serialized: Dict[str, Any], prompts: List[str], **kwargs) -> None:
        """当LLM开始生成时调用"""
        if self.on_new_token:
            self.on_new_token({"type": "start", "data": "开始生成...\n"})

    def on_llm_new_token(self, token: str, **kwargs) -> None:
        """当LLM生成新token时调用"""
        if self.on_new_token:
            self.on_new_token({"type": "token", "data": token})

    def on_llm_end(self, response: LLMResult, **kwargs) -> None:
        """当LLM结束生成时调用"""
        if self.on_new_token:
            self.on_new_token({"type": "end", "data": "\n生成完成"})

    def on_tool_start(self, serialized: Dict[str, Any], input_str: str, **kwargs) -> None:
        """当工具开始执行时调用"""
        if self.on_new_token:
            self.on_new_token({"type": "tool_start", "data": f"\n使用工具: {serialized['name']}\n"})

    def on_agent_action(self, action: AgentAction, **kwargs) -> Any:
        """当智能体执行动作时调用"""
        if self.on_new_token:
            self.on_new_token({"type": "action", "data": f"\n执行动作: {action.log}\n"})

    def on_agent_finish(self, finish: AgentFinish, **kwargs) -> None:
        """当智能体完成时调用"""
        if self.on_new_token:
            self.on_new_token({"type": "finish", "data": f"\n完成: {finish.log}\n"})

def create_agent(tools, llm, memory=None):
    """创建Agent实例, 即智能体, 用于根据用户输入和可用工具与大语言模型交互
    
    Args:
        tools (list): 工具列表
        llm (BaseLLM): 大语言模型实例
        memory (ConversationBufferMemory, optional): 对话历史记忆对象
    
    Returns:
        AgentExecutor: 能够使用工具和对话的智能体实例
    """
    if memory is None:
        memory = ConversationBufferMemory()
    
    return initialize_agent(
        tools = tools,
        llm = llm,
        agent = AgentType.STRUCTURED_CHAT_ZERO_SHOT_REACT_DESCRIPTION,
        verbose = True,
        memory = memory
    )

def create_streaming_agent(tools, llm, callback_handler, memory=None):
    """创建支持流式输出的Agent实例
    
    Args:
        tools (list): 工具列表
        llm (BaseLLM): 大语言模型实例
        callback_handler (StreamingCallbackHandler): 流式输出的回调处理器
        memory (ConversationBufferMemory, optional): 对话历史记忆对象
    
    Returns:
        AgentExecutor: 支持流式输出的智能体实例
    """
    if memory is None:
        memory = ConversationBufferMemory()
        
    return initialize_agent(
        tools = tools,
        llm = llm,
        agent = AgentType.STRUCTURED_CHAT_ZERO_SHOT_REACT_DESCRIPTION,
        verbose = True,
        memory = memory,
        callbacks = [callback_handler]
    )