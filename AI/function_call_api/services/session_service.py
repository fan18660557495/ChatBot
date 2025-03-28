from typing import Dict
from langchain.memory import ConversationBufferMemory

class SessionManager:
    def __init__(self):
        self._sessions: Dict[str, ConversationBufferMemory] = {}
    
    def get_memory(self, session_id: str) -> ConversationBufferMemory:
        """获取指定会话的记忆对象，如果不存在则创建新的
        
        Args:
            session_id: 会话ID
            
        Returns:
            ConversationBufferMemory: 会话记忆对象
        """
        if session_id not in self._sessions:
            self._sessions[session_id] = ConversationBufferMemory()
        return self._sessions[session_id]
    
    def clear_memory(self, session_id: str) -> None:
        """清除指定会话的记忆
        
        Args:
            session_id: 会话ID
        """
        if session_id in self._sessions:
            del self._sessions[session_id]

# 创建全局会话管理器实例
session_manager = SessionManager()