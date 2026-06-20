import React, { useState, useEffect, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { FiSend, FiUser, FiMessageSquare, FiInfo } from 'react-icons/fi';
import { FaDumbbell, FaUtensils } from 'react-icons/fa';
import { chatService } from '../../services/api';

const fadeIn = { hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } };

export default function AdminChat() {
  const location = useLocation();
  const messagesEndRef = useRef(null);
  
  const [conversations, setConversations] = useState([]);
  const [activeUser, setActiveUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loadingConv, setLoadingConv] = useState(true);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [sending, setSending] = useState(false);

  const loadConversations = async (autoSelectUser = null) => {
    try {
      setLoadingConv(true);
      const res = await chatService.getConversations();
      if (res.data.success) {
        const list = res.data.data || [];
        setConversations(list);
        
        // Handle auto selection from router state
        if (autoSelectUser) {
          const found = list.find(c => c.user.id === autoSelectUser.id);
          if (found) {
            handleSelectUser(found.user);
          } else {
            // If conversation doesn't exist yet, mock select
            handleSelectUser(autoSelectUser);
          }
        } else if (list.length > 0 && !activeUser) {
          handleSelectUser(list[0].user);
        }
      }
    } catch (err) {
      console.error("Error loading conversations:", err);
    } finally {
      setLoadingConv(false);
    }
  };

  useEffect(() => {
    const targetUser = location.state?.selectUser || null;
    loadConversations(targetUser);
    
    // Set up auto polling for new messages every 8 seconds
    const interval = setInterval(() => {
      loadConversationsWithoutSpinner();
    }, 8000);
    
    return () => clearInterval(interval);
  }, [location.state]);

  const loadConversationsWithoutSpinner = async () => {
    try {
      const res = await chatService.getConversations();
      if (res.data.success) {
        setConversations(res.data.data || []);
      }
    } catch (err) {
      console.error("Silent reload failed:", err);
    }
  };

  useEffect(() => {
    if (activeUser) {
      fetchHistory(activeUser.id);
    }
  }, [activeUser]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchHistory = async (userId) => {
    try {
      setLoadingHistory(true);
      const res = await chatService.getChatHistory(userId);
      if (res.data.success) {
        setMessages(res.data.data || []);
        
        // Mark read
        await chatService.markAsRead(userId);
      }
    } catch (err) {
      console.error("Error loading history:", err);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleSelectUser = (user) => {
    setActiveUser(user);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!activeUser || !inputText.trim() || sending) return;

    try {
      setSending(true);
      const res = await chatService.sendMessage({
        receiver_id: activeUser.id,
        message: inputText.trim()
      });
      
      if (res.data.success) {
        setMessages(prev => [...prev, res.data.data]);
        setInputText('');
        loadConversationsWithoutSpinner();
      }
    } catch (err) {
      console.error("Error sending message:", err);
    } finally {
      setSending(false);
    }
  };

  const sendQuickSuggestion = async (text) => {
    setInputText(text);
  };

  return (
    <>
      <Helmet><title>Client Communications | Admin — Gnaneswar Fitness Platform</title></Helmet>
      <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto h-[82vh] flex gap-4">
        {/* Left conversations List Panel */}
        <div className="w-80 card flex flex-col p-4 bg-dark-900 border border-white/5 overflow-hidden">
          <h2 className="text-lg font-serif font-bold text-white mb-4 flex items-center gap-2">
            <FiMessageSquare className="text-gold-400" /> Inbox Chats
          </h2>
          
          <div className="flex-1 overflow-y-auto space-y-2 scrollbar-thin pr-1">
            {loadingConv && conversations.length === 0 ? (
              <div className="text-center text-dark-500 py-10">Loading...</div>
            ) : conversations.length === 0 ? (
              <div className="text-center text-dark-500 py-10 text-xs">No client chats active yet.</div>
            ) : (
              conversations.map(c => {
                const isSelected = activeUser?.id === c.user.id;
                return (
                  <div
                    key={c.user.id}
                    onClick={() => handleSelectUser(c.user)}
                    className={`p-3 rounded-xl cursor-pointer transition-all border ${
                      isSelected 
                        ? 'bg-gold-500/10 border-gold-500/30' 
                        : 'bg-dark-950/40 border-transparent hover:bg-dark-800'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gold-400 to-gold-700 flex items-center justify-center text-dark-950 font-bold text-xs flex-shrink-0">
                        {c.user.first_name?.[0]}{c.user.last_name?.[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold text-white text-sm truncate">{c.user.first_name} {c.user.last_name}</h4>
                          {c.unread_count > 0 && (
                            <span className="w-5 h-5 rounded-full bg-gold-500 text-dark-950 font-bold text-[10px] flex items-center justify-center">
                              {c.unread_count}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-dark-500 truncate mt-0.5">
                          {c.latest_message ? c.latest_message.message : 'No messages yet'}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right chat detail Panel */}
        <div className="flex-1 card flex flex-col bg-dark-900 border border-white/5 overflow-hidden p-0">
          {activeUser ? (
            <>
              {/* Active user header */}
              <div className="p-4 border-b border-white/5 bg-dark-950/40 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gold-400 to-gold-700 flex items-center justify-center text-dark-950 font-bold text-sm">
                    {activeUser.first_name?.[0]}{activeUser.last_name?.[0]}
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-sm">{activeUser.first_name} {activeUser.last_name}</h3>
                    <p className="text-xs text-dark-400 capitalize">{activeUser.role} Portal • {activeUser.email}</p>
                  </div>
                </div>
              </div>

              {/* Message Feed */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-dark-950/10 scrollbar-thin">
                {loadingHistory && messages.length === 0 ? (
                  <div className="text-center text-dark-500 py-10">Loading chat history...</div>
                ) : messages.length === 0 ? (
                  <div className="text-center text-dark-600 py-10 text-xs">Send your first suggestion to start the conversation!</div>
                ) : (
                  messages.map((msg, i) => {
                    const isSelf = msg.sender_id !== activeUser.id;
                    return (
                      <div
                        key={msg.id || i}
                        className={`flex ${isSelf ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-[70%] p-3.5 rounded-2xl text-sm leading-relaxed ${
                          isSelf 
                            ? 'bg-gold-500 text-dark-950 font-semibold rounded-tr-none' 
                            : 'bg-dark-800 text-white rounded-tl-none border border-white/5'
                        }`}>
                          <p className="whitespace-pre-wrap">{msg.message}</p>
                          <span className={`text-[8px] mt-1 block text-right ${isSelf ? 'text-dark-800' : 'text-dark-500'}`}>
                            {msg.created_at ? new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Quick suggestion templates panel */}
              <div className="px-4 py-2 bg-dark-950/20 border-t border-white/5 flex gap-2 overflow-x-auto scrollbar-none">
                <button 
                  onClick={() => sendQuickSuggestion("Hi! Here is your daily workout suggestion: Focus on high-intensity sets today, and keep your form strict. Let me know if you complete it!")}
                  className="px-3 py-1.5 rounded-full bg-dark-800 hover:bg-dark-700 text-[10px] text-gold-400 font-semibold border border-gold-500/10 flex items-center gap-1 whitespace-nowrap"
                >
                  <FaDumbbell size={10} /> Workout Suggestion
                </button>
                <button 
                  onClick={() => sendQuickSuggestion("Hello! I reviewed your macros. Try adding 30g more protein to your meals today to support recovery. Keep track of your water!")}
                  className="px-3 py-1.5 rounded-full bg-dark-800 hover:bg-dark-700 text-[10px] text-blue-400 font-semibold border border-blue-500/10 flex items-center gap-1 whitespace-nowrap"
                >
                  <FaUtensils size={10} /> Nutrition Tip
                </button>
                <button 
                  onClick={() => sendQuickSuggestion("Great job on your check-in! Your weight progress is looking steady. Let's keep this momentum up for the rest of the week!")}
                  className="px-3 py-1.5 rounded-full bg-dark-800 hover:bg-dark-700 text-[10px] text-green-400 font-semibold border border-green-500/10 flex items-center gap-1 whitespace-nowrap"
                >
                  <FiInfo size={10} /> Progress Feedback
                </button>
              </div>

              {/* Chat Input */}
              <form onSubmit={handleSendMessage} className="p-4 border-t border-white/5 bg-dark-950/40 flex gap-2">
                <input
                  type="text"
                  placeholder="Type a message or workout suggestion..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  className="input-field flex-1"
                  required
                />
                <button
                  type="submit"
                  disabled={sending || !inputText.trim()}
                  className="p-3.5 rounded-xl bg-gold-500 text-dark-950 hover:bg-gold-400 font-bold transition-all disabled:opacity-50"
                >
                  <FiSend size={18} />
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
              <FiMessageSquare className="text-5xl text-dark-600 mb-3" />
              <h3 className="text-white font-serif font-bold text-lg">No Conversation Selected</h3>
              <p className="text-dark-500 text-xs mt-1 max-w-sm">Select a client from the left pane to check their routines, send suggestions, and message them.</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
