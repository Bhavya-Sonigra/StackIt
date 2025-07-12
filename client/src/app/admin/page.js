'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    Users,
    FileText,
    MessageSquare,
    BarChart3,
    Shield,
    Ban,
    Crown,
    UserCheck,
    Trash2,
    Search,
    Eye,
    Settings,
    ArrowLeft,
    Flag
} from 'lucide-react';
import { api } from '../../utils/api';
import { useAuth } from '../../contexts/AuthContext';

export default function AdminDashboard() {
    const { user, loading: authLoading } = useAuth();
    const [stats, setStats] = useState(null);
    const [users, setUsers] = useState([]);
    const [questions, setQuestions] = useState([]);
    const [answers, setAnswers] = useState([]);
    const [flaggedContent, setFlaggedContent] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');
    const [searchTerm, setSearchTerm] = useState('');
    const [notificationMessage, setNotificationMessage] = useState('');
    const [sendingNotification, setSendingNotification] = useState(false);
    const router = useRouter();

    useEffect(() => {
        if (authLoading) return;
        
        if (!user) {
            router.push('/login');
            return;
        }
        
        if (!user.isAdmin) {
            router.push('/');
            return;
        }
        
        fetchStats();
        fetchUsers();
        fetchQuestions();
        fetchFlaggedContent();
        setLoading(false);
    }, [user, authLoading, router]);
    
    // Fetch answers when questions change
    useEffect(() => {
        if (questions.length > 0) {
            fetchAnswers();
        }
    }, [questions]);

    const fetchStats = async () => {
        try {
            const data = await api('/admin/stats');
            setStats(data);
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    };

    const fetchUsers = async () => {
        try {
            const data = await api('/admin/users');
            setUsers(data);
        } catch (error) {
            console.error('Error fetching users:', error);
        }
    };

    const fetchQuestions = async () => {
        try {
            const data = await api('/questions');
            setQuestions(data);
        } catch (error) {
            console.error('Error fetching questions:', error);
        }
    };

    const fetchAnswers = async () => {
        try {
            // Only fetch answers if we have questions
            if (questions.length === 0) {
                setAnswers([]);
                return;
            }
            
            // Get answers for all questions
            const allAnswers = [];
            for (const question of questions) {
                try {
                    const answers = await api(`/answers/question/${question._id}`);
                    allAnswers.push(...answers);
                } catch (err) {
                    console.error('Error fetching answers for question:', question._id);
                }
            }
            setAnswers(allAnswers);
        } catch (error) {
            console.error('Error fetching answers:', error);
        }
    };

    const fetchFlaggedContent = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/admin/flagged-content', {
                credentials: 'include'
            });
            if (response.ok) {
                const data = await response.json();
                setFlaggedContent(data.content);
            }
        } catch (error) {
            console.error('Error fetching flagged content:', error);
        }
    };

    const handleBanUser = async (userId, banned) => {
        try {
            const endpoint = banned ? 'ban' : 'unban';
            await api(`/admin/users/${userId}/${endpoint}`, {
                method: 'PUT'
            });
            fetchUsers();
            fetchStats();
        } catch (error) {
            console.error('Error banning user:', error);
        }
    };

    const handleChangeRole = async (userId, role) => {
        try {
            await api(`/admin/users/${userId}/role`, {
                method: 'PUT',
                body: JSON.stringify({ role })
            });
            fetchUsers();
        } catch (error) {
            console.error('Error changing user role:', error);
        }
    };

    const handleDeleteContent = async (type, contentId) => {
        try {
            await api(`/admin/content/${type}/${contentId}`, {
                method: 'DELETE'
            });
            fetchFlaggedContent();
            fetchStats();
            fetchQuestions();
            fetchAnswers();
        } catch (error) {
            console.error('Error deleting content:', error);
        }
    };


    const handleFlagQuestion = async (questionId) => {
        try {
            // Flag question for review
            await api(`/questions/${questionId}/flag`, {
                method: 'POST'
            });
            fetchQuestions();
            console.log(`Question ${questionId} flagged for review`);
        } catch (error) {
            console.error('Error flagging question:', error);
        }
    };

    const handleDeleteAnswer = async (answerId) => {
        try {
            await api(`/admin/answers/${answerId}`, {
                method: 'DELETE'
            });
            // Update local state immediately
            setAnswers(prevAnswers => prevAnswers.filter(answer => answer._id !== answerId));
            fetchStats();
        } catch (error) {
            console.error('Error deleting answer:', error);
        }
    };
    
    const handleDeleteQuestion = async (questionId) => {
        try {
            await api(`/admin/questions/${questionId}`, {
                method: 'DELETE'
            });
            // Update local state immediately
            setQuestions(prevQuestions => prevQuestions.filter(question => question._id !== questionId));
            // Also remove related answers
            setAnswers(prevAnswers => prevAnswers.filter(answer => answer.questionId !== questionId));
            fetchStats();
        } catch (error) {
            console.error('Error deleting question:', error);
        }
    };

    const handleSendNotification = async (e) => {
        e.preventDefault();
        if (!notificationMessage.trim()) return;
        
        try {
            setSendingNotification(true);
            await api('/admin/notify-all', {
                method: 'POST',
                body: JSON.stringify({ 
                    message: notificationMessage,
                    type: 'announcement'
                })
            });
            setNotificationMessage('');
            alert('Notification sent to all users!');
        } catch (error) {
            console.error('Error sending notification:', error);
            alert('Failed to send notification');
        } finally {
            setSendingNotification(false);
        }
    };

    const filteredUsers = users.filter(user =>
        (user.name && user.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (user.username && user.username.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (user.email && user.email.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    if (authLoading || loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-2 text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

    if (!user || !user.isAdmin) {
        return null;
    }

    return (
        <div className="min-h-screen flex flex-col items-center bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 py-12">
            <div className="w-full max-w-5xl p-8 bg-white rounded-2xl shadow-xl border border-purple-100">
                <div className="flex items-center justify-between mb-8">
                    <button
                        onClick={() => router.push('/')}
                        className="flex items-center px-4 py-2 bg-gradient-to-r from-gray-400 to-gray-500 text-white rounded-lg hover:from-gray-500 hover:to-gray-600 transition-colors"
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Home
                    </button>
                    <h1 className="text-4xl font-bold text-purple-700 drop-shadow">Admin Dashboard</h1>
                    <div></div> {/* Spacer for centering */}
                </div>
                <div className="flex justify-center gap-4 mb-8">
                    {['overview', 'users', 'content', 'flagged'].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-6 py-2 rounded-lg font-bold text-lg transition shadow ${activeTab === tab ? 'bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 text-white' : 'bg-purple-100 text-purple-700 hover:bg-pink-100'}`}
                        >
                            {tab.charAt(0).toUpperCase() + tab.slice(1)}
                        </button>
                    ))}
                </div>
                {/* Overview Tab */}
                {activeTab === 'overview' && (
                    <div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                            {/* Example stat cards, replace with actual stats */}
                            <div className="p-6 rounded-xl bg-gradient-to-r from-pink-200 to-purple-200 shadow text-center">
                                <BarChart3 className="mx-auto text-purple-500 h-8 w-8 mb-2" />
                                <div className="text-2xl font-bold text-purple-700">{stats?.questions ?? 0}</div>
                                <div className="text-sm text-gray-500">Questions</div>
                            </div>
                            <div className="p-6 rounded-xl bg-gradient-to-r from-blue-200 to-purple-200 shadow text-center">
                                <Users className="mx-auto text-blue-500 h-8 w-8 mb-2" />
                                <div className="text-2xl font-bold text-blue-700">{stats?.users ?? 0}</div>
                                <div className="text-sm text-gray-500">Users</div>
                            </div>
                            <div className="p-6 rounded-xl bg-gradient-to-r from-pink-200 to-blue-200 shadow text-center">
                                <MessageSquare className="mx-auto text-pink-500 h-8 w-8 mb-2" />
                                <div className="text-2xl font-bold text-pink-700">{stats?.answers ?? 0}</div>
                                <div className="text-sm text-gray-500">Answers</div>
                            </div>
                        </div>
                        
                        {/* Send Notification to All Users */}
                        <div className="p-6 rounded-xl bg-gradient-to-r from-yellow-100 to-orange-100 shadow border border-yellow-200">
                            <h3 className="text-xl font-bold text-orange-700 mb-4">Send Notification to All Users</h3>
                            <form onSubmit={handleSendNotification} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-orange-700 mb-2">Message</label>
                                    <textarea
                                        value={notificationMessage}
                                        onChange={(e) => setNotificationMessage(e.target.value)}
                                        placeholder="Enter your message for all users..."
                                        className="w-full px-4 py-2 border border-orange-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 bg-white"
                                        rows="3"
                                        required
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={sendingNotification || !notificationMessage.trim()}
                                    className="w-full py-2 px-4 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg hover:from-orange-600 hover:to-red-600 transition disabled:opacity-50 disabled:cursor-not-allowed font-bold"
                                >
                                    {sendingNotification ? 'Sending...' : 'Send Notification'}
                                </button>
                            </form>
                        </div>
                    </div>
                )}
                {/* Users Tab */}
                {activeTab === 'users' && (
                    <div className="mb-8">
                        <h2 className="text-2xl font-bold text-purple-700 mb-4">Users</h2>
                        <div className="overflow-x-auto">
                            <table className="min-w-full bg-white rounded-lg shadow">
                                <thead className="bg-purple-100">
                                    <tr>
                                        <th className="px-4 py-2 text-left text-purple-700">Username</th>
                                        <th className="px-4 py-2 text-left text-purple-700">Email</th>
                                        <th className="px-4 py-2 text-left text-purple-700">Role</th>
                                        <th className="px-4 py-2 text-left text-purple-700">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map(user => (
                                        <tr key={user._id} className="border-b">
                                            <td className="px-4 py-2">{user.name || user.username || 'N/A'}</td>
                                            <td className="px-4 py-2">{user.email}</td>
                                            <td className="px-4 py-2">{user.isAdmin ? 'Admin' : 'User'}</td>
                                            <td className="px-4 py-2">
                                                <button 
                                                    onClick={() => handleBanUser(user._id, !user.banned)}
                                                    className={`px-3 py-1 text-white rounded hover:opacity-80 transition text-xs font-bold mr-2 ${
                                                        user.banned 
                                                            ? 'bg-green-500 hover:bg-green-600' 
                                                            : 'bg-red-500 hover:bg-red-600'
                                                    }`}
                                                >
                                                    {user.banned ? 'Unban' : 'Ban'}
                                                </button>
                                                <button 
                                                    onClick={() => handleChangeRole(user._id, user.isAdmin ? 'user' : 'admin')}
                                                    className="px-3 py-1 bg-gradient-to-r from-purple-400 to-blue-400 text-white rounded hover:from-purple-500 hover:to-blue-500 transition text-xs font-bold"
                                                >
                                                    {user.isAdmin ? 'Remove Admin' : 'Make Admin'}
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
                {/* Content Management Tab */}
                {activeTab === 'content' && (
                    <div className="mb-8">
                        <h2 className="text-2xl font-bold text-purple-700 mb-4">Content Management</h2>
                        
                        {/* Questions Section */}
                        <div className="mb-8">
                            <h3 className="text-xl font-semibold text-purple-600 mb-4">Questions ({questions.length})</h3>
                            <div className="space-y-4">
                                {questions.length === 0 ? (
                                    <div className="text-center text-gray-500 py-8">No questions found.</div>
                                ) : (
                                    questions.map(question => (
                                        <div key={question._id} className="p-4 rounded-lg shadow border bg-blue-50 border-blue-200">
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <div className="font-semibold text-purple-700 mb-2">{question.title}</div>
                                                    <div className="text-sm text-gray-600 mb-2">
                                                        By: {question.authorId?.name || question.authorId?.username || 'Unknown'} • 
                                                        {new Date(question.createdAt).toLocaleDateString()}
                                                    </div>
                                                    <div className="text-sm text-gray-500 mb-2">
                                                        Tags: {question.tags?.join(', ') || 'None'}
                                                    </div>
                                                    <div className="text-sm text-gray-700 line-clamp-3">
                                                        {question.description?.replace(/<[^>]*>/g, '').substring(0, 150)}...
                                                    </div>
                                                </div>
                                                <div className="flex gap-2 ml-4">
                                                    <button 
                                                        onClick={() => window.open(`/questions/${question._id}`, '_blank')}
                                                        className="px-3 py-1 bg-gradient-to-r from-blue-400 to-purple-400 text-white rounded hover:from-blue-500 hover:to-purple-500 transition text-xs font-bold"
                                                    >
                                                        <Eye className="h-3 w-3 mr-1" />
                                                        View
                                                    </button>
                                                    <button 
                                                        onClick={() => handleFlagQuestion(question._id)}
                                                        className="px-3 py-1 bg-gradient-to-r from-yellow-400 to-orange-400 text-white rounded hover:from-yellow-500 hover:to-orange-500 transition text-xs font-bold"
                                                    >
                                                        <Flag className="h-3 w-3 mr-1" />
                                                        Flag
                                                    </button>
                                                    <button 
                                                        onClick={() => handleDeleteQuestion(question._id)}
                                                        className="px-3 py-1 bg-gradient-to-r from-red-400 to-pink-400 text-white rounded hover:from-red-500 hover:to-pink-500 transition text-xs font-bold"
                                                    >
                                                        <Trash2 className="h-3 w-3 mr-1" />
                                                        Delete
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                        
                        {/* Answers Section */}
                        <div className="mb-8">
                            <h3 className="text-xl font-semibold text-purple-600 mb-4">Answers ({answers.length})</h3>
                            <div className="space-y-4">
                                {answers.length === 0 ? (
                                    <div className="text-center text-gray-500 py-8">No answers found.</div>
                                ) : (
                                    answers.map(answer => (
                                        <div key={answer._id} className="p-4 rounded-lg shadow border bg-green-50 border-green-200">
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <div className="text-sm text-gray-600 mb-2">
                                                        By: {answer.authorId?.name || answer.authorId?.username || 'Unknown'} • 
                                                        {new Date(answer.createdAt).toLocaleDateString()} • 
                                                        Votes: {answer.votes || 0}
                                                    </div>
                                                    <div className="text-sm text-gray-700 line-clamp-3">
                                                        {answer.description?.replace(/<[^>]*>/g, '').substring(0, 200)}...
                                                    </div>
                                                </div>
                                                <div className="flex gap-2 ml-4">
                                                    <button 
                                                        onClick={() => window.open(`/questions/${answer.questionId}`, '_blank')}
                                                        className="px-3 py-1 bg-gradient-to-r from-green-400 to-blue-400 text-white rounded hover:from-green-500 hover:to-blue-500 transition text-xs font-bold"
                                                    >
                                                        View
                                                    </button>
                                                    <button 
                                                        onClick={() => handleDeleteAnswer(answer._id)}
                                                        className="px-3 py-1 bg-gradient-to-r from-red-400 to-pink-400 text-white rounded hover:from-red-500 hover:to-pink-500 transition text-xs font-bold"
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                )}
                
                {/* Flagged Tab */}
                {activeTab === 'flagged' && (
                    <div className="mb-8">
                        <h2 className="text-2xl font-bold text-purple-700 mb-4">Flagged Content</h2>
                        <div className="space-y-4">
                            {flaggedContent.length === 0 ? (
                                <div className="text-center text-gray-500 py-8">No flagged content found.</div>
                            ) : (
                                flaggedContent.map(item => (
                                    <div key={item._id} className="p-4 rounded-lg shadow border bg-pink-50 border-pink-200">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="font-semibold text-purple-700 mb-2">{item.title}</div>
                                                <div className="text-sm text-gray-600 mb-2">
                                                    By: {item.author} • {new Date(item.createdAt).toLocaleDateString()}
                                                </div>
                                                <div className="text-sm text-gray-500">{item.reason}</div>
                                            </div>
                                            <div className="flex gap-2 ml-4">
                                                <button 
                                                    onClick={() => window.open(`/questions/${item._id}`, '_blank')}
                                                    className="px-3 py-1 bg-gradient-to-r from-blue-400 to-purple-400 text-white rounded hover:from-blue-500 hover:to-purple-500 transition text-xs font-bold"
                                                >
                                                    View
                                                </button>
                                                <button 
                                                    onClick={() => handleDeleteContent('questions', item._id)}
                                                    className="px-3 py-1 bg-gradient-to-r from-red-400 to-pink-400 text-white rounded hover:from-red-500 hover:to-pink-500 transition text-xs font-bold"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}