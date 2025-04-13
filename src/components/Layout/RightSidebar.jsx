import React, { useState } from 'react';
import { useChat } from '../../contexts/ChatContext';

const RightSidebar = () => {
  const { uploadFile, startRecording, stopRecording, isRecording } = useChat();
  const [showSettings, setShowSettings] = useState(false);

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      uploadFile(file);
    }
  };

  return (
    <div className="right-sidebar">
      <div className="media-controls">
        <input
          type="file"
          id="file-upload"
          onChange={handleFileUpload}
          accept="image/*,application/pdf,audio/*"
          style={{ display: 'none' }}
        />
        <label htmlFor="file-upload" className="upload-btn">
          📎 Upload File
        </label>

        <button 
          className={`record-btn ${isRecording ? 'recording' : ''}`}
          onClick={isRecording ? stopRecording : startRecording}
        >
          🎤 {isRecording ? 'Stop Recording' : 'Start Recording'}
        </button>

        <button className="video-btn">
          📹 Video Call
        </button>
      </div>

      <button 
        className="settings-btn"
        onClick={() => setShowSettings(!showSettings)}
      >
        ⚙️ Settings
      </button>

      {showSettings && (
        <div className="settings-panel">
          <h3>Settings</h3>
          {/* Add settings options here */}
        </div>
      )}
    </div>
  );
};

export default RightSidebar;