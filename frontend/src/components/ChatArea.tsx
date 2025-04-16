import React, { useState, useRef, useEffect, JSX } from "react";
import styled, { createGlobalStyle } from "styled-components";
import logo from "../assets/logo.png";
import { useUser } from '../contexts/UserContext';
import { useChat } from '../contexts/ChatContext';
import { sendMessage, sendMessage2Server as sendMessageOllama } from "../services/deepseek";
import { checkConfig } from "../services/config";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { github } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import RenameModal from './RenameModal';
import fileIconPdf from '../assets/file-icon-pdf.svg';
import fileIconDoc from '../assets/file-icon-doc.svg';
import fileIconPpt from '../assets/file-icon-ppt.svg';
import fileIconCsv from '../assets/file-icon-csv.svg';
import fileIconImg from '../assets/file-icon-img.svg';
import { getCurrentTime } from "../utils/time";
import { Message, FileState } from "../types";
import TextInput from "./TextInput";
import { MessageBubble as MessageBubbleComponent } from "./MessageBubble";

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
  cursor: pointer;
  border-radius: 4px;
  transition: background-color 0.2s ease;
  margin: 0 auto;

  &:hover {
    background-color: #f7f8fa;
  }

  .edit-icon {
    opacity: 0;
    transition: opacity 0.2s ease;
  }

  &:hover .edit-icon {
    opacity: 1;
  }
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

const ThinkBlock = styled.div`
  background: #F2F6FF;
  padding: 12px 16px;
  color: #4E5969;
  font-size: 14px;
  line-height: 1.6;
  white-space: pre-line;
  word-wrap: break-word;
  width: 100%;
`;

const ThinkHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  user-select: none;
`;

const ThinkTitle = styled.div`
  color: #165dff;
  font-size: 14px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 4px;
`;

const ThinkContent = styled.div<{ isCollapsed: boolean }>`
  margin-top: ${(props) => (props.isCollapsed ? "0" : "8px")};
  height: ${(props) => (props.isCollapsed ? "0" : "auto")};
  overflow: hidden;
  transition: all 0.3s ease;
`;

const CollapseIcon = styled(Icon)<{ isCollapsed: boolean }>`
  transform: rotate(${(props) => (props.isCollapsed ? "180deg" : "0deg")});
  transition: transform 0.3s ease;
  color: #165dff;
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

  /* 内容容器 - 只针对 FormattedText 内容 */
  .formatted-text {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  /* 深度思考块样式 */
  ${ThinkBlock} {
    border-radius: 8px;
  }

  /* 段落样式 */
  p {
    margin: 0;
    white-space: pre-line;
  }

  /* 表格样式 */
  table {
    width: 100%;
    border-collapse: separate;
    border-spacing: 0;
    border-radius: 8px;
    overflow: hidden;
    margin: 4px 0;
    background: #FFFFFF;
    border: 1px solid #E5E6E8;
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

  /* 标题样式 */
  h1, h2, h3, h4, h5, h6 {
    margin: 12px 0 4px 0;
    font-weight: 600;
    &:first-child {
      margin-top: 0;
    }
  }

  /* 列表样式 */
  ul, ol {
    margin: 8px 0;
    padding-left: 20px;
    li {
      margin: 2px 0;
    }
  }

  /* 行内代码样式 */
  :not(pre) > code {
    background: #F2F3F5;
    padding: 2px 4px;
    border-radius: 4px;
    font-family: 'Fira Code', monospace;
    font-size: 0.9em;
    color: #1D2129;
  }

  /* 代码块样式 */
  pre {
    margin: 8px 0;
    padding: 0;
    background: #1E1E1E;
    border-radius: 8px;
    overflow: hidden;

    code {
      background: transparent;
      padding: 0;
      color: #d4d4d4;
      font-family: 'Fira Code', monospace;
      font-size: 14px;
      line-height: 1.5;
    }
  }
`;

const UserMessageBubble = styled(MessageBubble)`
  position: relative;

  &:hover .bubble-actions {
    opacity: 1;
  }
`;

const BubbleActions = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 4px;
  position: absolute;
  right: 0;
  bottom: -32px;
  opacity: 0;
  transition: opacity 0.2s ease;
  z-index: 1;
  padding: 4px;
  background: #ffffff;
  border-radius: 4px;

  &:hover {
    opacity: 1;
  }
`;

const MessageActions = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-top: 12px;
`;

const ActionGroup = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 4px;
`;

const ActionButton = styled.button`
  width: 24px;
  height: 24px;
  display: flex;
  justify-content: center;
  align-items: center;
  border: none;
  background: transparent;
  border-radius: 4px;
  color: #86909c;
  cursor: pointer;
  flex-shrink: 0;

  &:hover {
    background: rgba(0, 0, 0, 0.04);
    color: #1d2129;
  }

  i {
    font-size: 16px;
  }
`;

const SuggestedQuestions = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 16px;
  width: 239px;
`;

const QuestionButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 9px 8px;
  border: 1px solid #f2f3f5;
  border-radius: 8px;
  background: transparent;
  color: #1d2129;
  cursor: pointer;
  width: 100%;
  text-align: left;

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

const ActionBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 32px;
`;

const ActionButtons = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  height: 100%;
`;

const QuickActionButton = styled.button<{ isActive?: boolean }>`
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 5px 8px;
  border: 1px solid #f2f3f5;
  border-radius: 4px;
  background: ${(props) => (props.isActive ? "#F7F8FA" : "transparent")};
  color: #4e5969;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s ease;

  &:hover {
    background: #f7f8fa;
  }
`;

const SendButton = styled.button`
  width: 32px;
  height: 32px;
  display: flex;
  justify-content: center;
  align-items: center;
  background: ${(props) =>
    props.style?.opacity === 0.5 ? "#94BFFF" : "#165DFF"};
  border: 1px solid
    ${(props) => (props.style?.opacity === 0.5 ? "#6AA1FF" : "#165DFF")};
  border-radius: 4px;
  color: white;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${(props) =>
      props.style?.opacity === 0.5 ? "#94BFFF" : "#0E42D2"};
    border-color: ${(props) =>
      props.style?.opacity === 0.5 ? "#6AA1FF" : "#0E42D2"};
  }

  &:active {
    background: ${(props) =>
      props.style?.opacity === 0.5 ? "#94BFFF" : "#0E42D2"};
    border-color: ${(props) =>
      props.style?.opacity === 0.5 ? "#6AA1FF" : "#0E42D2"};
  }

  i {
    font-size: 16px;
  }
`;

const LoadingDots = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 4px;

  span {
    width: 4px;
    height: 4px;
    background-color: #165dff;
    border-radius: 50%;
    animation: bounce 1.4s infinite ease-in-out;

    &:nth-child(1) {
      animation-delay: -0.32s;
    }
    &:nth-child(2) {
      animation-delay: -0.16s;
    }
    &:nth-child(3) {
      animation-delay: 0s;
    }
  }

  @keyframes bounce {
    0%,
    80%,
    100% {
      transform: scale(0);
      opacity: 0.3;
    }
    40% {
      transform: scale(1);
      opacity: 1;
    }
  }
`;

const ScrollToBottomButton = styled.button<{ isVisible: boolean }>`
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  bottom: 180px;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #ffffff;
  border: 1px solid #e5e6e8;
  box-shadow: 0px 4px 12px rgba(29, 33, 41, 0.08);
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  opacity: ${props => props.isVisible ? 1 : 0};
  visibility: ${props => props.isVisible ? 'visible' : 'hidden'};
  transition: all 0.3s ease;
  z-index: 1000;

  &:hover {
    background: #f7f8fa;
    border-color: #165dff;
    color: #165dff;
  }

  i {
    font-size: 20px;
  }

  @media (max-width: 768px) {
    bottom: 160px;
  }
`;

const CodeWrapper = styled.div`
  background: #1e1e1e;
  border-radius: 8px;
  overflow: hidden;
  font-family: 'Fira Code', monospace;
  font-size: 14px;
  line-height: 1.5;
  width: 100%;
  border: 1px solid #2d2d2d;

  .code-content {
    overflow-x: auto;
    background: #1e1e1e;
    padding: 16px;

    /* 自定义滚动条样式 */
    &::-webkit-scrollbar {
      height: 8px;
    }

    &::-webkit-scrollbar-track {
      background: transparent;
    }

    &::-webkit-scrollbar-thumb {
      background: #4e5969;
      border-radius: 4px;
    }

    &::-webkit-scrollbar-thumb:hover {
      background: #86909c;
    }

    pre {
      margin: 0 !important;
      padding: 0 !important;
      background: transparent !important;
      font-family: 'Fira Code', monospace !important;
    }

    code {
      font-family: 'Fira Code', monospace !important;
      font-size: 14px !important;
      line-height: 1.5 !important;
      color: #d4d4d4 !important;
    }
  }
`;

const CodeHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 16px;
  background: #2d2d2d;
  border-bottom: 1px solid #3d3d3d;
  height: 36px;
`;

const CodeLanguage = styled.span`
  color: #86909c;
  font-size: 12px;
  font-weight: 500;
  text-transform: uppercase;
`;

const CopyButton = styled.button`
  background: transparent;
  border: none;
  color: #86909c;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 4px;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    color: #ffffff;
  }

  i {
    font-size: 14px;
  }
`;

const RemoveButton = styled.button`
  width: 14px;
  height: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: #1D2129;
  color: #FFFFFF;
  cursor: pointer;
  border-radius: 50%;
  position: absolute;
  top: 0;
  right: 0;
  z-index: 1;

  &:hover {
    background: #4E5969;
  }

  i {
    font-size: 10px;
  }
`;

const FilePreviewsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 8px;
  max-height: calc((40px + 24px + 16px) * 3 + 16px); // 3行文件的高度（文件高度+padding+gap）+ 底部间距
  overflow-y: auto;
  padding-right: 8px; // 为滚动条预留空间

  /* 自定义滚动条样式 */
  &::-webkit-scrollbar {
    width: 4px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: #E5E6E8;
    border-radius: 2px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: #C9CDD4;
  }
`;

const MessageFiles = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 8px;
  width: 100%;
  align-self: flex-end;
  max-width: 860px;
  justify-content: flex-end;
`;

const FilePreview = styled.div<{ status?: 'uploading' | 'success' | 'error', progress?: number }>`
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px;
  background: ${props => {
    if (props.status === 'uploading') {
      return `linear-gradient(to right, 
        #EBEDF0 0%, 
        #EBEDF0 ${props.progress}%, 
        #F7F8FA ${props.progress}%, 
        #F7F8FA 100%
      )`;
    }
    return '#F7F8FA';
  }};
  border-radius: 8px;
  border: 1px solid #E5E6E8;
  width: 230px;
  min-width: 230px;
  transition: background 0.3s ease;
  position: relative;
`;

const FileTitle = styled.div`
  font-size: 14px;
  color: #1D2129;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 20px;
`;

const FileContentWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  min-height: 40px;
`;

const FileIcon = styled.div<{ isImage?: boolean }>`
  width: 40px;
  height: 40px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border-radius: 4px;
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: ${props => props.isImage ? 'cover' : 'contain'};
  }
`;

const FileInfo = styled.div`
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 4px;
`;

const FileSize = styled.div`
  font-size: 12px;
  color: #86909C;
  display: flex;
  align-items: center;
  gap: 4px;
  line-height: 17px;

  &.error {
    color: #F53F3F;
  }

  .error-icon {
    color: #F53F3F;
    font-size: 14px;
  }
`;

const UploadStatus = styled.span<{ status: 'success' | 'error' | 'uploading' }>`
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 4px;
  
  ${props => {
    switch(props.status) {
      case 'success':
        return 'color: #00B42A;';
      case 'error':
        return 'color: #F53F3F;';
      case 'uploading':
        return 'color: #165DFF;';
      default:
        return 'color: #86909C;';
    }
  }}
`;

const GlobalStyle = createGlobalStyle`
  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }

  @keyframes slideIn {
    from {
      transform: translateY(-100%);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }

  @keyframes slideOut {
    from {
      transform: translateY(0);
      opacity: 1;
    }
    to {
      transform: translateY(-100%);
      opacity: 0;
    }
  }
`;

const ErrorToast = styled.div<{ isVisible: boolean }>`
  position: fixed;
  top: 16px;
  left: 50%;
  transform: translateX(-50%);
  background: #FEF2F2;
  border: 1px solid #FCA5A5;
  padding: 12px 16px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
  z-index: 1000;
  animation: ${props => props.isVisible ? 'slideIn' : 'slideOut'} 0.3s ease-in-out forwards;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);

  i {
    color: #DC2626;
    font-size: 16px;
  }

  span {
    color: #991B1B;
    font-size: 14px;
  }
`;

interface ChatAreaProps {
  conversationTitle: string;
  setConversationTitle: (title: string) => void;
}

interface CodeProps {
  node?: any;
  inline?: boolean;
  className?: string;
  children?: React.ReactNode;
  [key: string]: any;
}

interface FormattedTextProps {
  content: string;
}

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const Code: React.FC<CodeProps> = ({ inline, className, children, ...props }) => {
  // 检查是否是内联代码（没有语言标识）或者明确指定为内联
  if (inline || !className) {
    return (
      <code
        className={className}
        style={{
          background: '#F2F3F5',
          padding: '2px 4px',
          borderRadius: '4px',
          fontFamily: "'Fira Code', monospace",
          fontSize: '0.9em',
          color: '#1D2129'
        }}
        {...props}
      >
        {children}
      </code>
    );
  }

  // 对于代码块，使用完整的代码块样式
  const match = /language-(\w+)/.exec(className || '');
  const language = match ? match[1] : '';
  const code = String(children).replace(/\n$/, '');

  return (
    <CodeWrapper>
      <CodeHeader>
        <CodeLanguage>{language || 'plaintext'}</CodeLanguage>
        <CopyButton onClick={() => navigator.clipboard.writeText(code)}>
          <Icon className="ri-file-copy-line" />
          复制代码
        </CopyButton>
      </CodeHeader>
      <div className="code-content">
        <SyntaxHighlighter
          language={language || 'plaintext'}
          style={vscDarkPlus}
          customStyle={{
            margin: 0,
            padding: '16px',
            background: '#1e1e1e',
            fontSize: '14px',
            lineHeight: '1.5',
            fontFamily: "'Fira Code', monospace",
          }}
        >
          {code}
        </SyntaxHighlighter>
      </div>
    </CodeWrapper>
  );
};

const FormattedText: React.FC<FormattedTextProps> = ({ content }) => {
  const [collapsedStates, setCollapsedStates] = useState<{
    [key: string]: boolean;
  }>({});

  const toggleCollapse = (key: string) => {
    setCollapsedStates((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  if (content === "正在思考...") {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
        }}
      >
        正在思考
        <LoadingDots>
          <span></span>
          <span></span>
          <span></span>
        </LoadingDots>
      </div>
    );
  }

  // 检查是否包含深度思考的内容并提取
  const parts = content.split(/<think>|<\/think>/);
  if (parts.length > 1) {
    const result = [];
    let isThinking = false;

    for (let i = 0; i < parts.length; i++) {
      if (parts[i].trim()) {
        if (!isThinking) {
          // 普通内容
          result.push(
            <ReactMarkdown
              key={`text-${i}`}
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeRaw]}
              components={{
                code: Code
              }}
            >
              {parts[i]}
            </ReactMarkdown>
          );
        } else {
          // 深度思考内容
          result.push(
            <ThinkBlock key={`think-${i}`}>
              <ThinkHeader onClick={() => toggleCollapse(`thinking-${i}`)}>
                <ThinkTitle>
                  <Icon className="ri-lightbulb-line" style={{ marginRight: '4px' }} />
                  深度思考
                </ThinkTitle>
                <CollapseIcon 
                  className="ri-arrow-up-s-line" 
                  isCollapsed={collapsedStates[`thinking-${i}`]}
                />
              </ThinkHeader>
              <ThinkContent isCollapsed={collapsedStates[`thinking-${i}`]}>
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[rehypeRaw]}
                  components={{
                    code: Code
                  }}
                >
                  {parts[i]}
                </ReactMarkdown>
              </ThinkContent>
            </ThinkBlock>
          );
        }
      }
      isThinking = !isThinking;
    }

    return <>{result}</>;
  }

  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeRaw]}
      components={{
        code: Code
      }}
    >
      {content}
    </ReactMarkdown>
  );
};

const ChatArea: React.FC<ChatAreaProps> = ({ conversationTitle, setConversationTitle }): JSX.Element => {
  // 文件大小格式化函数
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const { generalChatMessages, updateGeneralChatMessages } = useChat();
  const [messages, setMessages] = useState<Message[]>(
    generalChatMessages.length > 0 
    ? generalChatMessages 
    : [
      {
        id: "1",
        content: "你好！我是 AI 助手，有什么我可以帮你的吗？",
        isUser: false,
        timestamp: getCurrentTime(),
      },
    ]
  );
  const [inputValue, setInputValue] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const { avatarUrl } = useUser();
  const [activeQuickAction, setActiveQuickAction] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [tempTitle, setTempTitle] = useState(conversationTitle);
  const [selectedFiles, setSelectedFiles] = useState<FileState[]>([]);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [showErrorToast, setShowErrorToast] = useState(false);

  const inputRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatMessagesRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const currentMessageRef = useRef<Message | null>(null);

  // 当消息更新时，同步到全局状态
  useEffect(() => {
    updateGeneralChatMessages(messages);
  }, [messages, updateGeneralChatMessages]);

  const handleTitleClick = () => {
    setTempTitle(conversationTitle);
    setIsEditingTitle(true);
  };

  const handleCloseModal = () => {
    setIsEditingTitle(false);
    setTempTitle(conversationTitle);
  };

  const handleTitleSubmit = () => {
    setConversationTitle(tempTitle);
    setIsEditingTitle(false);
  };

  const handleTitleChange = (value: string) => {
    setTempTitle(value);
  };

  const handleQuickAction = (action: string) => {
    setActiveQuickAction(activeQuickAction === action ? null : action);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length > 0) {
      // 只在尝试上传超过10个文件时显示错误提示
      if (selectedFiles.length + files.length > 10) {
        setShowErrorToast(true);
        setTimeout(() => setShowErrorToast(false), 3000);
        return;
      }

      // 处理有效的文件上传
      files.forEach(file => {
        let previewUrl;
        if (file.type.startsWith('image/')) {
          previewUrl = URL.createObjectURL(file);
        }
        
        const fileState: FileState = {
          id: Date.now() + '-' + Math.random().toString(36).substr(2, 9),
          name: file.name,
          type: file.type,
          size: file.size,
          lastModified: file.lastModified,
          progress: 0,
          status: 'uploading',
          sizeFormatted: formatFileSize(file.size),
          previewUrl: previewUrl,
        };
        
        setSelectedFiles(prev => [...prev, fileState]);
        
        let progress = 0;
        const interval = setInterval(() => {
          progress += 10;
          if (progress <= 100) {
            setSelectedFiles(prev => prev.map(f => {
              if (f.id === fileState.id) {
                return {
                  ...f,
                  progress,
                  status: progress === 100 ? 'success' : 'uploading'
                };
              }
              return f;
            }));
          } else {
            clearInterval(interval);
          }
        }, 300);
      });
    }
  };

  const handleRemoveFile = (fileId: string) => {
    setSelectedFiles(prev => {
      const file = prev.find(f => f.id === fileId);
      if (file?.previewUrl) {
        URL.revokeObjectURL(file.previewUrl);
      }
      return prev.filter(f => f.id !== fileId);
    });
  };

  const scrollToBottom = () => {
    if (chatMessagesRef.current) {
      chatMessagesRef.current.scrollTo({
        top: chatMessagesRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  };

  const handleSendMessage = async () => {
    if (inputValue.trim() || selectedFiles.length > 0) {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
        setIsLoading(false);
        setIsPaused(false);
      }

      const userMessage: Message = {
        id: Date.now().toString(),
        content: inputValue.trim(),
        files: selectedFiles,
        isUser: true,
        timestamp: getCurrentTime(),
        userName: "我",
      };

      // 如果是第一条用户消息，设置为对话标题
      const isFirstUserMessage = !messages.some(msg => msg.isUser);
      if (isFirstUserMessage) {
        // 如果只有文件没有文本，使用第一个文件名作为标题
        if (!inputValue.trim() && selectedFiles.length > 0) {
          setConversationTitle(selectedFiles[0].name);
        } else {
          // 如果有文本，使用文本作为标题（限制长度为20个字符）
          const titleText = inputValue.trim();
          setConversationTitle(titleText.length > 20 ? titleText.substring(0, 20) + '...' : titleText);
        }
      }

      setMessages(prev => [...prev, userMessage]);
      setInputValue("");
      setSelectedFiles([]);

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "正在思考...",
        isUser: false,
        timestamp: getCurrentTime(),
      };

      try {
        setMessages(prev => [...prev, aiMessage]);
        currentMessageRef.current = aiMessage;
        
        abortControllerRef.current = new AbortController();
        setIsLoading(true);
        
        // 构建发送给 AI 的消息内容
        let messageContent = inputValue.trim();
        if (selectedFiles.length > 0) {
          const filesInfo = selectedFiles.map(file => `${file.name} (${file.sizeFormatted})`).join('\n');
          messageContent = messageContent ? 
            `${messageContent}\n\n附件列表：\n${filesInfo}` : 
            `请查看以下文件：\n${filesInfo}`;
        }
        
        await sendMessageOllama(
          messageContent,
          (text) => {
            if (!isPaused) {
              setMessages(prev =>
                prev.map(msg =>
                  msg.id === aiMessage.id ? { ...msg, content: text } : msg
                )
              );
            }
          },
          process.env.REACT_APP_OLLAMA_STREAM_RESPONSE === "true",
          abortControllerRef.current
        );
      } catch (error) {
        console.error("Error:", error);
        if (error instanceof Error && error.name === 'AbortError') {
          return;
        }
        setMessages(prev =>
          prev.map(msg =>
            msg.id === aiMessage.id
              ? { ...msg, content: `错误信息: ${error instanceof Error ? error.message : "未知错误"}` }
              : msg
          )
        );
      } finally {
        if (!isPaused) {
          setIsLoading(false);
        }
        abortControllerRef.current = null;
        currentMessageRef.current = null;
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }
    }
  };

  const handlePauseGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsPaused(true);
      setIsLoading(true);
      setMessages(prev => {
        const lastMessage = prev[prev.length - 1];
        if (lastMessage && !lastMessage.isUser) {
          return prev.map(msg => 
            msg.id === lastMessage.id 
              ? { ...msg, content: msg.content + "\n\n[已暂停]" }
              : msg
          );
        }
        return prev;
      });
      setIsPaused(false);
    }
  };

  const handleResumeGeneration = async () => {
    if (currentMessageRef.current) {
      setIsPaused(false);
      setIsLoading(true);
      try {
        abortControllerRef.current = new AbortController();
        await sendMessageOllama(
          currentMessageRef.current.content,
          (text) => {
            if (!isPaused) {
              setMessages((prev) =>
                prev.map((msg) =>
                  msg.id === currentMessageRef.current?.id ? { ...msg, content: text } : msg
                )
              );
            }
          },
          process.env.REACT_APP_OLLAMA_STREAM_RESPONSE === "true",
          abortControllerRef.current
        );
      } catch (error) {
        console.error("Error resuming generation:", error);
      } finally {
        if (!isPaused) {
          setIsLoading(false);
        }
        abortControllerRef.current = null;
      }
    }
  };

  // 根据文件类型获取对应的图标
  const getFileIcon = (file: FileState | null | undefined) => {
    if (!file) return fileIconDoc;
    
    const fileName = file.name?.toLowerCase() || '';
    const fileType = file.type || '';
    
    if (fileType.toLowerCase().startsWith('image/')) {
      return fileIconImg;
    }
    
    if (fileType.toLowerCase() === 'application/pdf' || fileName.endsWith('.pdf')) {
      return fileIconPdf;
    }
    
    if (
      fileType.toLowerCase() === 'application/msword' || 
      fileType.toLowerCase() === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      /\.(doc|docx)$/i.test(fileName)
    ) {
      return fileIconDoc;
    }
    
    if (
      fileType.toLowerCase() === 'application/vnd.ms-excel' ||
      fileType.toLowerCase() === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
      fileType.toLowerCase() === 'text/csv' ||
      /\.(xls|xlsx|csv)$/i.test(fileName)
    ) {
      return fileIconCsv;
    }
    
    if (
      fileType.toLowerCase() === 'application/vnd.ms-powerpoint' ||
      fileType.toLowerCase() === 'application/vnd.openxmlformats-officedocument.presentationml.presentation' ||
      /\.(ppt|pptx)$/i.test(fileName)
    ) {
      return fileIconPpt;
    }
    
    return fileIconDoc;
  };

  return (
    <ChatAreaContainer>
      <GlobalStyle />
      {showErrorToast && (
        <ErrorToast isVisible={showErrorToast}>
          <Icon className="ri-error-warning-line" />
          <span>最多只能上传 10 个文件</span>
        </ErrorToast>
      )}
      <ContentWrapper>
        <Header>
          <HeaderWrapper>
            <HeaderTitle onClick={handleTitleClick}>
              {conversationTitle}
              <Icon className="ri-edit-line edit-icon" />
            </HeaderTitle>
          </HeaderWrapper>
        </Header>

        <RenameModal
          isOpen={isEditingTitle}
          title="修改对话标题"
          value={tempTitle}
          onClose={handleCloseModal}
          onSubmit={handleTitleSubmit}
          onChange={handleTitleChange}
          placeholder="请输入新的标题"
        />

        <ChatMessages ref={chatMessagesRef}>
          {messages.map((message) => (
            <MessageContainer key={message.id} isUser={message.isUser}>
              {message.isUser ? (
                <>
                  <MessageContent isUser>
                    <MessageHeader>
                      <span>{message.timestamp}</span>
                      <span>{message.userName}</span>
                    </MessageHeader>
                    {message.files && message.files.length > 0 && (
                      <MessageFiles>
                        {message.files.map(file => (
                          <FilePreview 
                            key={file.id}
                            status={file.status}
                            progress={file.progress}
                          >
                            <FileContentWrapper>
                              <FileIcon isImage={file.type ? file.type.toLowerCase().startsWith('image/') : false}>
                                {file.type && file.type.toLowerCase().startsWith('image/') && file.previewUrl ? (
                                  <img 
                                    src={file.previewUrl} 
                                    alt={file.name} 
                                  />
                                ) : (
                                  <img 
                                    src={getFileIcon(file)} 
                                    alt={file.name} 
                                  />
                                )}
                              </FileIcon>
                              <FileInfo>
                                <FileTitle>
                                  {file.name}
                                </FileTitle>
                                <FileSize>
                                  {file.sizeFormatted}
                                </FileSize>
                              </FileInfo>
                            </FileContentWrapper>
                          </FilePreview>
                        ))}
                      </MessageFiles>
                    )}
                    {message.content && (
                      <MessageBubble isUser>
                        <div className="formatted-text">
                          <FormattedText content={message.content} />
                        </div>
                        <BubbleActions className="bubble-actions">
                          <ActionButton>
                            <Icon className="ri-edit-line" />
                          </ActionButton>
                          <ActionButton>
                            <Icon className="ri-file-copy-line" />
                          </ActionButton>
                          <ActionButton>
                            <Icon className="ri-share-line" />
                          </ActionButton>
                          <ActionButton>
                            <Icon className="ri-more-line" />
                          </ActionButton>
                        </BubbleActions>
                      </MessageBubble>
                    )}
                  </MessageContent>
                  <MessageAvatar
                    src={avatarUrl}
                    alt="User avatar"
                    style={{ order: 2 }}
                  />
                </>
              ) : (
                <>
                  <MessageAvatar
                    src={logo}
                    alt="AI avatar"
                    width="24px"
                    height="24px"
                  />
                  <MessageContent>
                    <MessageHeader>
                      <span>AI Agent</span>
                      <span style={{ color: "#86909C" }}>
                        {message.timestamp}
                      </span>
                    </MessageHeader>
                    {message.content === "正在思考..." ? (
                      <MessageBubble isUser={false}>
                        <div className="formatted-text">
                          <FormattedText content={message.content} />
                        </div>
                      </MessageBubble>
                    ) : (
                      <MessageBubble isUser={false}>
                        <div className="formatted-text">
                          <FormattedText content={message.content} />
                        </div>
                        <MessageActions>
                          <ActionGroup>
                            <ActionButton>
                              <Icon className="ri-volume-up-line" />
                            </ActionButton>
                            <ActionButton>
                              <Icon className="ri-file-copy-line" />
                            </ActionButton>
                            <ActionButton>
                              <Icon className="ri-refresh-line" />
                            </ActionButton>
                            <ActionButton>
                              <Icon className="ri-share-line" />
                            </ActionButton>
                            <ActionButton>
                              <Icon className="ri-more-line" />
                            </ActionButton>
                          </ActionGroup>
                          <ActionGroup>
                            <ActionButton>
                              <Icon className="ri-thumb-up-line" />
                            </ActionButton>
                            <ActionButton>
                              <Icon className="ri-thumb-down-line" />
                            </ActionButton>
                          </ActionGroup>
                        </MessageActions>
                      </MessageBubble>
                    )}
                    {!isLoading &&
                      message.id === messages[messages.length - 1].id &&
                      !message.isUser && (
                        <SuggestedQuestions>
                          <QuestionButton>
                            <span>🔍 这里是与答案关联的智能推荐</span>
                            <Icon className="ri-arrow-right-s-line" />
                          </QuestionButton>
                          <QuestionButton>
                            <span>🔍 这里是与答案关联的智能推荐</span>
                            <Icon className="ri-arrow-right-s-line" />
                          </QuestionButton>
                          <QuestionButton>
                            <span>🔍 这里是与答案关联的智能推荐</span>
                            <Icon className="ri-arrow-right-s-line" />
                          </QuestionButton>
                        </SuggestedQuestions>
                      )}
                  </MessageContent>
                </>
              )}
            </MessageContainer>
          ))}
          <div ref={messagesEndRef} />
        </ChatMessages>

        <InputAreaContainer>
          <ScrollToBottomButton 
            isVisible={showScrollButton} 
            onClick={scrollToBottom}
          >
            <Icon className="ri-arrow-down-s-line" />
          </ScrollToBottomButton>

          <div
            style={{
              display: "flex",
              gap: "8px",
              padding: "0 12px",
              marginBottom: "8px",
            }}
          >
            <QuickActionButton
              isActive={activeQuickAction === "function1"}
              onClick={() => handleQuickAction("function1")}
            >
              <Icon className="ri-code-line" />
              快捷功能
            </QuickActionButton>
            <QuickActionButton
              isActive={activeQuickAction === "function2"}
              onClick={() => handleQuickAction("function2")}
            >
              <Icon className="ri-code-line" />
              快捷功能
            </QuickActionButton>
          </div>

          <InputContainer isFocused={isFocused}>
            {selectedFiles.length > 0 && (
              <FilePreviewsContainer>
                {selectedFiles.map(file => (
                  <FilePreview 
                    key={file.id}
                    status={file.status}
                    progress={file.progress}
                  >
                    <FileContentWrapper>
                      <FileIcon isImage={file.type ? file.type.toLowerCase().startsWith('image/') : false}>
                        {file.type && file.type.toLowerCase().startsWith('image/') && file.previewUrl ? (
                          <img 
                            src={file.previewUrl} 
                            alt={file.name} 
                          />
                        ) : (
                          <img 
                            src={getFileIcon(file)} 
                            alt={file.name} 
                          />
                        )}
                      </FileIcon>
                      <FileInfo>
                        <FileTitle>
                          {file.name}
                        </FileTitle>
                        <FileSize className={file.status === 'error' ? 'error' : ''}>
                          {file.status === 'error' ? (
                            <>
                              <Icon className="ri-error-warning-line error-icon" />
                              上传失败
                            </>
                          ) : (
                            <>
                              {file.status === 'uploading' && `${file.progress}% · `}
                              {file.sizeFormatted}
                            </>
                          )}
                        </FileSize>
                      </FileInfo>
                      <RemoveButton onClick={(e: React.MouseEvent) => {
                        e.preventDefault();
                        handleRemoveFile(file.id);
                      }}>
                        <Icon className="ri-close-line" />
                      </RemoveButton>
                    </FileContentWrapper>
                  </FilePreview>
                ))}
              </FilePreviewsContainer>
            )}
            <Input
              ref={inputRef}
              value={inputValue}
              onChange={handleInputChange}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              onKeyPress={handleKeyPress}
              placeholder="给AI Agent发消息"
              rows={1}
            />
            <ActionBar>
              <ActionButtons>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  style={{ display: 'none' }}
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
                  multiple
                />
                <ActionButton 
                  onClick={() => fileInputRef.current?.click()}
                  style={{ opacity: selectedFiles.length >= 10 ? 0.5 : 1 }}
                  disabled={selectedFiles.length >= 10}
                >
                  <Icon className="ri-attachment-2" />
                </ActionButton>
                <ActionButton>
                  <Icon className="ri-mic-line" />
                </ActionButton>
              </ActionButtons>
              {isLoading ? (
                isPaused ? (
                  <SendButton
                    style={{ opacity: 0.5 }}
                    disabled={true}
                  >
                    <Icon className="ri-send-plane-fill" />
                  </SendButton>
                ) : (
                  <SendButton
                    onClick={handlePauseGeneration}
                    style={{ opacity: 1 }}
                  >
                    <Icon className="ri-pause-fill" />
                  </SendButton>
                )
              ) : (
                <SendButton
                  onClick={handleSendMessage}
                  style={{ opacity: inputValue.trim() || selectedFiles.length > 0 ? 1 : 0.5 }}
                >
                  <Icon className="ri-send-plane-fill" />
                </SendButton>
              )}
            </ActionBar>
          </InputContainer>
        </InputAreaContainer>
      </ContentWrapper>
    </ChatAreaContainer>
  );
};

export default ChatArea;
