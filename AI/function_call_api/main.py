import re
from fastapi import FastAPI, HTTPException, Depends
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from langchain.schema import HumanMessage
from services.agent_service import create_tools, create_llm, create_agent
from services.stream_service import create_stream_response
from services.session_service import session_manager

app = FastAPI(
    title="Function Call API",
    description="基于LangChain的智能对话API服务",
    version="1.0.0"
)

# 配置CORS中间件
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 允许所有源，生产环境建议设置具体的源
    allow_credentials=True,
    allow_methods=["*"],  # 允许所有HTTP方法
    allow_headers=["*"]   # 允许所有头部
)

class ChatRequest(BaseModel):
    content: str
    session_id: str

@app.post("/chat")
async def chat(request: ChatRequest):
    try:
        # 获取会话记忆
        memory = session_manager.get_memory(request.session_id)
        
        # 创建工具列表
        tools = create_tools()
        
        # 创建LLM实例
        llm = create_llm()
        
        # 创建Agent实例，并传入会话记忆
        agent = create_agent(tools, llm, memory)
        
        # 创建用户消息并处理
        message = HumanMessage(content=request.content)
        response = agent.invoke({"input": message.content})
        print("response", response)
        return {"response": response.get('output')}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# @app.post("/chat/stream")
# async def stream_chat(request: ChatRequest):
#     try:
#         # 获取会话记忆
#         memory = session_manager.get_memory(request.session_id)
        
#         # 创建工具列表
#         tools = create_tools()
        
#         # 创建LLM实例
#         llm = create_llm()
        
#         # 创建流式响应
#         return StreamingResponse(
#             create_stream_response(tools, llm, request.content, memory),
#             media_type="text/event-stream"
#         )
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)