// src/components/MessageList.js
import React from 'react';

/**
 * Displays a list of messages.
 * @param {{ messages: Array<{ id?: string | number, role: string, content: string, isStreaming?: boolean }> }} props
 */
function MessageList({ messages }) {
  return (
    <div className="message-list" style={{ display: 'flex', flexDirection: 'column', gap: '10px', padding: '10px' }}>
      {messages.map((message, index) => (
        <div 
          key={message.id || index} 
          className={`message ${message.role}`} 
          style={{ 
            alignSelf: message.role === 'user' ? 'flex-end' : 'flex-start', 
            background: message.role === 'user' ? '#d1e7fd' : '#f8f9fa', 
            padding: '8px 12px', 
            borderRadius: '10px',
            maxWidth: '70%' 
          }}
        >
          {/* Display content or typing indicator */}
          {message.content || (message.role === 'assistant' && message.isStreaming ? 'Typing...' : '')}
        </div>
      ))}
    </div>
  );
}

export default MessageList;
