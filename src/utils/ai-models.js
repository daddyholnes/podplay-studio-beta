// src/utils/ai-models.js
import { db } from '../firebase-config';
import { saveMessage } from './database';

// Function to send message to appropriate AI model
export async function sendMessageToModel(userId, modelId, message, history) {
  // Add user message to database
  await saveMessage(userId, modelId, {
    content: message,
    role: 'user',
    timestamp: Date.now()
  });
  
  // Format history for API
  const formattedHistory = history.map(msg => ({
    role: msg.role,
    content: msg.content
  }));
  
  // Select appropriate API based on model ID
  let response;
  if (modelId.includes('gemini')) {
    response = await callGeminiAPI(formattedHistory, message);
  } else if (modelId.includes('claude')) {
    response = await callClaudeAPI(formattedHistory, message);
  } else if (modelId.includes('gpt')) {
    response = await callOpenAIAPI(formattedHistory, message);
  }
  
  // Save AI response to database
  await saveMessage(userId, modelId, {
    content: response,
    role: 'assistant',
    timestamp: Date.now()
  });
  
  return response;
}

// Implement API calls for each model provider
async function callGeminiAPI(history, message) {
  // Implementation using your Gemini API key
}

async function callClaudeAPI(history, message) {
  // Implementation using your Anthropic API key
}

async function callOpenAIAPI(history, message) {
  // Implementation using your OpenAI API key
}