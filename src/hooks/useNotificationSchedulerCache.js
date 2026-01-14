import { useState, useEffect, useCallback } from 'react';

const NOTIFICATION_SCHEDULER_CACHE_KEY = 'wellnessz_notification_scheduler_history';


export function useNotificationSchedulerCache() {
  const [cache, setCache] = useState(() => {
    try {
      const cached = localStorage.getItem(NOTIFICATION_SCHEDULER_CACHE_KEY);
      if (cached) {
        return JSON.parse(cached);
      }
    } catch (error) {
    }

    return { notifications: [] };
  });

  useEffect(() => {
    try {
      localStorage.setItem(NOTIFICATION_SCHEDULER_CACHE_KEY, JSON.stringify(cache));
    } catch (error) {
    }
  }, [cache]);

  const addNotificationToCache = useCallback((notificationData, context = 'notifications') => {
    const newNotification = {
      _id: notificationData._id,
      id: `cached_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      subject: notificationData.subject || '',
      message: notificationData.message || '',
      notificationType: notificationData.notificationType || 'schedule',
      time: notificationData.time || '',
      date: notificationData.date || '',
      reocurrence: notificationData.reocurrence || [],
      clients: notificationData.clients || [],
      clientNames: notificationData.clientNames || [],
      context: context,
      createdAt: Date.now()
    };

    setCache(prevCache => ({
      notifications: [newNotification, ...prevCache.notifications].slice(0, 50)
    }));

    return newNotification;
  }, []);

  const getCachedNotifications = useCallback(() => {
    return cache.notifications || [];
  }, [cache]);

  const getCachedNotificationsForClient = useCallback((clientId) => {
    if (!clientId) return cache.notifications || [];

    return (cache.notifications || []).filter(notification =>
      notification.clients && notification.clients.includes(clientId)
    );
  }, [cache]);

  const getCachedNotificationsByContext = useCallback((context) => {
    return (cache.notifications || []).filter(notification =>
      notification.context === context
    );
  }, [cache]);

  const getCachedNotificationsForClientByContext = useCallback((clientId, context) => {
    if (!clientId) return getCachedNotificationsByContext(context);

    return (cache.notifications || []).filter(notification =>
      notification.context === context &&
      notification.clients &&
      notification.clients.includes(clientId)
    );
  }, [cache]);

  const clearCache = useCallback(() => {
    setCache({ notifications: [] });
  }, []);

  const removeNotificationFromCache = useCallback((notificationId) => {
    setCache(prevCache => ({
      notifications: prevCache.notifications.filter(n => n.id !== notificationId)
    }));
  }, []);

  return {
    addNotificationToCache,
    getCachedNotifications,
    getCachedNotificationsForClient,
    getCachedNotificationsByContext,
    getCachedNotificationsForClientByContext,
    clearCache,
    removeNotificationFromCache,
    cacheSize: cache.notifications.length
  };
}
