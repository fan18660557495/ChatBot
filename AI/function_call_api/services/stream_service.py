from typing import AsyncGenerator, Dict, Any
from langchain.schema import HumanMessage
from langchain.callbacks import AsyncIteratorCallbackHandler
from services.agent_service import create_streaming_agent
import json

async def create_stream_response(tools, llm, content: str) -> AsyncGenerator[str, None]:
    """创建流式响应
    
    Args:
        tools: 工具列表
        llm: 大语言模型实例
        content: 用户输入内容
    
    Returns:
        AsyncGenerator: 异步生成器，用于流式输出响应内容
    """
    callback = AsyncIteratorCallbackHandler()
    
    # 创建支持流式输出的智能体
    agent = create_streaming_agent(tools, llm, callback)
    
    try:
        # 异步生成响应
        task = agent.ainvoke({"input": content})
        
        async for token in callback.aiter():
            # 将token格式化为JSON字符串，以便前端正确解析
            if isinstance(token, dict):
                yield f"data: {json.dumps(token)}\n\n"
            else:
                yield f"data: {json.dumps({"type": "token", "data": token})}\n\n"
            
        # 等待任务完成
        await task
    except Exception as e:
        error_msg = {"type": "error", "data": str(e)}
        yield f"data: {json.dumps(error_msg)}\n\n"
    finally:
        callback.done.set()