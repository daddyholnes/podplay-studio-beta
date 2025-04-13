// src/components/MessageInput.js
import React, { useState } from 'react';

function MessageInput({ handleSendMessage, loading }) {
  const [message, setMessage] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    handleSendMessage(message);
    setMessage('');
  };

  return (
    <>
      
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type your message..."
          disabled={loading}
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Sending...' : 'Send'}
        </button>
      
    </>
  );
}

export default MessageInput;