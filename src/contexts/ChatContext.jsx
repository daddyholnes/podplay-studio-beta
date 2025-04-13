import React, { createContext, useContext, useState, useEffect } from 'react';
import { collection, query, orderBy, addDoc, onSnapshot } from 'firebase/firestore';
import { db, auth } from '../firebase-config';

const ChatContext = createContext();

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};

export const ChatProvider = ({ children }) => {
  const [messages, setMessages] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [selectedModel, setSelectedModel] = useState('gemini-pro');
  const [isLoading, setIsLoading] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [isRecording, setIsRecording] = useState(false);

  useEffect(() => {
    if (!auth.currentUser) return;

    const q = query(
      collection(db, 'conversations', auth.currentUser.uid, selectedModel, 'messages'),
      orderBy('timestamp')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newMessages = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setMessages(newMessages);
    });

    return () => unsubscribe();
  }, [selectedModel]);

  const sendMessage = async (content) => {
    if (!auth.currentUser || !content.trim()) return;

    setIsLoading(true);
    try {
      await addDoc(collection(db, 'conversations', auth.currentUser.uid, selectedModel, 'messages'), {
        content,
        role: 'user',
        timestamp: Date.now()
      });
      
      // Here you would typically call your AI service
      // For now, we'll simulate a response
      setTimeout(async () => {
        await addDoc(collection(db, 'conversations', auth.currentUser.uid, selectedModel, 'messages'), {
          content: 'This is a simulated AI response.',
          role: 'assistant',
          timestamp: Date.now()
        });
        setIsLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error sending message:', error);
      setIsLoading(false);
    }
  };

  const startNewChat = () => {
    setMessages([]);
    // Additional logic for starting a new chat
  };

  const uploadFile = async (file) => {
    // Implement file upload logic
    console.log('File upload not implemented yet');
  };

  const startRecording = () => {
    setIsRecording(true);
    // Implement voice recording logic
  };

  const stopRecording = () => {
    setIsRecording(false);
    // Implement stop recording logic
  };

  return (
    <ChatContext.Provider value={{
      messages,
      conversations,
      selectedModel,
      setSelectedModel,
      isLoading,
      inputValue,
      setInputValue,
      sendMessage,
      startNewChat,
      uploadFile,
      isRecording,
      startRecording,
      stopRecording
    }}>
      {children}
    </ChatContext.Provider>
  );
};