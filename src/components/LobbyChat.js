'use client';
import { useState, useEffect, useRef } from 'react';
import { Smile, Send, X } from 'lucide-react';
import EmojiPicker from 'emoji-picker-react';

export default function LobbyChat({ serverId, userId, username }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [activeEmojis, setActiveEmojis] = useState({});
  const messagesEndRef = useRef(null);
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  // Fetch messages on component mount and when serverId changes
  useEffect(() => {
    if (!token || !serverId) return;
    
    // Initial fetch
    fetchMessages();
    
    // Poll for new messages every 3 seconds
    const interval = setInterval(fetchMessages, 3000);
    
    return () => clearInterval(interval);
  }, [serverId, token]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Handle emoji display timeout
  useEffect(() => {
    const timeouts = [];
    
    Object.entries(activeEmojis).forEach(([userId, emojiData]) => {
      if (emojiData.timestamp) {
        const timeout = setTimeout(() => {
          setActiveEmojis(prev => {
            const newEmojis = { ...prev };
            delete newEmojis[userId];
            return newEmojis;
          });
        }, 5000); // Show emoji for 5 seconds
        
        timeouts.push(timeout);
      }
    });
    
    return () => timeouts.forEach(clearTimeout);
  }, [activeEmojis]);

  const fetchMessages = async () => {
    try {
      const lastMessageTime = messages.length > 0 
        ? messages[messages.length - 1].timestamp 
        : null;
      
      const url = new URL('/api/chat', window.location.origin);
      url.searchParams.append('serverId', serverId);
      if (lastMessageTime) {
        url.searchParams.append('lastMessageTime', lastMessageTime);
      }
      
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
        cache: 'no-store'
      });
      
      if (res.ok) {
        const data = await res.json();
        if (data.messages && data.messages.length > 0) {
          setMessages(prev => {
            const existingIds = new Set(prev.map(m => m._id.toString()));
            const newMessages = data.messages.filter(
              msg => !existingIds.has(msg._id.toString())
            );
            
            // Check for emoji reactions in new messages
            newMessages.forEach(msg => {
              if (msg.type === 'emoji') {
                setActiveEmojis(prev => ({
                  ...prev,
                  [msg.userId]: {
                    emoji: msg.content,
                    timestamp: new Date().toISOString()
                  }
                }));
              }
            });
            
            return [...prev, ...newMessages].slice(-100); // Keep last 100 messages
          });
        }
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !token) return;
    
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          serverId,
          content: newMessage,
          type: 'message'
        })
      });
      
      if (res.ok) {
        setNewMessage('');
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const sendEmoji = (emoji) => {
    if (!token) return;
    
    fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        serverId,
        content: emoji,
        type: 'emoji'
      })
    }).catch(error => {
      console.error('Error sending emoji:', error);
    });
    
    setShowEmojiPicker(false);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="flex flex-col h-full bg-gray-800 rounded-lg overflow-hidden">
      <div className="p-3 bg-gray-700 text-white font-semibold border-b border-gray-600">
        Lobby Chat
      </div>
      
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {messages.map((msg) => (
          <div 
            key={msg._id || msg.timestamp}
            className={`flex ${msg.userId === userId ? 'justify-end' : 'justify-start'}`}
          >
            <div 
              className={`max-w-xs p-2 rounded-lg ${
                msg.userId === userId 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-700 text-white'
              }`}
            >
              <div className="text-xs font-semibold">
                {msg.userId === userId ? 'You' : msg.username}
              </div>
              <div>{msg.content}</div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      
      <div className="p-3 border-t border-gray-600">
        <form onSubmit={sendMessage} className="flex gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            
            <button
              type="button"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
            >
              <Smile size={20} />
            </button>
            
            {showEmojiPicker && (
              <div className="absolute bottom-12 right-0 z-10">
                <div className="relative">
                  <button
                    onClick={() => setShowEmojiPicker(false)}
                    className="absolute top-1 right-1 z-20 text-gray-400 hover:text-white"
                  >
                    <X size={16} />
                  </button>
                  <EmojiPicker
                    onEmojiClick={(emojiData) => {
                      sendEmoji(emojiData.emoji);
                      setShowEmojiPicker(false);
                    }}
                    width={300}
                    height={350}
                    searchPlaceholder="Search emoji"
                    previewConfig={{
                      showPreview: false
                    }}
                  />
                </div>
              </div>
            )}
          </div>
          
          <button
            type="submit"
            disabled={!newMessage.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send size={20} />
          </button>
        </form>
      </div>
    </div>
  );
}

// Emoji display component for user banners
export function EmojiDisplay({ userId, activeEmojis }) {
  const emojiData = activeEmojis[userId];
  
  if (!emojiData) return null;
  
  return (
    <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-70 text-2xl p-1 rounded-full">
      {emojiData.emoji}
    </div>
  );
}
