import React, { useState, useEffect } from 'react';
import ChatWindow from './components/ChatWindow';
import Sidebar from './components/Sidebar';
import Login from './components/Login';
import Register from './components/Register';
import { connectSocket } from './utils/socket';

export default function App() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [socket, setSocket] = useState(null);
  const [activeConversation, setActiveConversation] = useState(null);
  const [authView, setAuthView] = useState('login');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifySession = async () => {
      const savedToken = localStorage.getItem('token');
      if (!savedToken) {
        setLoading(false);
        return;
      }

      try {
        const res = await fetch('https://commun-project.onrender.com/api/auth/me', {
          headers: { 'Authorization': `Bearer ${savedToken}` }
        });

        if (res.ok) {
          const userData = await res.json();
          setUser({ id: userData._id, username: userData.username });
          setToken(savedToken);
          const newSocket = connectSocket(savedToken);
          setSocket(newSocket);
        } else {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      } catch (err) {
        console.error("Session verification failed:", err);
      } finally {
        setLoading(false);
      }
    };

    verifySession();
  }, []);

  const handleAuthSuccess = (userData, userToken) => {
    setUser(userData);
    setToken(userToken);
    const newSocket = connectSocket(userToken);
    setSocket(newSocket);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    if (socket) socket.close();
    setUser(null);
    setToken(null);
    setSocket(null);
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#050505] text-[#ffd700] font-mono tracking-widest animate-pulse">
        INITIALIZING...
      </div>
    );
  }

  if (!user || !token) {
    return authView === 'login' ? (
      <Login onLoginSuccess={handleAuthSuccess} switchToRegister={() => setAuthView('register')} />
    ) : (
      <Register onRegisterSuccess={handleAuthSuccess} switchToLogin={() => setAuthView('login')} />
    );
  }

  return (
    <div className="flex h-screen bg-[#050505] text-white transition-colors duration-300 relative overflow-hidden font-mono">
      <div className="absolute top-4 right-4 z-50">
        <button onClick={handleLogout} className="text-[10px] text-red-500 border border-red-500 px-3 py-1 hover:bg-red-900/30 transition-colors uppercase tracking-widest">
          Disconnect
        </button>
      </div>

      <div className="relative z-10 w-1/4 flex flex-col bg-[#050505]">
        <Sidebar onSelectConversation={setActiveConversation} currentUser={user} />
      </div>
      <div className="relative z-10 w-3/4 bg-[#050505]">
        {activeConversation ? (
          <ChatWindow socket={socket} currentConversationId={activeConversation} currentUser={user} />
        ) : (
          <div className="flex h-full items-center justify-center text-[#9d4edd] tracking-[0.2em] animate-pulse uppercase text-sm">
            Awaiting node connection...
          </div>
        )}
      </div>
    </div>
  );
}