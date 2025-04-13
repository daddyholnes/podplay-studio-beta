// src/components/ChatInterface.js
import React, { useState, useEffect } from 'react';
import { loadConversation } from '../utils/database';
import { sendMessageToModel } from '../utils/ai-models';
import ModelSelector from './ModelSelector';
import MessageList from './MessageList';
import MessageInput from './MessageInput';

function ChatInterface({ userId }) {
  const [selectedModel, setSelectedModel] = useState('gemini-1.5-pro');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  // Load conversation history when model changes
  useEffect(() => {
    if (userId && selectedModel) {
      const unsubscribe = loadConversation(userId, selectedModel, setMessages);
      return () => unsubscribe();
    }
  }, [userId, selectedModel]);

  // Send message to selected model
  const handleSendMessage = async (message) => {
    setLoading(true);
    try {
      await sendMessageToModel(userId, selectedModel, message, messages);
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <ModelSelector setSelectedModel={setSelectedModel} />
      <MessageList messages={messages} />
      <MessageInput handleSendMessage={handleSendMessage} loading={loading} />
    </>
  );
}

export default ChatInterface;