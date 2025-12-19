import React, { useState } from 'react';
import { 
  Bell, 
  CheckCircle, 
  AlertTriangle, 
  Info, 
  Check, 
  Filter,
  Settings,
  Clock,
  Mail,
  MessageSquare,
  Shield,
  Trash2,
  ExternalLink,
  X
} from 'lucide-react';

const Notifications = () => {
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: 'success',
      title: 'Rapport résolu',
      message: 'Votre rapport #1234 a été résolu avec succès.',
      time: 'Il y a 2 heures',
      read: false,
      icon: CheckCircle,
      color: 'bg-accent-500/10 text-accent-500 border-accent-500/20'
    },
    {
      id: 2,
      type: 'warning',
      title: 'Action requise',
      message: 'Un modérateur a besoin de plus d\'informations sur votre rapport #5678.',
      time: 'Il y a 5 heures',
      read: false,
      icon: AlertTriangle,
      color: 'bg-warning-500/10 text-warning-500 border-warning-500/20'
    },
    {
      id: 3,
      type: 'info',
      title: 'Nouvelle mise à jour',
      message: 'De nouvelles fonctionnalités sont disponibles sur la plateforme.',
      time: 'Il y a 1 jour',
      read: true,
      icon: Info,
      color: 'bg-primary-500/10 text-primary-500 border-primary-500/20'
    },
    {
      id: 4,
      type: 'message',
      title: 'Nouveau message',
      message: 'Vous avez reçu un message de la part d\'un administrateur.',
      time: 'Il y a 2 jours',
      read: true,
      icon: MessageSquare,
      color: 'bg-secondary-500/10 text-secondary-500 border-secondary-500/20'
    }
  ]);

  const [filter, setFilter] = useState('all');
  const [showSettings, setShowSettings] = useState(false);
  const [notificationSettings, setNotificationSettings] = useState({
    email: true,
    push: true,
    report_updates: true,
    community_news: true,
    messages: true,
    weekly_digest: false
  });

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !notification.read;
    if (filter === 'type') return notification.type === filter;
    return true;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (id) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, read: true }))
    );
  };

  const deleteNotification = (id) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const toggleSetting = (setting) => {
    setNotificationSettings(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-primary-50/20 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950 py-8 animate-fade-in">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* En-tête */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Bell className="text-primary-500" size={32} />
                {unreadCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-accent-500 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center animate-pulse-gentle">
                    {unreadCount}
                  </span>
                )}
              </div>
              <div>
                <h1 className="text-4xl font-bold text-neutral-900 dark:text-white mb-1">
                  Notifications
                </h1>
                <p className="text-neutral-600 dark:text-neutral-400">
                  {unreadCount > 0 
                    ? `${unreadCount} notification${unreadCount > 1 ? 's' : ''} non lue${unreadCount > 1 ? 's' : ''}`
                    : 'Toutes vos notifications sont à jour'}
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-all duration-200"
              >
                <Settings size={18} />
                <span className="font-medium">Paramètres</span>
              </button>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="flex items-center gap-2 px-4 py-2.5 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-all duration-200"
                >
                  <Check size={18} />
                  <span className="font-medium">Tout marquer comme lu</span>
                </button>
              )}
            </div>
          </div>

          {/* Paramètres des notifications */}
          {showSettings && (
            <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-glass dark:shadow-glass-lg p-6 mb-6 border border-neutral-100 dark:border-neutral-800 animate-slide-up">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-neutral-900 dark:text-white flex items-center gap-2">
                  <Settings size={20} />
                  Paramètres des notifications
                </h3>
                <button
                  onClick={() => setShowSettings(false)}
                  className="text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(notificationSettings).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between p-4 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
                    <div>
                      <p className="font-medium text-neutral-900 dark:text-white capitalize">
                        {key.replace('_', ' ')}
                      </p>
                      <p className="text-sm text-neutral-500 dark:text-neutral-400">
                        Recevoir des notifications par {key === 'email' ? 'email' : key === 'push' ? 'push' : 'ce type'}
                      </p>
                    </div>
                    <button
                      onClick={() => toggleSetting(key)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${
                        value ? 'bg-accent-500' : 'bg-neutral-300 dark:bg-neutral-700'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
                          value ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Filtres */}
          <div className="flex flex-wrap gap-2 mb-6">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                filter === 'all'
                  ? 'bg-primary-500 text-white'
                  : 'bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-700'
              }`}
            >
              Toutes
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 relative ${
                filter === 'unread'
                  ? 'bg-accent-500 text-white'
                  : 'bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-700'
              }`}
            >
              Non lues
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-accent-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setFilter('success')}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                filter === 'success'
                  ? 'bg-accent-500 text-white'
                  : 'bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-700'
              }`}
            >
              Succès
            </button>
            <button
              onClick={() => setFilter('warning')}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                filter === 'warning'
                  ? 'bg-warning-500 text-white'
                  : 'bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-700'
              }`}
            >
              Alertes
            </button>
          </div>

          {/* Liste des notifications */}
          <div className="space-y-4">
            {filteredNotifications.length > 0 ? (
              filteredNotifications.map((notification) => {
                const Icon = notification.icon;
                return (
                  <div
                    key={notification.id}
                    className={`bg-white dark:bg-neutral-900 rounded-xl shadow-glass dark:shadow-glass-lg p-5 border transition-all duration-300 hover:shadow-lg hover:scale-[1.01] ${
                      notification.read
                        ? 'border-neutral-100 dark:border-neutral-800'
                        : 'border-primary-500/30 dark:border-primary-500/50 bg-primary-50/30 dark:bg-primary-500/5'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`p-3 rounded-lg ${notification.color}`}>
                        <Icon size={24} />
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="font-bold text-neutral-900 dark:text-white">
                              {notification.title}
                            </h3>
                            <div className="flex items-center gap-3 mt-1">
                              <span className="text-sm text-neutral-500 dark:text-neutral-400 flex items-center gap-1">
                                <Clock size={14} />
                                {notification.time}
                              </span>
                              {!notification.read && (
                                <span className="text-xs px-2 py-1 bg-primary-500 text-white rounded-full animate-pulse-gentle">
                                  Non lu
                                </span>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            {!notification.read && (
                              <button
                                onClick={() => markAsRead(notification.id)}
                                className="p-2 text-neutral-500 hover:text-accent-500 dark:text-neutral-400 dark:hover:text-accent-400 transition-colors"
                                title="Marquer comme lu"
                              >
                                <Check size={18} />
                              </button>
                            )}
                            <button
                              onClick={() => deleteNotification(notification.id)}
                              className="p-2 text-neutral-500 hover:text-red-500 dark:text-neutral-400 dark:hover:text-red-400 transition-colors"
                              title="Supprimer"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </div>
                        
                        <p className="text-neutral-700 dark:text-neutral-300 mb-4">
                          {notification.message}
                        </p>
                        
                        {notification.type === 'warning' && (
                          <button className="inline-flex items-center gap-2 px-4 py-2 bg-warning-500/10 text-warning-600 dark:text-warning-400 rounded-lg hover:bg-warning-500/20 transition-colors duration-200">
                            <ExternalLink size={16} />
                            <span className="font-medium">Voir les détails</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-glass dark:shadow-glass-lg p-12 text-center border border-neutral-100 dark:border-neutral-800">
                <div className="mx-auto w-24 h-24 bg-neutral-100 dark:bg-neutral-800 rounded-full flex items-center justify-center mb-6">
                  <Bell size={40} className="text-neutral-400 dark:text-neutral-600" />
                </div>
                <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-2">
                  Aucune notification
                </h3>
                <p className="text-neutral-600 dark:text-neutral-400 mb-6 max-w-md mx-auto">
                  {filter === 'unread' 
                    ? 'Vous avez lu toutes vos notifications. Revenez plus tard pour de nouvelles mises à jour.'
                    : 'Vous n\'avez pas encore de notifications. Elles apparaîtront ici lorsque vous en recevrez.'}
                </p>
                {filter !== 'all' && (
                  <button
                    onClick={() => setFilter('all')}
                    className="px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-all duration-200 inline-flex items-center gap-2"
                  >
                    <Filter size={18} />
                    Voir toutes les notifications
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Actions en bas */}
          {filteredNotifications.length > 0 && (
            <div className="mt-8 pt-6 border-t border-neutral-200 dark:border-neutral-800 flex justify-between items-center">
              <div className="text-sm text-neutral-500 dark:text-neutral-400">
                {filteredNotifications.length} notification{filteredNotifications.length > 1 ? 's' : ''} affichée{filteredNotifications.length > 1 ? 's' : ''}
              </div>
              <div className="flex gap-3">
                <button
                  onClick={markAllAsRead}
                  className="px-4 py-2 text-primary-500 hover:text-primary-600 dark:text-primary-400 dark:hover:text-primary-300 font-medium flex items-center gap-2 transition-colors"
                >
                  <Check size={18} />
                  Tout marquer comme lu
                </button>
                <button
                  onClick={clearAll}
                  className="px-4 py-2 text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 font-medium flex items-center gap-2 transition-colors"
                >
                  <Trash2 size={18} />
                  Tout supprimer
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Notifications;