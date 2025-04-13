import React, { useState, useEffect } from 'react';
import { useChat } from '../../contexts/ChatContext';

const LiveAPIPage = () => {
  const { selectedModel, setSelectedModel } = useChat();
  const [participants, setParticipants] = useState([]);
  const [audioQuality, setAudioQuality] = useState('high');
  
  // Simulated participant bubbles
  useEffect(() => {
    setParticipants([
      { id: 'user', name: 'You', speaking: false },
      { id: selectedModel, name: 'AI Assistant', speaking: false }
    ]);
  }, [selectedModel]);

  const handleModelChange = (newModel) => {
    // Handle conversation transfer logic here
    setSelectedModel(newModel);
  };

  return (
    <div className="live-api-page">
      <div className="participants-area">
        {participants.map(participant => (
          <div 
            key={participant.id}
            className={`participant-bubble ${participant.speaking ? 'speaking' : ''}`}
          >
            {participant.name}
          </div>
        ))}
      </div>

      <div className="controls-panel">
        <div className="quality-controls">
          <label>Audio Quality:</label>
          <select 
            value={audioQuality}
            onChange={(e) => setAudioQuality(e.target.value)}
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>

        <div className="model-controls">
          <label>Current Model:</label>
          <select 
            value={selectedModel}
            onChange={(e) => handleModelChange(e.target.value)}
          >
            <option value="gemini-pro">Gemini Pro</option>
            <option value="claude-3">Claude 3</option>
            <option value="gpt-4">GPT-4</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default LiveAPIPage;