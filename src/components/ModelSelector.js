// src/components/ModelSelector.js
import React from 'react';

function ModelSelector({ setSelectedModel }) {
  return (
    <>
      
        <option value="gemini-1.5-pro">Gemini 1.5 Pro</option>
        <option value="gpt-4">GPT-4</option>
        <option value="claude-3">Claude 3</option>
      
    </>
  );
}

export default ModelSelector;