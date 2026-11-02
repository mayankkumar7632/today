import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_ORIGIN } from '../services/api';

const getHeaders = () => {
  const token = localStorage.getItem('kaamsetu_token');
  return {
    ...(token && { Authorization: `Bearer ${token}` })
  };
};

const timeAgo = (value) => {
  const seconds = Math.max(0, Math.floor((Date.now() - new Date(value).getTime()) / 1000));
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hr ago`;
  return `${Math.floor(hours / 24)} d ago`;
};

const NotificationBell = () => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);

  const loadUnreadCount = async () => {
    try {
      const response = await fetch(`${API_ORIGIN}/api/notifications/unread-count`, { headers: getHeaders() });
      const data = await response.json();
      if (response.ok) setUnreadCount(data.count || 0);
    } catch (error) {
      console.error('Could not load unread notification count:', error.message);
    }
  };

  const loadNotifications = async () => {
    try {
      const response = await fetch(`${API_ORIGIN}/api/notifications?limit=20`, { headers: getHeaders() });
      const data = await response.json();
      if (response.ok) setNotifications(data.data || []);
    } catch (error) {
      console.error('Could not load notifications:', error.message);
    }
  };

  useEffect(() => {
    loadUnreadCount();
    const interval = window.setInterval(loadUnreadCount, 30000);
    return () => window.clearInterval(interval);
  }, []);

  const toggleDropdown = () => {
    const nextOpen = !open;
    setOpen(nextOpen);
    if (nextOpen) loadNotifications();
  };

  const markRead = async (notification) => {
    const wasUnread = !(notification.read || notification.isRead);
    if (!wasUnread) {
      setOpen(false);
      if (notification.link) navigate(notification.link);
      return;
    }
    try {
      const response = await fetch(`${API_ORIGIN}/api/notifications/${notification._id}/read`, {
        method: 'PATCH',
        headers: getHeaders()
      });
      if (!response.ok) throw new Error(`Request failed with status ${response.status}`);
      setNotifications((items) => items.map((item) => (
        item._id === notification._id ? { ...item, read: true, isRead: true } : item
      )));
      setUnreadCount((count) => Math.max(0, count - 1));
    } catch (error) {
      console.error('Could not mark notification read:', error.message);
    } finally {
      setOpen(false);
      if (notification.link) navigate(notification.link);
    }
  };

  const markAllRead = async () => {
    try {
      await fetch(`${API_ORIGIN}/api/notifications/read-all`, {
        method: 'PATCH',
        headers: getHeaders()
      });
      setNotifications((items) => items.map((item) => ({ ...item, read: true, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Could not mark notifications read:', error.message);
    }
  };

  return (
    <div className="notification-bell">
      <button className="notification-bell-button" onClick={toggleDropdown} aria-label="Notifications">
        {'\uD83D\uDD14'}
        {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
      </button>
      {open && (
        <div className="notification-dropdown">
          <div className="notification-dropdown-header">
            <strong>Notifications</strong>
            <button type="button" onClick={markAllRead}>Mark all as read</button>
          </div>
          {notifications.length === 0 ? (
            <div className="notification-empty">No notifications yet</div>
          ) : notifications.map((notification) => (
            <button
              type="button"
              className={`notification-item ${(notification.read || notification.isRead) ? '' : 'unread'}`}
              key={notification._id}
              onClick={() => markRead(notification)}
            >
              <strong>{notification.title}</strong>
              <span>{notification.message}</span>
              <small>{timeAgo(notification.createdAt)}</small>
            </button>
          ))}
          <button type="button" className="notification-view-all" onClick={() => { setOpen(false); navigate('/notifications'); }}>
            View all
          </button>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
