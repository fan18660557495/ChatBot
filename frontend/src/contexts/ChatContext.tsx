import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Message } from '../types';

interface ChatContextType {
  generalChatMessages: Message[];
  financialChatMessages: any[];
  dataQueryChatMessages: Message[];
  messages: Message[];
  isLoading: boolean;
  isPaused: boolean;
  updateGeneralChatMessages: (messages: Message[]) => void;
  updateFinancialChatMessages: (messages: any[]) => void;
  updateDataQueryChatMessages: (messages: Message[]) => void;
  sendMessage: (message: Message) => void;
  pauseGeneration: () => void;
  resumeGeneration: () => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const useChat = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};

interface ChatProviderProps {
  children: ReactNode;
}

export const ChatProvider: React.FC<ChatProviderProps> = ({ children }) => {
  // 从localStorage加载初始状态
  const [generalChatMessages, setGeneralChatMessages] = useState<Message[]>(() => {
    const savedMessages = localStorage.getItem('generalChatMessages');
    return savedMessages ? JSON.parse(savedMessages) : [];
  });

  const [financialChatMessages, setFinancialChatMessages] = useState<any[]>(() => {
    const savedMessages = localStorage.getItem('financialChatMessages');
    return savedMessages ? JSON.parse(savedMessages) : [];
  });

  const [dataQueryChatMessages, setDataQueryChatMessages] = useState<Message[]>(() => {
    const savedMessages = localStorage.getItem('dataQueryChatMessages');
    return savedMessages ? JSON.parse(savedMessages) : [];
  });

  // 聊天状态
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);

  // 当消息更新时保存到localStorage
  useEffect(() => {
    localStorage.setItem('generalChatMessages', JSON.stringify(generalChatMessages));
  }, [generalChatMessages]);

  useEffect(() => {
    localStorage.setItem('financialChatMessages', JSON.stringify(financialChatMessages));
  }, [financialChatMessages]);

  useEffect(() => {
    localStorage.setItem('dataQueryChatMessages', JSON.stringify(dataQueryChatMessages));
  }, [dataQueryChatMessages]);

  const updateGeneralChatMessages = (messages: Message[]) => {
    setGeneralChatMessages(messages);
  };

  const updateFinancialChatMessages = (messages: any[]) => {
    setFinancialChatMessages(messages);
  };

  const updateDataQueryChatMessages = (messages: Message[]) => {
    setDataQueryChatMessages(messages);
  };

  const sendMessage = (message: Message) => {
    setDataQueryChatMessages(prev => [...prev, message]);
    // 智能问数页面只返回写死的对话，不需要模拟AI回复
    setIsLoading(false);
  };

  const pauseGeneration = () => {
    setIsPaused(true);
    // 这里可以添加暂停生成的逻辑
  };

  const resumeGeneration = () => {
    setIsPaused(false);
    // 这里可以添加恢复生成的逻辑
  };

  return (
    <ChatContext.Provider value={{ 
      generalChatMessages, 
      financialChatMessages, 
      dataQueryChatMessages,
      messages: dataQueryChatMessages, // 为DataQueryChat组件提供messages属性
      isLoading,
      isPaused,
      updateGeneralChatMessages, 
      updateFinancialChatMessages,
      updateDataQueryChatMessages,
      sendMessage,
      pauseGeneration,
      resumeGeneration
    }}>
      {children}
    </ChatContext.Provider>
  );
};