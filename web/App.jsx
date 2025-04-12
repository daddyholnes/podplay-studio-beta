import React, { useState, useEffect } from 'react';
import { collection, query, onSnapshot, orderBy, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from './firebase';
import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Save a message
async function saveMessage(userId, modelId, message) {
  await addDoc(collection(db, 'conversations', userId, modelId, 'messages'), {
    content: message.content,
    role: message.role,
    timestamp: Date.now()
  });
}

// Load conversation history
function loadConversation(userId, modelId, setMessages) {
  const q = query(
    collection(db, 'conversations', userId, modelId, 'messages'),
    orderBy('timestamp')
  );
  
  return onSnapshot(q, (snapshot) => {
    const messages = [];
    snapshot.forEach((doc) => {
      messages.push(doc.data());
    });
    setMessages(messages);
  });
}

export default function App() {
  const [messages, setMessages] = useState([]);
  const [selectedModel, setSelectedModel] = useState('claude-3-7');
  const [content, setContent] = useState('');
  const [user, setUser] = useState(null);

  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
        // Load conversation history when user is signed in
        loadConversation(user.uid, selectedModel, setMessages);
      } else {
        setUser(null);
      }
    });
  }, [selectedModel]);

  // Firebase message listener
  useEffect(() => {
    if (user) {
      const unsubscribe = onSnapshot(
        query(collection(db, 'conversations', user.uid, selectedModel, 'messages'),
          orderBy('timestamp')),
        (snapshot) => {
          const updatedMessages = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          setMessages(updatedMessages);
        }
      );
      return () => unsubscribe();
    }
  }, [selectedModel, user]);

  const sendMessage = async () => {
    if (content && user) {
      await saveMessage(user.uid, selectedModel, {
        content,
        role: 'user',
        timestamp: Date.now()
      });
      setContent('');
    }
  };

  return (
    <>
      {/* Model Selector Sidebar */}
      
      
      {/* Main Chat Area */}
      
        {messages.map(message => (
          
            {message.content}
          
        ))}
      
      
      {/* Input with Sensory Controls */}
      
        <textarea
          rows="3"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={(e) => {
            if (e.ctrlKey && e.key === 'Enter') {
              sendMessage();
            }
          }}
        />
        <button onClick={sendMessage}>Send</button>
      
    </>
  );
}
