import React, { useState, useEffect } from 'react';
import { getCommunityMembers, updateMemberRole } from '../api/memberships';
import { Button } from './ui/button';

const MembersSection = ({ communityId, isVisible, currentUserRole, isOwner }) => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [updatingRoles, setUpdatingRoles] = useState({});

  const fetchMembers = async () => {
    if (!isVisible) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const result = await getCommunityMembers(communityId);
      setMembers(result.members);
    } catch (err) {
      console.error('Failed to fetch members:', err);
      setError(err.detail || 'Failed to load members');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isVisible) {
      fetchMembers();
    }
  }, [isVisible, communityId]);

  // Handle role change
  const handleRoleChange = async (targetUserId, newRole) => {
    setUpdatingRoles(prev => ({ ...prev, [targetUserId]: true }));
    
    try {
      await updateMemberRole(communityId, targetUserId, newRole);
      
      // Update local state
      setMembers(prev => prev.map(member => 
        member.user_id === targetUserId 
          ? { ...member, role: newRole }
          : member
      ));
    } catch (err) {
      console.error('Failed to update role:', err);
      setError(err.detail || 'Failed to update member role');
    } finally {
      setUpdatingRoles(prev => ({ ...prev, [targetUserId]: false }));
    }
  };

  // Check if current user can manage roles
  const canManageRoles = isOwner || currentUserRole === 'admin';

  // Get role badge color
  const getRoleBadgeColor = (role, isOwner) => {
    if (isOwner) return 'bg-purple-100 text-purple-800 border-purple-200';
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800 border-red-200';
      case 'moderator': return 'bg-orange-100 text-orange-800 border-orange-200';
      default: return 'bg-neutral-100 text-neutral-800 border-neutral-200';
    }
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className="mt-4 pt-4 border-t border-neutral-200">
      <h4 className="font-semibold text-neutral-900 mb-4">
        Community Members ({members.length})
      </h4>

      {loading && (
        <div className="text-center py-8 text-neutral-500">
          Loading members...
        </div>
      )}
      
      {error && (
        <div className="text-center py-4">
          <div className="text-red-600 mb-2">{error}</div>
          <button
            onClick={fetchMembers}
            className="text-blue-600 hover:text-blue-800 underline text-sm"
          >
            Try again
          </button>
        </div>
      )}
      
      {!loading && !error && (
        <div className="space-y-3">
          {members.map((member) => {
            const isUpdating = updatingRoles[member.user_id];
            const displayRole = member.is_owner ? 'Owner' : member.role;
            
            return (
              <div key={member.user_id} className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg border border-neutral-200">
                <div className="flex items-center gap-3">
                  {/* Avatar */}
                  <div className="w-10 h-10 rounded-full bg-neutral-200 flex items-center justify-center text-sm font-medium text-neutral-600">
                    {(member.user_display_name || 'U')[0].toUpperCase()}
                  </div>
                  
                  {/* User info */}
                  <div>
                    <div className="font-medium text-neutral-900">
                      {member.user_display_name || 'Anonymous'}
                    </div>
                    <div className="text-sm text-neutral-500">
                      Joined {new Date(member.joined_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                
                {/* Role and actions */}
                <div className="flex items-center gap-3">
                  {/* Role badge */}
                  <span className={`px-2 py-1 rounded text-xs font-medium border ${getRoleBadgeColor(member.role, member.is_owner)}`}>
                    {displayRole}
                  </span>
                  
                  {/* Role management dropdown */}
                  {canManageRoles && !member.is_owner && (
                    <select
                      value={member.role}
                      onChange={(e) => handleRoleChange(member.user_id, e.target.value)}
                      disabled={isUpdating}
                      className="text-sm border border-neutral-300 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="member">Member</option>
                      <option value="moderator">Moderator</option>
                      {isOwner && <option value="admin">Admin</option>}
                    </select>
                  )}
                  
                  {isUpdating && (
                    <div className="text-xs text-neutral-500">Updating...</div>
                  )}
                </div>
              </div>
            );
          })}
          
          {members.length === 0 && (
            <div className="text-center py-8 text-neutral-500">
              No members found.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MembersSection;