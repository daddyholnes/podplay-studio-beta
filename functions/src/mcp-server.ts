import * as admin from 'firebase-admin';
import { Server } from 'livekit-server-sdk';
import { Pipeline } from '@pipecat/ai';

admin.initializeApp();
const firestore = admin.firestore();

const livekit = new Server(process.env.LIVEKIT_API_KEY, process.env.LIVEKIT_API_SECRET);

export const mcpServer = {
  // Firestore Operations
  getConversation: async (userId: string, modelId: string) => {
    const doc = await firestore.doc(`conversations/${userId}/models/${modelId}`).get();
    return doc.exists ? doc.data() : null;
  },

  // LiveKit Room Management
  createVoiceRoom: async (userId: string) => {
    return await livekit.createRoom({
      name: `voice-${userId}-${Date.now()}`,
      emptyTimeout: 300,
      maxParticipants: 2
    });
  },

  // AI Model Routing
  aiPipeline: new Pipeline({
    models: [
      {
        name: 'gemini-2.5-flash',
        provider: 'google',
        endpoint: process.env.GEMINI_ENDPOINT,
        contextWindow: 128000
      },
      {
        name: 'claude-3.7-sonnet',
        provider: 'anthropic', 
        endpoint: process.env.CLAUDE_ENDPOINT,
        contextWindow: 200000
      }
    ],
    routing: 'context-aware'
  })
};