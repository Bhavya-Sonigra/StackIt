'use client';

import { useState, useEffect, useRef } from 'react';
import { Bell, X, Check } from 'lucide-react';
import { api } from '../utils/api';
import { useAuth } from '../contexts/AuthContext';

export default function NotificationDropdown() {
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const dropdownRef = useRef(null);
    const { user } = useAuth();

    useEffect(() => {
        if (user) {
            fetchNotifications();
            fetchUnreadCount();
        }
        // Optionally, clear notifications if user logs out
        if (!user) {
            setNotifications([]);
            setUnreadCount(0);
        }

        // Close dropdown when clicking outside
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [user]);

    const fetchNotifications = async () => {
        try {
            if (!user) return; // Only fetch if user is authenticated
            const data = await api(`/notifications/${user._id}`);
            setNotifications(data);
        } catch (error) {
            console.error('Error fetching notifications:', error);
        }
    };

    const fetchUnreadCount = async () => {
        try {
            if (!user) return; // Only fetch if user is authenticated
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
        setLoading(true);
        try {
            await api('/notifications/read-all', {
                method: 'PUT'
            });
            setNotifications(notifications.map(notification => ({ ...notification, read: true })));
            setUnreadCount(0);
        } catch (error) {
            console.error('Error marking all notifications as read:', error);
        } finally {
            setLoading(false);
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

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                    <div className="p-4 border-b border-gray-200">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
                            {unreadCount > 0 && (
                                <button
                                    onClick={markAllAsRead}
                                    disabled={loading}
                                    className="text-sm text-blue-600 hover:text-blue-700 disabled:opacity-50"
                                >
                                    {loading ? 'Marking...' : 'Mark all read'}
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="max-h-96 overflow-y-auto">
                        {notifications.length === 0 ? (
                            <div className="p-4 text-center text-gray-500">
                                No notifications yet
                            </div>
                        ) : (
                            notifications.map((notification) => (
                                <div
                                    key={notification._id}
                                    className={`p-4 border-b border-gray-100 hover:bg-gray-50 ${!notification.read ? 'bg-blue-50' : ''
                                        }`}
                                >
                                    <div className="flex items-start space-x-3">
                                        <div className="flex-shrink-0 w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-sm">
                                            {getNotificationIcon(notification.type)}
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-gray-900">
                                                {notification.type}
                                            </p>
                                            <p className="text-sm text-gray-600 mt-1">
                                                {notification.message}
                                            </p>
                                            <p className="text-xs text-gray-400 mt-2">
                                                {formatTimeAgo(notification.createdAt)}
                                            </p>
                                        </div>

                                        <div className="flex-shrink-0 flex space-x-1">
                                            {!notification.read && (
                                                <button
                                                    onClick={() => markAsRead(notification._id)}
                                                    className="p-1 text-gray-400 hover:text-gray-600"
                                                    title="Mark as read"
                                                >
                                                    <Check className="h-3 w-3" />
                                                </button>
                                            )}
                                            <button
                                                onClick={() => deleteNotification(notification._id)}
                                                className="p-1 text-gray-400 hover:text-red-600"
                                                title="Delete"
                                            >
                                                <X className="h-3 w-3" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {notifications.length > 0 && (
                        <div className="p-4 border-t border-gray-200">
                            <button
                                onClick={() => {
                                    // Navigate to full notifications page
                                    window.location.href = '/notifications';
                                }}
                                className="w-full text-center text-sm text-blue-600 hover:text-blue-700"
                            >
                                View all notifications
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
} 