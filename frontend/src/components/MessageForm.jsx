import React, { useState } from 'react';
import { sendMessage } from '../api/chat';
import { Button } from './ui/button';

const MessageForm = ({ chatId, onMessageSent }) => {
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const hasContent = content.trim();
    const hasImage = imageUrl.trim();
    
    if (!hasContent && !hasImage) return;

    setLoading(true);
    setError(null);

    try {
      const hasImage = imageUrl.trim();
      const messageData = {
        content: hasImage ? imageUrl.trim() : content.trim(),
        chat_id: chatId,
        type: hasImage ? 'image' : 'text'
      };

      const newMessage = await sendMessage(messageData);
      
      setContent('');
      setImageUrl('');
      
      onMessageSent(newMessage);
    } catch (err) {
      console.error('Failed to send message:', err);
      setError(err.detail || 'Failed to send message');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="border-t border-neutral-200 p-4 bg-white">
      {error && (
        <div className="mb-3 text-sm text-red-600">
          {error}
        </div>
      )}
      
      <div className="space-y-3">
        {/* Image URL input */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-medium text-neutral-700 min-w-fit">
            Image URL:
          </label>
          <input
            type="url"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="https://example.com/image.jpg (optional)"
            className="flex-1 p-2 text-sm border border-neutral-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={loading}
          />
        </div>
        
        {/* Message input */}
        <div className="flex gap-3">
          <div className="flex-1">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={imageUrl.trim() ? "Add a caption (optional)" : "Type your message..."}
              className="w-full p-3 border border-neutral-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={1}
              maxLength={1000}
              disabled={loading}
              style={{
                minHeight: '44px',
                maxHeight: '120px',
                overflowY: content.length > 50 ? 'auto' : 'hidden'
              }}
            />
            <div className="text-xs text-neutral-500 mt-1">
              {imageUrl.trim() 
                ? 'Image with optional caption' 
                : `${content.length}/1000 characters`} • Press Enter to send
            </div>
          </div>
          
          <Button
            type="submit"
            disabled={loading || (!content.trim() && !imageUrl.trim())}
            className="self-start mt-0"
          >
            {loading ? 'Sending...' : 'Send'}
          </Button>
        </div>
      </div>
    </form>
  );
};

export default MessageForm;