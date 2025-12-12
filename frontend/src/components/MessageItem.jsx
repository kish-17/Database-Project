import React from 'react';

const MessageItem = ({ message }) => {
  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <div className={`flex gap-3 py-2 px-3 rounded-lg mb-2 ${
      message.is_sender 
        ? 'bg-blue-50 border border-blue-100 ml-8' 
        : 'bg-neutral-50 border border-neutral-100 mr-8'
    }`}>
      {/* Avatar */}
      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
        message.is_sender 
          ? 'bg-blue-200 text-blue-800' 
          : 'bg-neutral-200 text-neutral-600'
      }`}>
        {(message.sender_display_name || 'U')[0].toUpperCase()}
      </div>
      
      {/* Message content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className={`font-medium text-sm ${
            message.is_sender ? 'text-blue-900' : 'text-neutral-900'
          }`}>
            {message.is_sender ? 'You' : message.sender_display_name || 'Anonymous'}
          </span>
          <span className="text-xs text-neutral-500">
            {formatTime(message.sent_at)}
          </span>
        </div>
        
        {/* Message content */}
        {message.type === 'image' ? (
          <div className="space-y-2">
            <img
              src={message.content}
              alt="Shared image"
              className="max-w-full max-h-64 rounded-lg border"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextElementSibling.style.display = 'block';
              }}
            />
            <div style={{ display: 'none' }} className="text-sm text-red-600 bg-red-50 p-2 rounded border">
              Failed to load image: {message.content}
            </div>
          </div>
        ) : (
          <div className="text-sm text-neutral-800 whitespace-pre-wrap">
            {message.content}
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageItem;