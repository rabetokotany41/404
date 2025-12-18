import React from 'react';
import Header from './Clients/Widgets/Header/Header';
import Footer from './Clients/Widgets/Footer/Footer';

const ClientLayout = ({ children, isAuthenticated = false, onLogout, currentUser = null }) => {
  return (
    <div className="bg-white dark:bg-neutral-950 min-h-screen">
      <Header 
        isAuthenticated={isAuthenticated} 
        onLogout={onLogout} 
        userData={currentUser} 
      />

      <main className="pt-20">
        {children}
      </main>

      <Footer 
        currentUser={currentUser} 
        isAuthenticated={isAuthenticated}
        onLogout={onLogout}
      />
    </div>
  );
};

export default ClientLayout;