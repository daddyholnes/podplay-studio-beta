import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { ThemeProvider } from '../src/contexts/ThemeContext';
import { ChatProvider } from '../src/contexts/ChatContext';
import LeftSidebar from '../src/components/Layout/LeftSidebar';
import RightSidebar from '../src/components/Layout/RightSidebar';
import ChatInterface from '../src/components/Chat/ChatInterface';
import LiveAPIPage from '../src/components/LiveAPI/LiveAPIPage';
import { auth } from '../src/firebase-config';

export default function App() {
  return (
    <Router>
      <ThemeProvider>
        <ChatProvider>
          <div className="app-container">
            <LeftSidebar />
            
            <main className="main-content">
              <nav>
                <Link to="/">Chat</Link>
                <Link to="/live">Live API</Link>
              </nav>

              <Routes>
                <Route path="/" element={<ChatInterface />} />
                <Route path="/live" element={<LiveAPIPage />} />
              </Routes>
            </main>

            <RightSidebar />
          </div>
        </ChatProvider>
      </ThemeProvider>
    </Router>
  );

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
      
        {messages.map((message, index) => (
          
            {message,content}
          
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


