import React, { useState } from 'react';
import { MessageCircle, X } from 'lucide-react';
import ChatModal from './ChatModal';

const ChatButton = ({ currentUser, isAuthenticated, onLogout }) => {
  const [openChat, setOpenChat] = useState(false);

  const handleOpenChat = () => {
    setOpenChat(true);
  };

  const handleCloseChat = () => {
    setOpenChat(false);
  };

  // Vérifier si l'utilisateur est connecté
  const isUserConnected = () => {
    try {
      const token = localStorage.getItem('authToken');
      const userData = localStorage.getItem('userData');
      return token && userData;
    } catch {
      return false;
    }
  };

  return (
    <>
      {/* Bouton Chat flottant */}
      <button
        onClick={handleOpenChat}
        className={`fixed bottom-6 right-6 h-14 w-14 rounded-full bg-gradient-to-r from-primary-500 to-secondary-500 text-white shadow-2xl shadow-primary-500/30 flex items-center justify-center hover:scale-110 active:scale-95 transition-all duration-300 z-40 group ${openChat ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
        aria-label="Ouvrir le chat de support"
      >
        <MessageCircle className="h-6 w-6" />
        {isUserConnected() && (
          <span className="absolute -top-2 -right-2 h-5 w-5 bg-red-500 rounded-full border-2 border-white dark:border-neutral-900 animate-pulse"></span>
        )}
        <span className="absolute -top-12 right-0 px-2 py-1 bg-neutral-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
          {isUserConnected() ? 'Support en ligne' : 'Se connecter pour chatter'}
        </span>
      </button>

      {/* Chat Modal */}
      {openChat && (
        <ChatModal 
          currentUser={currentUser}
          isAuthenticated={isAuthenticated}
          onClose={handleCloseChat}
        />
      )}
    </>
  );
};

export default ChatButton;