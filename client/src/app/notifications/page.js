'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Bell, Check, X, ArrowLeft, Trash2 } from 'lucide-react';
import { api } from '../../utils/api';

export default function NotificationsPage() {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [unreadCount, setUnreadCount] = useState(0);
    const router = useRouter();

    useEffect(() => {
        checkAuth();
    }, []);

    useEffect(() => {
        if (user) {
            fetchNotifications();
            fetchUnreadCount();
        }
    }, [user, currentPage]);

    const checkAuth = async () => {
        try {
            const userData = await api('/auth/me');
            setUser(userData.user);
        } catch (error) {
            router.push('/login');
        }
    };

    const fetchNotifications = async () => {
        try {
            const data = await api(`/notifications/${user._id}`);
            setNotifications(data);
            setTotalPages(1); // Simple pagination for now
        } catch (error) {
            console.error('Error fetching notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchUnreadCount = async () => {
        try {
            const data = await api('/notifications/unread-count');
            setUnreadCount(data.count);
        } catch (error) {
            console.error('Error fetching unread count:', error);
        }
    };

    const markAsRead = async (notificationId) => {
        try {
            await api(`/notifications/${notificationId}/read`, {
                method: 'PUT'
            });
            setNotifications(notifications.map(notification =>
                notification._id === notificationId
                    ? { ...notification, read: true }
                    : notification
            ));
            fetchUnreadCount();
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    };

    const markAllAsRead = async () => {
        try {
            await api('/notifications/read-all', {
                method: 'PUT'
            });
            setNotifications(notifications.map(notification => ({ ...notification, read: true })));
            setUnreadCount(0);
        } catch (error) {
            console.error('Error marking all notifications as read:', error);
        }
    };

    const deleteNotification = async (notificationId) => {
        try {
            await api(`/notifications/${notificationId}`, {
                method: 'DELETE'
            });
            setNotifications(notifications.filter(notification => notification._id !== notificationId));
            fetchUnreadCount();
        } catch (error) {
            console.error('Error deleting notification:', error);
        }
    };

    const formatTimeAgo = (dateString) => {
        const now = new Date();
        const date = new Date(dateString);
        const diffInSeconds = Math.floor((now - date) / 1000);

        if (diffInSeconds < 60) return 'just now';
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
        return `${Math.floor(diffInSeconds / 86400)}d ago`;
    };

    const getNotificationIcon = (type) => {
        switch (type) {
            case 'answer':
                return '💬';
            case 'vote':
                return '👍';
            case 'mention':
                return '@';
            case 'accept':
                return '✅';
            default:
                return '🔔';
        }
    };

    const handleNotificationClick = (notification) => {
        if (!notification.read) {
            markAsRead(notification._id);
        }
        if (notification.link) {
            window.location.href = notification.link;
        }
    };

    if (!user) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-2 text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col items-center bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 py-12">
            <div className="w-full max-w-2xl p-8 bg-white rounded-2xl shadow-xl border border-purple-100">
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-3xl font-bold text-purple-700 drop-shadow">Notifications</h1>
                    <span className="bg-pink-100 text-pink-700 px-3 py-1 rounded-full font-semibold text-sm">Unread: {unreadCount}</span>
                </div>
                {loading ? (
                    <div className="text-center text-purple-500">Loading...</div>
                ) : notifications.length === 0 ? (
                    <div className="text-center text-gray-500 py-8">No notifications found.</div>
                ) : (
                    <ul className="space-y-4">
                        {notifications.map((notification) => (
                            <li key={notification._id} className={`p-4 rounded-lg shadow border ${notification.read ? 'bg-purple-50' : 'bg-pink-50 border-pink-200'}`}>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Bell className="text-purple-400 h-5 w-5" />
                                        <span className="font-semibold text-purple-700">{notification.type}</span>
                                    </div>
                                    <div className="flex gap-2">
                                        {!notification.read && (
                                            <button onClick={() => markAsRead(notification._id)} className="px-2 py-1 bg-gradient-to-r from-pink-400 to-purple-400 text-white rounded hover:from-pink-500 hover:to-purple-500 transition text-xs font-bold">Mark as read</button>
                                        )}
                                        <button onClick={() => deleteNotification(notification._id)} className="px-2 py-1 bg-gradient-to-r from-purple-400 to-blue-400 text-white rounded hover:from-purple-500 hover:to-blue-500 transition text-xs font-bold">Delete</button>
                                    </div>
                                </div>
                                <div className="mt-2 text-gray-600 text-sm">{notification.message}</div>
                                <div className="mt-1 text-xs text-gray-400">{new Date(notification.createdAt).toLocaleString()}</div>
                            </li>
                        ))}
                    </ul>
                )}
                {/* Pagination */}
                <div className="flex justify-center mt-8 gap-2">
                    <button
                        className="px-4 py-2 rounded-lg bg-gradient-to-r from-pink-400 to-purple-400 text-white font-bold disabled:opacity-50"
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage(currentPage - 1)}
                    >
                        Previous
                    </button>
                    <span className="px-4 py-2 text-purple-700 font-bold">Page {currentPage} of {totalPages}</span>
                    <button
                        className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-400 to-blue-400 text-white font-bold disabled:opacity-50"
                        disabled={currentPage === totalPages}
                        onClick={() => setCurrentPage(currentPage + 1)}
                    >
                        Next
                    </button>
                </div>
            </div>
        </div>
    );
}