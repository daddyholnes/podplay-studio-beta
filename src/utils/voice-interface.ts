import { Pipeline } from '@pipecat/ai';
import * as admin from 'firebase-admin';
import { mcpServer } from '../functions/src/mcp-server';

const firestore = admin.firestore();

export class VoiceEngine {
  private pipeline: Pipeline;

  constructor() {
    this.pipeline = new Pipeline({
      audio: {
        sampleRate: 48000,
        noiseSuppression: 'aggressive',
        voiceFocus: 'enhanced'
      },
      models: [/* Your model config */] // Model config should be added here
    });
  }

  async startConversation(userId: string) {
    const room = await mcpServer.createVoiceRoom(userId);
    if (!room) {
      console.error("Failed to create LiveKit room");
      return;
    }
    const connection = await this.pipeline.connect(room.name);
    if (!connection) {
      console.error("Failed to connect to LiveKit room");
      return;
    }

    connection.on('audio', (audioFrame) => {
      // Process AI response
      this.pipeline.processAudio(audioFrame);
    })
    .on('transcript', (text) => {
      // Update Firestore conversation
      firestore.doc(`conversations/${userId}`).update({
        transcript: admin.firestore.FieldValue.arrayUnion(text)
      }).catch(error => {
        console.error("Error updating Firestore transcript:", error);
      });
    });
  }
}
