'use client';

import { useState, useEffect } from 'react';
import { api } from '../utils/api';

const UserMention = ({ onUserSelect, searchTerm = '' }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (searchTerm.length > 1) {
      searchUsers(searchTerm);
    } else {
      setUsers([]);
    }
  }, [searchTerm]);

  const searchUsers = async (term) => {
    setLoading(true);
    try {
      const response = await api(`/users/search?q=${encodeURIComponent(term)}`);
      setUsers(response);
    } catch (error) {
      console.error('Error searching users:', error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  if (searchTerm.length <= 1) return null;

  return (
    <div className="absolute z-10 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-40 overflow-y-auto">
      {loading ? (
        <div className="p-3 text-center text-gray-500">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      ) : users.length > 0 ? (
        <div className="py-1">
          {users.map((user) => (
            <button
              key={user._id}
              onClick={() => onUserSelect(user)}
              className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center space-x-2"
            >
              <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-medium">
                  {(user.name || user.username).charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <span className="font-medium text-gray-900">
                  {user.name || user.username}
                </span>
                {user.email && (
                  <span className="text-gray-500 text-sm ml-2">
                    {user.email}
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>
      ) : (
        <div className="p-3 text-center text-gray-500 text-sm">
          No users found
        </div>
      )}
    </div>
  );
};

export default UserMention;
