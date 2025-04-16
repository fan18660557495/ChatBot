import React, { useState, useEffect } from 'react';
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
  max-width: 1060px;
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

  /* 表格样式 */
  .table-container {
    width: 100%;
    overflow-x: auto;
    margin: 4px 0;
    border-radius: 8px;
    border: 1px solid #E5E6E8;
  }

  table {
    width: 100%;
    min-width: 100%;
    border-collapse: separate;
    border-spacing: 0;
    border-radius: 8px;
    background: #FFFFFF;
  }

  th {
    background: #F7F8FA;
    color: #1D2129;
    font-weight: 500;
    text-align: left;
    padding: 12px 16px;
    border-right: 1px solid #E5E6E8;
    border-bottom: 1px solid #E5E6E8;
    white-space: nowrap;
  }

  td {
    padding: 12px 16px;
    border-right: 1px solid #E5E6E8;
    border-bottom: 1px solid #E5E6E8;
    color: #4E5969;
    text-align: left;
  }

  /* 移除最后一列的右边框 */
  th:last-child,
  td:last-child {
    border-right: none;
  }

  /* 移除最后一行的底部边框 */
  tr:last-child td {
    border-bottom: none;
  }

  /* 第一行的圆角 */
  tr:first-child th:first-child {
    border-top-left-radius: 8px;
  }

  tr:first-child th:last-child {
    border-top-right-radius: 8px;
  }

  /* 最后一行的圆角 */
  tr:last-child td:first-child {
    border-bottom-left-radius: 8px;
  }

  tr:last-child td:last-child {
    border-bottom-right-radius: 8px;
  }

  /* 数字和金额列右对齐 */
  td:is([data-type="number"], [data-type="currency"]),
  td:matches(:nth-last-child(1):where(:not([data-type="text"], [data-type="date"]))) {
    text-align: right;
  }

  /* 文本和日期列左对齐 */
  td:is([data-type="text"], [data-type="date"]) {
    text-align: left;
  }

  /* 表头可排序样式 */
  th {
    position: relative;
    cursor: pointer;
    user-select: none;
    white-space: nowrap;
    
    &:hover {
      background: #F2F3F5;
    }
  }

  /* 斑马纹 */
  tr:nth-child(even) {
    background: #F7F8FA;
  }

  tr:hover {
    background: #F2F3F5;
  }
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
  margin-top: 16px;
`;

const SuggestedQuestion = styled.div`
  padding: 8px 12px;
  background: #F2F6FF;
  border-radius: 4px;
  color: #165DFF;
  font-size: 14px;
  cursor: pointer;
  transition: background 0.2s ease;
  
  &:hover {
    background: #E5EEFF;
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

const DataQueryChat: React.FC = () => {
  const { avatarUrl } = useUser();
  const { messages: contextMessages, sendMessage, isLoading, isPaused, pauseGeneration, resumeGeneration, updateDataQueryChatMessages } = useChat();
  const [inputValue, setInputValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const currentTime = getCurrentTime();
  
  // 初始化预设对话内容
  const [messages, setMessages] = useState(contextMessages.length > 0 ? contextMessages : [
    {
      id: '1',
      content: '我想查询财务数据',
      isUser: true,
      timestamp: currentTime,
      userName: '范米花儿'
    },
    {
      id: '2',
      content: '好的，我支持查询财务数据库里的所有数据内容，请告诉我你想查询的具体内容，例如：<br/>1.记账凭证 2.项目字典 3.科目字典 4.往来单位 5.科目余额表 6.报账单',
      isUser: false,
      timestamp: currentTime
    },
    {
      id: '3',
      content: '查询本月科研成本科目相关的凭证',
      isUser: true,
      timestamp: currentTime,
      userName: '范米花儿'
    },
    {
      id: '4',
      content: `
        本月(2025年03月)5011科研成本科目相关凭证有26张，以下是摘取的部分凭证流水：
        <div class="table-container">
        <table>
          <tr>
            <th>会计年度</th>
            <th>会计期间</th>
            <th>凭证编号</th>
            <th>摘要</th>
            <th>科目</th>
            <th>金额</th>
            <th>状态</th>
            <th>报账单编号</th>
            <th>报账时间</th>
          </tr>
          <tr>
            <td>2025</td>
            <td>02</td>
            <td>20250201</td>
            <td>差旅费报销</td>
            <td>501101</td>
            <td>1,200.00</td>
            <td>已审核</td>
            <td>BZ2025201</td>
            <td>2025/02/05</td>
          </tr>
          <tr>
            <td>2025</td>
            <td>02</td>
            <td>20250202</td>
            <td>办公用品采购</td>
            <td>501102</td>
            <td>800.00</td>
            <td>待审核</td>
            <td>BZ2025202</td>
            <td>2025/02/06</td>
          </tr>
          <tr>
            <td>2025</td>
            <td>02</td>
            <td>20250203</td>
            <td>市内交通费</td>
            <td>501103</td>
            <td>280.00</td>
            <td>已审核</td>
            <td>BZ2025203</td>
            <td>2025/02/07</td>
          </tr>
          <tr>
            <td>2025</td>
            <td>02</td>
            <td>20250204</td>
            <td>会议费用</td>
            <td>501104</td>
            <td>1,500.00</td>
            <td>已审核</td>
            <td>BZ2025204</td>
            <td>2025/02/08</td>
          </tr>
          <tr>
            <td>2025</td>
            <td>02</td>
            <td>20250205</td>
            <td>项目设备采购</td>
            <td>501105</td>
            <td>5,000.00</td>
            <td>待审核</td>
            <td>BZ2025205</td>
            <td>2025/02/09</td>
          </tr>
        </table>
        </div>
      `,
      isUser: false,
      timestamp: currentTime
    }
  ]);
  
  // 当消息更新时，同步到全局状态
  useEffect(() => {
    updateDataQueryChatMessages(messages);
  }, [messages, updateDataQueryChatMessages]);
  
  // 示例问题
  const suggestedQuestions = [
    "查询本月科研成本科目相关的凭证",
    "查询上个季度的销售收入",
    "查询2025年第一季度的费用支出",
    "查询本年度所有报销单据",
    "查询近三个月的项目收支情况"
  ];

  const handleSendMessage = (content: string) => {
    if (content.trim() === "") return;
    
    const userMessage = {
      id: Date.now().toString(),
      content,
      isUser: true,
      timestamp: getCurrentTime(),
      userName: "范米花儿"
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputValue("");
    
    // 处理预设的对话内容
    setTimeout(() => {
      if (content.includes("我想查询财务数据")) {
        const aiResponse = {
          id: Date.now().toString(),
          content: "好的，我支持查询财务数据库里的所有数据内容，请告诉我你想查询的具体内容，例如：<br/>1.记账凭证 2.项目字典 3.科目字典 4.往来单位 5.科目余额表 6.报账单",
          isUser: false,
          timestamp: getCurrentTime()
        };
        setMessages(prev => [...prev, aiResponse]);
      } else if (content.includes("查询本月科研成本科目相关的凭证")) {
        const tableContent = `
          本月(2025年03月)5011科研成本科目相关凭证有26张，以下是摘取的部分凭证流水：
          <div class="table-container">
          <table>
            <tr>
              <th>会计年度</th>
              <th>会计期间</th>
              <th>凭证编号</th>
              <th>摘要</th>
              <th>科目</th>
              <th>金额</th>
              <th>状态</th>
              <th>报账单编号</th>
              <th>报账时间</th>
            </tr>
            <tr>
              <td>2025</td>
              <td>02</td>
              <td>20250201</td>
              <td>差旅费报销</td>
              <td>501101</td>
              <td>1,200.00</td>
              <td>已审核</td>
              <td>BZ2025201</td>
              <td>2025/02/05</td>
            </tr>
            <tr>
              <td>2025</td>
              <td>02</td>
              <td>20250202</td>
              <td>办公用品采购</td>
              <td>501102</td>
              <td>800.00</td>
              <td>待审核</td>
              <td>BZ2025202</td>
              <td>2025/02/06</td>
            </tr>
            <tr>
              <td>2025</td>
              <td>02</td>
              <td>20250203</td>
              <td>市内交通费</td>
              <td>501103</td>
              <td>280.00</td>
              <td>已审核</td>
              <td>BZ2025203</td>
              <td>2025/02/07</td>
            </tr>
            <tr>
              <td>2025</td>
              <td>02</td>
              <td>20250204</td>
              <td>会议费用</td>
              <td>501104</td>
              <td>1,500.00</td>
              <td>取回</td>
              <td>BZ2025204</td>
              <td>2025/02/08</td>
            </tr>
            <tr>
              <td>2025</td>
              <td>02</td>
              <td>20250205</td>
              <td>项目设备采购</td>
              <td>501105</td>
              <td>5,000.00</td>
              <td>待审核</td>
              <td>BZ2025205</td>
              <td>2025/02/09</td>
            </tr>
          </table>
        `;
        
        const aiResponse = {
          id: Date.now().toString(),
          content: tableContent,
          isUser: false,
          timestamp: getCurrentTime()
        };
        setMessages(prev => [...prev, aiResponse]);
      } else {
        const aiResponse = {
          id: Date.now().toString(),
          content: "抱歉，我暂时无法理解您的查询内容。请尝试使用更具体的查询条件，例如：<br/>1. 查询某个时间段的凭证<br/>2. 查询特定科目的余额<br/>3. 查询具体项目的收支情况",
          isUser: false,
          timestamp: getCurrentTime()
        };
        setMessages(prev => [...prev, aiResponse]);
      
      }
    }, 500);
  };

  // 添加初始欢迎消息状态
  const [showWelcomeMessage, setShowWelcomeMessage] = useState(true);
  
  useEffect(() => {
    // 组件加载时显示欢迎消息
    if (showWelcomeMessage) {
      setShowWelcomeMessage(false);
    }
  }, []);

  const handleSuggestedQuestionClick = (question: string) => {
    handleSendMessage(question);
  };

  return (
    <ChatAreaContainer>
      <Header>
        <HeaderWrapper>
          <HeaderTitle>
            与智能问数智能体的对话
          </HeaderTitle>
        </HeaderWrapper>
      </Header>
      
      <ContentWrapper>
        <ChatMessages>
          {/* 消息列表 */}
          
          {/* 消息列表 */}
          {messages.map((message) => (
            <MessageContainer key={message.id} isUser={message.isUser}>
              {message.isUser ? (
                <>
                  <MessageContent isUser>
                    <MessageHeader color="#86909C">
                      {message.userName || "我"} {message.timestamp}
                    </MessageHeader>
                    <MessageBubble isUser={true}>
                      {message.content}
                    </MessageBubble>
                  </MessageContent>
                  <MessageAvatar src={avatarUrl} alt="User" />
                </>
              ) : (
                <>
                  <MessageAvatar src={aiAgent1} alt="AI" />
                  <MessageContent>
                    <MessageHeader>
                      智能问数智能体 {message.timestamp}
                    </MessageHeader>
                    <MessageBubble isUser={false}>
                      <div dangerouslySetInnerHTML={{ __html: message.content }} />
                    </MessageBubble>
                  </MessageContent>
                </>
              )}
            </MessageContainer>
          ))}
        </ChatMessages>
        
        <InputAreaContainer>
          <InputContainer isFocused={isFocused}>
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder="请输入您想查询的财务数据内容..."
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage(inputValue);
                  setInputValue('');
                }
              }}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <SendButton 
                onClick={() => {
                  handleSendMessage(inputValue);
                  setInputValue('');
                }}
                disabled={isLoading || !inputValue.trim()}
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

export default DataQueryChat;