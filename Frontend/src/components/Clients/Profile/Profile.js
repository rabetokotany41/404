import React, { useState } from 'react';
import { useTranslation } from '../../../contexts/LanguageContext';
import { 
  User, 
  Mail, 
  Shield, 
  Globe, 
  Calendar,
  MapPin,
  Phone,
  Edit,
  Bell,
  Lock,
  LogOut,
  CheckCircle,
  XCircle,
  TrendingUp
} from 'lucide-react';

const Profile = ({ user }) => {
  const { t } = useTranslation();
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    phone: user?.phone || '',
    location: user?.location || '',
    notification_preferences: user?.notification_preferences || {
      email: true,
      push: true,
      sms: false
    }
  });

  const stats = [
    { label: t('profile_reports_submitted'), value: user?.reports_count || 0, icon: TrendingUp, color: 'text-accent-500' },
    { label: t('profile_resolved_cases'), value: user?.resolved_cases || 0, icon: CheckCircle, color: 'text-green-500' },
    { label: t('profile_pending_cases'), value: user?.pending_cases || 3, icon: XCircle, color: 'text-warning-500' },
    { label: t('profile_community_rank'), value: `#${user?.rank || '1,234'}`, icon: TrendingUp, color: 'text-primary-500' },
  ];

  const handleSave = () => {
    // Ici, vous ajouteriez la logique pour sauvegarder les modifications
    console.log('Saving:', editData);
    setIsEditing(false);
  };

  const handleNotificationToggle = (type) => {
    setEditData(prev => ({
      ...prev,
      notification_preferences: {
        ...prev.notification_preferences,
        [type]: !prev.notification_preferences[type]
      }
    }));
  };

  const getRoleBadgeColor = (type) => {
    switch(type) {
      case 'admin': return 'bg-red-500/10 text-red-500 border-red-500/20';
      case 'moderator': return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
      default: return 'bg-accent-500/10 text-accent-500 border-accent-500/20';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-primary-50/20 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950 py-8 animate-fade-in">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header avec titre et boutons */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
              <h1 className="text-4xl font-bold text-neutral-900 dark:text-white mb-2">
                {t('profile_title')}
              </h1>
              <p className="text-neutral-600 dark:text-neutral-400">
                {t('profile_subtitle') || 'Gérez vos informations personnelles et préférences'}
              </p>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-all duration-200 group"
              >
                <Edit size={18} className="text-neutral-600 dark:text-neutral-400 group-hover:text-primary-500" />
                <span className="font-medium text-neutral-700 dark:text-neutral-300">
                  {isEditing ? t('cancel') : t('edit_profile')}
                </span>
              </button>
              
              <button className="flex items-center gap-2 px-4 py-2.5 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-all duration-200 shadow-lg shadow-primary-500/20 hover:shadow-primary-500/30">
                <LogOut size={18} />
                <span className="font-medium">{t('logout')}</span>
              </button>
            </div>
          </div>

          {/* Grille principale */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Colonne gauche - Informations personnelles */}
            <div className="lg:col-span-2 space-y-6">
              {/* Carte profil principale */}
              <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-glass dark:shadow-glass-lg p-8 border border-neutral-100 dark:border-neutral-800">
                <div className="flex flex-col md:flex-row items-start md:items-center gap-6 mb-8">
                  <div className="relative">
                    <div className="h-32 w-32 rounded-2xl bg-gradient-to-br from-primary-500 via-secondary-500 to-accent-500 p-1 shadow-lg">
                      <div className="h-full w-full rounded-xl bg-white dark:bg-neutral-900 flex items-center justify-center text-4xl font-bold text-neutral-900 dark:text-white">
                        {user?.first_name?.charAt(0).toUpperCase() || 'U'}
                      </div>
                    </div>
                    <div className="absolute -bottom-2 -right-2">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getRoleBadgeColor(user?.user_type)}`}>
                        {user?.user_type === 'moderator' ? t('profile_moderator') :
                         user?.user_type === 'admin' ? t('profile_admin') : t('profile_citizen')}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex-1">
                    <h2 className="text-3xl font-bold text-neutral-900 dark:text-white mb-2">
                      {user?.full_name || 'Utilisateur'}
                    </h2>
                    <div className="flex items-center gap-4 text-neutral-600 dark:text-neutral-400 mb-4">
                      <div className="flex items-center gap-2">
                        <Mail size={18} />
                        <span>{user?.email}</span>
                      </div>
                      {user?.member_since && (
                        <div className="flex items-center gap-2">
                          <Calendar size={18} />
                          <span>{t('member_since')} {new Date(user.member_since).getFullYear()}</span>
                        </div>
                      )}
                    </div>
                    <p className="text-neutral-600 dark:text-neutral-400">
                      {t('profile_bio_placeholder') || 'Membre actif de la communauté dédié à rendre notre ville meilleure.'}
                    </p>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                  {stats.map((stat, index) => {
                    const Icon = stat.icon;
                    return (
                      <div 
                        key={index}
                        className="bg-gradient-to-br from-white to-neutral-50 dark:from-neutral-800 dark:to-neutral-900 p-4 rounded-xl border border-neutral-100 dark:border-neutral-800 hover:shadow-lg transition-all duration-300"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <Icon className={`${stat.color}`} size={20} />
                          <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
                            {stat.label}
                          </span>
                        </div>
                        <div className="text-2xl font-bold text-neutral-900 dark:text-white">
                          {stat.value}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Informations détaillées */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">
                    {t('personal_information')}
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {isEditing ? (
                      <>
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                            {t('phone_number')}
                          </label>
                          <input
                            type="tel"
                            value={editData.phone}
                            onChange={(e) => setEditData({...editData, phone: e.target.value})}
                            className="w-full px-4 py-2.5 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                            placeholder={t('enter_phone_number')}
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                            {t('location')}
                          </label>
                          <input
                            type="text"
                            value={editData.location}
                            onChange={(e) => setEditData({...editData, location: e.target.value})}
                            className="w-full px-4 py-2.5 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                            placeholder={t('enter_location')}
                          />
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex items-center gap-3 p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
                          <Phone size={20} className="text-neutral-500 dark:text-neutral-400" />
                          <div>
                            <p className="text-sm text-neutral-500 dark:text-neutral-400">{t('phone_number')}</p>
                            <p className="font-medium text-neutral-900 dark:text-white">
                              {user?.phone || t('not_provided')}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
                          <MapPin size={20} className="text-neutral-500 dark:text-neutral-400" />
                          <div>
                            <p className="text-sm text-neutral-500 dark:text-neutral-400">{t('location')}</p>
                            <p className="font-medium text-neutral-900 dark:text-white">
                              {user?.location || t('not_provided')}
                            </p>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Section préférences */}
              <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-glass dark:shadow-glass-lg p-8 border border-neutral-100 dark:border-neutral-800">
                <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-6 flex items-center gap-2">
                  <Bell size={20} />
                  {t('notification_preferences')}
                </h3>
                
                <div className="space-y-4">
                  {Object.entries(editData.notification_preferences).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between p-3 hover:bg-neutral-50 dark:hover:bg-neutral-800 rounded-lg transition-colors duration-200">
                      <div>
                        <p className="font-medium text-neutral-900 dark:text-white">
                          {t(`notification_${key}`) || key.charAt(0).toUpperCase() + key.slice(1)}
                        </p>
                        <p className="text-sm text-neutral-500 dark:text-neutral-400">
                          {t(`notification_${key}_desc`) || 'Description de la notification'}
                        </p>
                      </div>
                      <button
                        onClick={() => handleNotificationToggle(key)}
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
            </div>

            {/* Colonne droite - Préférences et actions rapides */}
            <div className="space-y-6">
              {/* Préférences de langue */}
              <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-glass dark:shadow-glass-lg p-6 border border-neutral-100 dark:border-neutral-800">
                <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4 flex items-center gap-2">
                  <Globe size={20} />
                  {t('language_preferences')}
                </h3>
                
                <div className="space-y-3">
                  {['mg', 'fr', 'en'].map((lang) => (
                    <button
                      key={lang}
                      className={`w-full text-left p-3 rounded-lg border transition-all duration-200 ${
                        user?.language_preference === lang 
                          ? 'border-primary-500 bg-primary-50 dark:bg-primary-500/10' 
                          : 'border-neutral-200 dark:border-neutral-700 hover:border-primary-300 dark:hover:border-primary-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-neutral-900 dark:text-white">
                            {lang === 'mg' ? t('malagasy') : lang === 'fr' ? t('french') : t('english')}
                          </p>
                          <p className="text-sm text-neutral-500 dark:text-neutral-400">
                            {lang === 'mg' ? 'Malagasy' : lang === 'fr' ? 'Français' : 'English'}
                          </p>
                        </div>
                        {user?.language_preference === lang && (
                          <div className="h-5 w-5 rounded-full bg-primary-500 flex items-center justify-center">
                            <div className="h-2 w-2 rounded-full bg-white" />
                          </div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Actions rapides */}
              <div className="bg-gradient-to-br from-primary-500/10 via-secondary-500/10 to-accent-500/10 dark:from-primary-500/5 dark:via-secondary-500/5 dark:to-accent-500/5 rounded-2xl p-6 border border-primary-500/20">
                <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">
                  {t('quick_actions')}
                </h3>
                
                <div className="space-y-3">
                  <button className="w-full flex items-center justify-between p-3 bg-white dark:bg-neutral-800 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-all duration-200 group">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary-500/10 rounded-lg">
                        <Shield size={18} className="text-primary-500" />
                      </div>
                      <span className="font-medium text-neutral-700 dark:text-neutral-300">
                        {t('privacy_settings')}
                      </span>
                    </div>
                  </button>
                  
                  <button className="w-full flex items-center justify-between p-3 bg-white dark:bg-neutral-800 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-all duration-200 group">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-accent-500/10 rounded-lg">
                        <Lock size={18} className="text-accent-500" />
                      </div>
                      <span className="font-medium text-neutral-700 dark:text-neutral-300">
                        {t('change_password')}
                      </span>
                    </div>
                  </button>
                </div>
              </div>

              {/* Bouton de sauvegarde (visible uniquement en mode édition) */}
              {isEditing && (
                <div className="sticky top-6">
                  <button
                    onClick={handleSave}
                    className="w-full py-3.5 bg-gradient-to-r from-primary-500 to-secondary-500 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-primary-500/25 transition-all duration-200 transform hover:-translate-y-0.5"
                  >
                    {t('save_changes')}
                  </button>
                  <p className="text-center text-sm text-neutral-500 dark:text-neutral-400 mt-2">
                    {t('save_changes_hint')}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;