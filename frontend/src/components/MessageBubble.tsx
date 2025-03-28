import React from 'react';
import { Message } from '../types';

interface MessageBubbleProps {
  message: Message;
  isLoading: boolean;
  onPause: () => void;
  onResume: () => Promise<void>;
  isPaused: boolean;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  isLoading,
  onPause,
  onResume,
  isPaused,
}) => {
  const isThinking = message.content === "正在思考...";
  const hasDeepThinking = message.content.includes("<think>");

  const renderContent = () => {
    if (isThinking) {
      return (
        <div className="flex items-center gap-2">
          <span>正在思考</span>
          <div className="flex gap-1">
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
          </div>
        </div>
      );
    }

    if (hasDeepThinking) {
      const parts = message.content.split(/<think>|<\/think>/);
      return parts.map((part, index) => {
        if (index % 2 === 0) {
          return part && <div key={index} className="mb-2">{part}</div>;
        } else {
          return (
            <div key={index} className="bg-blue-50 p-4 rounded-lg mb-2">
              <div className="flex items-center gap-2 text-blue-600 mb-2">
                <i className="ri-lightbulb-line" />
                <span className="font-medium">深度思考</span>
              </div>
              <div className="text-gray-700">{part}</div>
            </div>
          );
        }
      });
    }

    return message.content;
  };

  return (
    <div className={`flex items-start gap-3 mb-4 ${message.isUser ? 'flex-row-reverse' : ''}`}>
      <div className={`flex-1 ${message.isUser ? 'items-end' : 'items-start'}`}>
        <div className="flex items-center gap-2 mb-1 text-sm text-gray-500">
          <span>{message.userName || (message.isUser ? '我' : 'AI')}</span>
          <span>{message.timestamp}</span>
        </div>
        
        {message.files && message.files.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-2">
            {message.files.map(file => (
              <div key={file.id} className="bg-gray-50 p-2 rounded">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8">
                    {file.type?.startsWith('image/') && file.previewUrl ? (
                      <img src={file.previewUrl} alt={file.name} className="w-full h-full object-cover rounded" />
                    ) : (
                      <div className="w-full h-full bg-gray-200 rounded flex items-center justify-center">
                        <i className="ri-file-line text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="text-sm font-medium">{file.name}</div>
                    <div className="text-xs text-gray-500">{file.sizeFormatted}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        <div 
          className={`relative p-3 rounded-lg ${
            message.isUser 
              ? 'bg-blue-500 text-white' 
              : 'bg-white border border-gray-200'
          }`}
        >
          <div className="whitespace-pre-wrap">{renderContent()}</div>
          
          {isLoading && !message.isUser && !isThinking && (
            <div className="absolute bottom-full right-0 mb-2">
              <button
                onClick={isPaused ? onResume : onPause}
                className="px-3 py-1 text-sm bg-white border rounded-full shadow-sm hover:bg-gray-50"
              >
                {isPaused ? '继续生成' : '暂停生成'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}; 