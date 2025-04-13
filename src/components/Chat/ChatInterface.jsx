import React, { useRef, useEffect } from 'react';
import { useChat } from '../../contexts/ChatContext';
import MessageBubble from './MessageBubble';
import CodeBlock from './CodeBlock';

const ChatInterface = () => {
  const { 
    messages, 
    sendMessage, 
    isLoading,
    inputValue,
    setInputValue
  } = useChat();
  
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (inputValue.trim()) {
      sendMessage(inputValue);
      setInputValue('');
    }
  };

  return (
    <div className="chat-interface">
      <div className="messages-container">
        {messages.map((message, index) => (
          <MessageBubble 
            key={index}
            message={message}
            CodeBlock={CodeBlock}
          />
        ))}
        {isLoading && (
          <div className="loading-indicator">
            <span>AI is thinking...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="input-form">
        <textarea
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Type your message..."
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSubmit(e);
            }
          }}
        />
        <button type="submit" disabled={isLoading}>
          Send
        </button>
      </form>
    </div>
  );
};

export default ChatInterface;