import React, { useState, useEffect, useRef, useCallback } from 'react';
import { getChatMessages } from '../api/chat';
import MessageItem from './MessageItem';
import MessageForm from './MessageForm';

const ChatRoom = ({ chatRoom }) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);

  // Fetch messages when chat room changes
  const fetchMessages = useCallback(async (showLoading = true) => {
    if (!chatRoom) return;
    
    if (showLoading) {
      setLoading(true);
    }
    setError(null);
    
    try {
      const result = await getChatMessages(chatRoom.chat_id);
      setMessages(result.messages);
    } catch (err) {
      console.error('Failed to fetch messages:', err);
      setError(err.detail || 'Failed to load messages');
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  }, [chatRoom]);

  // Initial fetch when chat room changes
  useEffect(() => {
    if (chatRoom) {
      fetchMessages(true); // Show loading on initial fetch
    }
  }, [chatRoom?.chat_id, fetchMessages]);

  // Auto-refresh messages every 1.5 seconds for faster updates
  useEffect(() => {
    if (!chatRoom) return;

    const intervalId = setInterval(() => {
      fetchMessages(false); // Don't show loading during polling
    }, 1500); // Poll every 1.5 seconds for faster updates

    return () => clearInterval(intervalId);
  }, [chatRoom?.chat_id, fetchMessages]);

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Handle new message sent - refresh immediately to get latest messages
  const handleMessageSent = (newMessage) => {
    // Optimistically add the message
    setMessages(prev => [...prev, newMessage]);
    // Immediately fetch latest messages to get any other new messages
    setTimeout(() => {
      fetchMessages(false);
    }, 500); // Small delay to ensure server has processed the message
  };

  if (!chatRoom) {
    return (
      <div className="flex-1 flex items-center justify-center text-neutral-500">
        Select a chat room to start messaging
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-white border border-neutral-200 rounded-lg overflow-hidden">
      {/* Chat room header */}
      <div className="px-4 py-3 bg-neutral-50 border-b border-neutral-200">
        <h3 className="font-semibold text-neutral-900">#{chatRoom.title}</h3>
      </div>

      {/* Messages area */}
      <div 
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-2 bg-neutral-25"
        style={{ minHeight: '400px', maxHeight: '500px' }}
      >
        {loading && (
          <div className="text-center py-8 text-neutral-500">
            Loading messages...
          </div>
        )}
        
        {error && (
          <div className="text-center py-8">
            <div className="text-red-600 mb-2">{error}</div>
            <button
              onClick={fetchMessages}
              className="text-blue-600 hover:text-blue-800 underline text-sm"
            >
              Try again
            </button>
          </div>
        )}
        
        {!loading && !error && messages.length === 0 && (
          <div className="text-center py-8 text-neutral-500">
            <div className="text-lg mb-2">💬</div>
            <div>No messages yet in this chat room.</div>
            <div className="text-sm mt-1">Be the first to say something!</div>
          </div>
        )}
        
        {!loading && !error && messages.length > 0 && (
          <div className="space-y-1">
            {messages.map((message) => (
              <MessageItem
                key={message.msg_id}
                message={message}
              />
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Message input */}
      <MessageForm
        chatId={chatRoom.chat_id}
        onMessageSent={handleMessageSent}
      />
    </div>
  );
};

export default ChatRoom;