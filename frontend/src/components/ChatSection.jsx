import React, { useState, useEffect } from 'react';
import { getCommunityChatRooms, createChatRoom } from '../api/chat';
import ChatRoom from './ChatRoom';
import { Button } from './ui/button';
import { Input } from './ui/input';

const ChatSection = ({ communityId, isVisible }) => {
  const [chatRooms, setChatRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showCreateRoom, setShowCreateRoom] = useState(false);
  const [newRoomTitle, setNewRoomTitle] = useState('');
  const [createLoading, setCreateLoading] = useState(false);

  // Fetch chat rooms when section becomes visible
  const fetchChatRooms = async () => {
    if (!isVisible) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const rooms = await getCommunityChatRooms(communityId);
      setChatRooms(rooms);
      
      // Auto-select first room (usually "General")
      if (rooms.length > 0 && !selectedRoom) {
        setSelectedRoom(rooms[0]);
      }
    } catch (err) {
      console.error('Failed to fetch chat rooms:', err);
      setError(err.detail || 'Failed to load chat rooms');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isVisible) {
      fetchChatRooms();
    }
  }, [isVisible, communityId]);

  // Handle creating new chat room
  const handleCreateRoom = async (e) => {
    e.preventDefault();
    
    if (!newRoomTitle.trim()) return;

    setCreateLoading(true);
    
    try {
      const roomData = {
        title: newRoomTitle.trim(),
        community_id: parseInt(communityId)
      };

      const newRoom = await createChatRoom(roomData);
      
      // Add to rooms list and select it
      setChatRooms(prev => [...prev, newRoom]);
      setSelectedRoom(newRoom);
      
      // Reset form
      setNewRoomTitle('');
      setShowCreateRoom(false);
    } catch (err) {
      console.error('Failed to create chat room:', err);
      setError(err.detail || 'Failed to create chat room');
    } finally {
      setCreateLoading(false);
    }
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className="mt-4 pt-4 border-t border-neutral-200">
      <div className="flex gap-4" style={{ minHeight: '600px' }}>
        {/* Chat rooms sidebar */}
        <div className="w-64 bg-neutral-50 border border-neutral-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold text-neutral-900">Chat Rooms</h4>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowCreateRoom(!showCreateRoom)}
              className="h-7 w-7 p-0 text-xs"
            >
              +
            </Button>
          </div>

          {/* Create room form */}
          {showCreateRoom && (
            <form onSubmit={handleCreateRoom} className="mb-4 p-3 bg-white border rounded-md">
              <Input
                type="text"
                value={newRoomTitle}
                onChange={(e) => setNewRoomTitle(e.target.value)}
                placeholder="Room name..."
                className="mb-2 text-sm"
                maxLength={50}
                disabled={createLoading}
              />
              <div className="flex gap-2">
                <Button
                  type="submit"
                  size="sm"
                  disabled={createLoading || !newRoomTitle.trim()}
                  className="flex-1 text-xs"
                >
                  {createLoading ? 'Creating...' : 'Create'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setShowCreateRoom(false);
                    setNewRoomTitle('');
                  }}
                  className="text-xs"
                >
                  Cancel
                </Button>
              </div>
            </form>
          )}

          {loading && (
            <div className="text-center py-4 text-sm text-neutral-500">
              Loading rooms...
            </div>
          )}
          
          {error && (
            <div className="text-center py-4">
              <div className="text-red-600 text-sm mb-2">{error}</div>
              <button
                onClick={fetchChatRooms}
                className="text-blue-600 hover:text-blue-800 underline text-xs"
              >
                Try again
              </button>
            </div>
          )}
          
          {!loading && !error && (
            <div className="space-y-1">
              {chatRooms.map((room) => (
                <button
                  key={room.chat_id}
                  onClick={() => setSelectedRoom(room)}
                  className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                    selectedRoom?.chat_id === room.chat_id
                      ? 'bg-blue-100 text-blue-900 font-medium'
                      : 'hover:bg-neutral-100 text-neutral-700'
                  }`}
                >
                  # {room.title}
                </button>
              ))}
              
              {chatRooms.length === 0 && (
                <div className="text-center py-4 text-sm text-neutral-500">
                  No chat rooms yet.
                  <div className="mt-1">
                    <button
                      onClick={() => setShowCreateRoom(true)}
                      className="text-blue-600 hover:text-blue-800 underline"
                    >
                      Create the first one!
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Chat room content */}
        <ChatRoom chatRoom={selectedRoom} />
      </div>
    </div>
  );
};

export default ChatSection;