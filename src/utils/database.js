import { collection, addDoc, query, orderBy, onSnapshot, where, doc, setDoc } from 'firebase/firestore';
import { db } from '../firebase-config';

// Save a message to a conversation
export async function saveMessage(userId, modelId, message) {
  const conversationRef = collection(db, 'conversations', userId, modelId, 'messages');
  await addDoc(conversationRef, {
    content: message.content,
    role: message.role,
    timestamp: Date.now()
  });
  
  // Update metadata
  const metadataRef = doc(db, 'conversations', userId, modelId, 'metadata');
  await setDoc(metadataRef, {
    last_accessed: Date.now()
  }, { merge: true });
}

// Load conversation history
export function loadConversation(userId, modelId, setMessages) {
  const q = query(
    collection(db, 'conversations', userId, modelId, 'messages'),
    orderBy('timestamp')
  );
  
  return onSnapshot(q, (snapshot) => {
    const messages = [];
    snapshot.forEach((doc) => {
      messages.push({
        id: doc.id,
        ...doc.data()
      });
    });
    setMessages(messages);
  });
}