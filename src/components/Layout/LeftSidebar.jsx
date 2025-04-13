import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { useChat } from '../../contexts/ChatContext';

const LeftSidebar = () => {
  const { theme, toggleTheme } = useTheme();
  const { 
    selectedModel, 
    setSelectedModel, 
    conversations,
    startNewChat 
  } = useChat();

  const models = [
    { id: 'gemini-pro', name: 'Gemini Pro' },
    { id: 'claude-3', name: 'Claude 3' },
    { id: 'gpt-4', name: 'GPT-4' }
  ];

  return (
    <div className="left-sidebar">
      <button className="new-chat-btn" onClick={startNewChat}>
        New Chat
      </button>

      <div className="model-selector">
        <select 
          value={selectedModel} 
          onChange={(e) => setSelectedModel(e.target.value)}
        >
          {models.map(model => (
            <option key={model.id} value={model.id}>
              {model.name}
            </option>
          ))}
        </select>
      </div>

      <button 
        className="theme-toggle"
        onClick={toggleTheme}
      >
        {theme === 'light' ? '🌙' : '☀️'}
      </button>

      <div className="conversation-history">
        {conversations.map(conv => (
          <div key={conv.id} className="conversation-item">
            {conv.title}
          </div>
        ))}
      </div>
    </div>
  );
};

export default LeftSidebar;