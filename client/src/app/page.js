'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, Plus, User, LogIn, Shield, LogOut } from 'lucide-react';
import NotificationDropdown from '../components/NotificationDropdown';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../utils/api';

export default function Home() {
  const { user, logout } = useAuth();
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [popularTags, setPopularTags] = useState([]);
  const [selectedTag, setSelectedTag] = useState('');

  useEffect(() => {
    fetchQuestions();
    if (user) {
      fetchUnreadNotifications();
    }
    fetchPopularTags(); // Fetch tags when component loads
  }, [sortBy, selectedTag, searchTerm, user]);

  const fetchQuestions = async () => {
    try {
      const params = new URLSearchParams({
        sort: sortBy,
        limit: 20
      });

      if (selectedTag) {
        params.append('tag', selectedTag);
      }

      if (searchTerm) {
        params.append('search', searchTerm);
      }

      const data = await api(`/questions?${params}`);
      setQuestions(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching questions:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPopularTags = async () => {
    try {
      const data = await api('/questions/tags/popular');
      setPopularTags(data);
    } catch (error) {
      console.error('Error fetching popular tags:', error);
    }
  };

  const fetchUnreadNotifications = async () => {
    try {
      const data = await api('/notifications/unread-count');
      setUnreadNotifications(data.count);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      setUnreadNotifications(0);
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchQuestions();
  };

  const handleSortChange = (e) => {
    setSortBy(e.target.value);
  };

  const handleTagClick = (tag) => {
    setSelectedTag(selectedTag === tag ? '' : tag);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-lg border-b border-purple-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/" className="text-3xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent drop-shadow-sm">
                StackIt
              </Link>
            </div>

            {/* Search Bar */}
            <div className="flex-1 max-w-2xl mx-8">
              <form onSubmit={handleSearch} className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search questions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white text-gray-900 placeholder-gray-500"
                />
              </form>
            </div>

            {/* Navigation */}
            <div className="flex items-center space-x-4">
              {user ? (
                <>
                  <Link
                    href="/ask"
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Ask Question
                  </Link>

                  <NotificationDropdown />

                  <div className="flex items-center space-x-2">
                    {user.isAdmin && (
                      <Link
                        href="/admin"
                        className="flex items-center px-3 py-1 text-sm text-gray-600 hover:text-gray-900"
                      >
                        <Shield className="h-4 w-4 mr-1" />
                        Admin
                      </Link>
                    )}
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-medium">
                        {user.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <span className="text-gray-700">{user.name}</span>
                    <button
                      onClick={handleLogout}
                      className="flex items-center px-3 py-1 text-sm text-gray-600 hover:text-gray-900"
                      title="Logout"
                    >
                      <LogOut className="h-4 w-4" />
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-900"
                  >
                    <LogIn className="h-4 w-4 mr-2" />
                    Log In
                  </Link>
                  <Link
                    href="/register"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Questions List */}
          <div className="flex-1">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold text-gray-900">
                Questions
                {selectedTag && (
                  <span className="ml-2 text-lg font-normal text-gray-600">
                    tagged with "{selectedTag}"
                  </span>
                )}
              </h1>
              <div className="flex space-x-2">
                <select
                  value={sortBy}
                  onChange={handleSortChange}
                  className="px-3 py-2 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 bg-white text-gray-900"
                >
                  <option value="newest">Newest</option>
                  <option value="votes">Most Voted</option>
                  <option value="views">Most Viewed</option>
                  <option value="unanswered">Unanswered</option>
                </select>
              </div>
            </div>

            {loading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="bg-white p-6 rounded-lg shadow-sm animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
                    <div className="flex space-x-2">
                      <div className="h-6 bg-gray-200 rounded w-16"></div>
                      <div className="h-6 bg-gray-200 rounded w-20"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {questions.length === 0 ? (
                  <div className="bg-white p-8 rounded-lg shadow-sm text-center">
                    <p className="text-gray-600 mb-4">
                      {searchTerm || selectedTag
                        ? 'No questions found matching your criteria.'
                        : 'No questions available yet.'
                      }
                    </p>
                    {user && (
                      <Link
                        href="/ask"
                        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Ask the first question
                      </Link>
                    )}
                  </div>
                ) : (
                  questions.map((question) => (
                    <div key={question._id} className="bg-white/90 backdrop-blur-sm p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-purple-100 hover:border-purple-200 group">
                      <Link href={`/questions/${question._id}`}>
                        <h2 className="text-xl font-bold text-gray-900 hover:text-purple-600 mb-3 group-hover:text-purple-700 transition-colors">
                          {question.title}
                        </h2>
                      </Link>
                      <p className="text-gray-600 mb-4 line-clamp-2 leading-relaxed">
                        {question.description.replace(/<[^>]*>/g, '').substring(0, 200)}...
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <div className="flex items-center space-x-1">
                            <User className="h-4 w-4" />
                            <span className="font-medium">{question.authorId?.name || question.authorId?.username || 'Anonymous'}</span>
                          </div>
                          <span className="text-gray-400">•</span>
                          <span>{formatDate(question.createdAt)}</span>
                          <span className="text-gray-400">•</span>
                          <span className="font-medium text-purple-600">{question.votes || 0} votes</span>
                          {question.acceptedAnswer && (
                            <span className="inline-flex items-center px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium">
                              ✓ Answered
                            </span>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-1 justify-end">
                          {question.tags.map((tag) => (
                            <span
                              key={tag}
                              onClick={() => handleTagClick(tag)}
                              className="px-3 py-1 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 text-xs rounded-full font-medium hover:from-purple-200 hover:to-pink-200 cursor-pointer transition-all duration-200"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="w-80">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Popular Tags</h3>
              <div className="space-y-2">
                {popularTags.length === 0 ? (
                  <p className="text-gray-500 text-sm">No tags available</p>
                ) : (
                  popularTags.map((tag) => (
                    <button
                      key={tag._id}
                      onClick={() => handleTagClick(tag._id)}
                      className={`flex items-center justify-between text-sm w-full text-left p-2 rounded hover:bg-gray-50 ${selectedTag === tag._id ? 'bg-blue-50 text-blue-600' : 'text-gray-600'
                        }`}
                    >
                      <span className="capitalize">{tag._id}</span>
                      <span className="text-gray-400">{tag.count}</span>
                    </button>
                  ))
                )}
              </div>
              {selectedTag && (
                <button
                  onClick={() => setSelectedTag('')}
                  className="mt-4 w-full text-center text-sm text-blue-600 hover:text-blue-700"
                >
                  Clear filter
                </button>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
