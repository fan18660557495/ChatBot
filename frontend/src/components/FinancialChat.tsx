import React, { useEffect } from 'react';
import styled from 'styled-components';
import logo from "../assets/logo.png";
import aiAgent1 from '../assets/ai agent1.png';
import { useUser } from '../contexts/UserContext';
import { useChat } from '../contexts/ChatContext';
import { getCurrentTime } from "../utils/time";
import fileIconDoc from '../assets/file-icon-doc.svg';

const Icon = styled.i`
  font-size: 16px;
  line-height: 1;
`;

const ChatAreaContainer = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: #ffffff;
  position: relative;
  overflow: hidden;
  min-width: 375px;
`;

const ContentWrapper = styled.div`
  width: 100%;
  max-width: 1440px;
  margin: 0 auto;
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 0 120px 24px;
  gap: 24px;
  position: relative;

  @media (max-width: 1440px) {
    padding: 0 60px 24px;
  }

  @media (max-width: 768px) {
    padding: 0 16px 24px;
  }
`;

const Header = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #f2f3f5;
  background: #ffffff;
  z-index: 10;
`;

const HeaderWrapper = styled.div`
  width: 100%;
  max-width: 1440px;
  padding: 0 120px;
  display: flex;
  justify-content: center;

  @media (max-width: 1440px) {
    padding: 0 60px;
  }

  @media (max-width: 768px) {
    padding: 0 16px;
  }
`;

const HeaderTitle = styled.div`
  padding: 4px 8px;
  font-size: 16px;
  font-weight: 500;
  color: #1d2129;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  width: fit-content;
  text-align: center;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border-radius: 4px;
  transition: background-color 0.2s ease;
  margin: 0 auto;
`;

const ChatMessages = styled.div`
  flex: 1;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding-top: 96px;
  overflow-y: auto;
  overflow-x: hidden;
  position: relative;
  height: calc(100vh - 200px);

  /* 自定义滚动条样式 */
  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: #e5e6e8;
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: #c9cdd4;
  }
`;

const MessageContainer = styled.div<{ isUser?: boolean }>`
  display: flex;
  gap: 16px;
  align-self: ${(props) => (props.isUser ? "flex-end" : "flex-start")};
  padding-bottom: 32px;
  max-width: 100%;
  width: 100%;
  padding-right: 0;
  padding-left: ${(props) => (props.isUser ? "32px" : "0")};
  justify-content: ${(props) => (props.isUser ? "flex-end" : "flex-start")};
`;

const MessageAvatar = styled.img`
  width: ${(props) => props.width || "40px"};
  height: ${(props) => props.height || "40px"};
  border-radius: 50%;
  order: ${(props) => props.style?.order || 0};
`;

const MessageContent = styled.div<{ isUser?: boolean }>`
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: ${(props) => (props.isUser ? "flex-end" : "flex-start")};
  max-width: 860px;
  width: 100%;
  position: relative;
`;

const MessageHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  color: ${(props) => props.color || "#4E5969"};
  font-size: 12px;
`;

const MessageBubble = styled.div<{ isUser: boolean }>`
  padding: 12px 16px;
  background: ${(props) => (props.isUser ? "#165DFF" : "#FFFFFF")};
  color: ${(props) => (props.isUser ? "#FFFFFF" : "#1D2129")};
  border-radius: ${(props) =>
    props.isUser ? "8px 2px 8px 8px" : "2px 8px 8px 8px"};
  width: fit-content;
  max-width: 100%;
  word-wrap: break-word;
  line-height: 1.6;
  box-shadow: ${(props) =>
    props.isUser ? "none" : "0px 4px 12px rgba(29, 33, 41, 0.08)"};
  position: relative;
`;

const FileLink = styled.a`
  display: flex;
  align-items: center;
  gap: 8px;
  color: #165DFF;
  text-decoration: none;
  margin-top: 8px;
  
  &:hover {
    text-decoration: underline;
  }
`;

const FileIcon = styled.img`
  width: 16px;
  height: 16px;
`;

const SuggestedQuestions = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 8px;
`;

const SuggestedQuestion = styled.button`
  display: flex;
  align-items: center;
  justify-content: flex-start;
  padding: 9px 8px;
  border: 1px solid #F2F3F5;
  border-radius: 8px;
  cursor: pointer;
  width: fit-content;
  text-align: left;
  background: #FFFFFF;
  gap: 8px;

  &:hover {
    background: rgba(0, 0, 0, 0.04);
  }
`;

const InputAreaContainer = styled.div`
  width: 100%;
  max-width: 1440px;
  margin: 0 auto;
  margin-top: auto;
  flex-shrink: 0;
`;

const InputContainer = styled.div<{ isFocused: boolean }>`
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px;
  border: 1px solid ${(props) => (props.isFocused ? "#165DFF" : "#F2F3F5")};
  border-radius: 8px;
  background: #ffffff;
  transition: all 0.3s ease;

  &:hover {
    border-color: #165dff;
  }
`;

const Input = styled.textarea`
  flex: 1;
  border: none;
  outline: none;
  font-size: 14px;
  color: #1d2129;
  background: transparent;
  resize: none;
  height: 40px;
  min-height: 40px;
  max-height: 40px;
  line-height: 20px;
  padding: 0;
  overflow-y: auto;

  &::placeholder {
    color: #86909c;
  }

  /* 自定义滚动条样式 */
  &::-webkit-scrollbar {
    width: 4px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: #e5e6e8;
    border-radius: 2px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: #c9cdd4;
  }
`;

const SendButton = styled.button`
  width: 32px;
  height: 32px;
  display: flex;
  justify-content: center;
  align-items: center;
  background: ${(props) =>
    props.disabled ? "#94BFFF" : "#165DFF"};
  border: 1px solid
    ${(props) => (props.disabled ? "#6AA1FF" : "#165DFF")};
  border-radius: 4px;
  color: white;
  cursor: ${(props) => (props.disabled ? "not-allowed" : "pointer")};
  opacity: ${(props) => (props.disabled ? 0.5 : 1)};
  transition: all 0.2s ease;

  &:hover {
    background: ${(props) => (props.disabled ? "#94BFFF" : "#0E42D2")};
  }
`;

const FinancialChat: React.FC = () => {
  const { avatarUrl } = useUser();
  const currentTime = getCurrentTime();
  const [inputValue, setInputValue] = React.useState('');
  const [isFocused, setIsFocused] = React.useState(false);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);
  const chatMessagesRef = React.useRef<HTMLDivElement>(null);
  const { financialChatMessages, updateFinancialChatMessages } = useChat();
  const [messages, setMessages] = React.useState(financialChatMessages.length > 0 ? financialChatMessages : [
    {
      isUser: true,
      content: '员工出差后如何报销差旅费？',
      time: currentTime,
      username: '范米花儿'
    },
    {
      isUser: false,
      content: '根据公司财务制度，员工需在出差结束后7天内提交报销申请，附上发票、形成单等凭证，经部门负责人审批后交至财务部审核。',
      time: currentTime,
      username: '财务制度智能体',
      fileLink: '2025财务报销制度.docx',
      suggestedQuestions: [
        '部门预算超支如何处理？',
        '采购设备需要哪些审批流程？'
      ]
    },
    {
      isUser: true,
      content: '部门预算超支如何处理？',
      time: currentTime,
      username: '范米花儿'
    },
    {
      isUser: false,
      content: '若部门预算超支，需提交超支说明及调整申请，经财务部和上级领导审批后方可追加预算，否则超支部分由部门承担。',
      time: currentTime,
      username: '财务制度智能体',
      fileLink: '2025xx单位预算管理办法.docx'
    }
  ]);
  
  useEffect(() => {
    updateFinancialChatMessages(messages);
  }, [messages, updateFinancialChatMessages]);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    const userMessage = {
      isUser: true,
      content: inputValue,
      time: getCurrentTime(),
      username: '范米花儿'
    };

    setMessages([...messages, userMessage]);
    setInputValue('');
    scrollToBottom();

    // 模拟AI回复
    if (inputValue.trim() === '员工出差后如何报销差旅费？') {
      setTimeout(() => {
        const aiResponse = {
          isUser: false,
          content: '根据公司财务制度，员工需在出差结束后7天内提交报销申请，附上发票、形成单等凭证，经部门负责人审批后交至财务部审核。',
          time: getCurrentTime(),
          username: '财务制度智能体',
          fileLink: '2025财务报销制度.docx',
          suggestedQuestions: [
            '部门预算超支如何处理？',
            '采购设备需要哪些审批流程？'
          ]
        };
        setMessages(prev => [...prev, aiResponse]);
      }, 500);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSuggestedQuestionClick = (question: string) => {
    // 添加用户消息
    const userMessage = {
      isUser: true,
      content: question,
      time: getCurrentTime(),
      username: '范米花儿'
    };

    setMessages([...messages, userMessage]);

    // 模拟AI回复
    if (question === '部门预算超支如何处理？') {
      setTimeout(() => {
        const aiResponse = {
          isUser: false,
          content: '若部门预算超支，需提交超支说明及调整申请，经财务部和上级领导审批后方可追加预算，否则超支部分由部门承担。',
          time: getCurrentTime(),
          username: '财务制度智能体',
          fileLink: '2025xx单位预算管理办法.docx'
        };
        setMessages(prev => [...prev, aiResponse]);
      }, 500);
    }
  };

  return (
    <ChatAreaContainer>
      <Header>
        <HeaderWrapper>
          <HeaderTitle>
            与财务制度智能体的对话
          </HeaderTitle>
        </HeaderWrapper>
      </Header>
      <ContentWrapper>
        <ChatMessages
          ref={chatMessagesRef}
        >
          {messages.map((message, index) => (
            <React.Fragment key={index}>
              {message.isUser ? (
                <MessageContainer isUser={true}>
                  <MessageContent isUser={true}>
                    <MessageHeader color="#86909C">
                      {message.time} {message.username}
                    </MessageHeader>
                    <MessageBubble isUser={true}>
                      {message.content}
                    </MessageBubble>
                  </MessageContent>
                  <MessageAvatar src={avatarUrl} alt="User avatar" />
                </MessageContainer>
              ) : (
                <MessageContainer>
                  <MessageAvatar src={aiAgent1} alt="AI avatar" />
                  <MessageContent>
                    <MessageHeader>
                      {message.username} {message.time}
                    </MessageHeader>
                    <MessageBubble isUser={false}>
                      {message.content}
                      {message.fileLink && (
                        <FileLink href="#">
                          <FileIcon src={fileIconDoc} alt="Document" />
                          相关文件：{message.fileLink}
                        </FileLink>
                      )}
                    </MessageBubble>
                    {message.suggestedQuestions && (
                      <SuggestedQuestions>
                        {message.suggestedQuestions.map((question: string, qIndex: React.Key | null | undefined) => (
                          <SuggestedQuestion 
                            key={qIndex}
                            onClick={() => handleSuggestedQuestionClick(question)}
                          >
                            <span>🔍 {question}</span>
                            <Icon className="ri-arrow-right-s-line" />
                          </SuggestedQuestion>
                        ))}
          <div ref={messagesEndRef} />
                      </SuggestedQuestions>
                    )}
                  </MessageContent>
                </MessageContainer>
              )}
            </React.Fragment>
          ))}
          <div ref={messagesEndRef} />
        </ChatMessages>
        
        <InputAreaContainer>
          <InputContainer isFocused={isFocused}>
            <Input
              value={inputValue}
              onChange={handleInputChange}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              onKeyDown={handleKeyDown}
              placeholder="请输入您想查询的财务制度问题...">
            </Input>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <SendButton 
                onClick={handleSendMessage}
                disabled={!inputValue.trim()}
              >
                <Icon className="ri-send-plane-fill" />
              </SendButton>
            </div>
          </InputContainer>
        </InputAreaContainer>
      </ContentWrapper>
    </ChatAreaContainer>
  );
};

export default FinancialChat;