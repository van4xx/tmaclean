import React, { createContext, useContext, useEffect, useState } from 'react';

// Creating the context
const TelegramContext = createContext(null);

// Custom hook to use the Telegram context
export const useTelegram = () => {
  const context = useContext(TelegramContext);
  if (!context) {
    throw new Error('useTelegram must be used within a TelegramProvider');
  }
  return context;
};

// Provider component
export const TelegramProvider = ({ children }) => {
  const [telegram, setTelegram] = useState(null);
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);
  
  useEffect(() => {
    // Check if we're running in the Telegram WebApp environment
    if (window.Telegram && window.Telegram.WebApp) {
      const tg = window.Telegram.WebApp;
      
      // Initialize the WebApp
      tg.expand();
      
      // Get user data
      const user = tg.initDataUnsafe?.user || {};
      
      // Set up back button handler
      tg.BackButton.onClick(() => {
        if (window.history.length > 1) {
          window.history.back();
        }
      });
      
      // Set the state
      setTelegram(tg);
      setUser(user);
      setReady(true);
      
      // Notify Telegram that we're ready
      tg.ready();
    } else {
      console.warn('Telegram WebApp is not available. Running in standalone mode.');
      // For development outside of Telegram
      setReady(true);
    }
  }, []);
  
  // Helper functions to interact with the Telegram WebApp
  const showBackButton = () => {
    if (telegram) {
      telegram.BackButton.show();
    }
  };
  
  const hideBackButton = () => {
    if (telegram) {
      telegram.BackButton.hide();
    }
  };
  
  const sendData = (data) => {
    if (telegram) {
      telegram.sendData(JSON.stringify(data));
      return true;
    }
    return false;
  };
  
  const showMainButton = (text, callback) => {
    if (telegram) {
      telegram.MainButton.text = text;
      if (callback) {
        telegram.MainButton.onClick(callback);
      }
      telegram.MainButton.show();
    }
  };
  
  const hideMainButton = () => {
    if (telegram) {
      telegram.MainButton.hide();
    }
  };
  
  const enableMainButton = () => {
    if (telegram) {
      telegram.MainButton.enable();
    }
  };
  
  const disableMainButton = () => {
    if (telegram) {
      telegram.MainButton.disable();
    }
  };
  
  const openLink = (url) => {
    if (telegram) {
      telegram.openLink(url);
    } else {
      window.open(url, '_blank');
    }
  };
  
  const showAlert = (message) => {
    if (telegram) {
      telegram.showAlert(message);
    } else {
      alert(message);
    }
  };
  
  const showConfirm = (message, callback) => {
    if (telegram) {
      telegram.showConfirm(message, callback);
    } else {
      const result = confirm(message);
      if (callback) callback(result);
    }
  };
  
  // Value object to provide through the context
  const value = {
    telegram,
    user,
    ready,
    showBackButton,
    hideBackButton,
    sendData,
    showMainButton,
    hideMainButton,
    enableMainButton,
    disableMainButton,
    openLink,
    showAlert,
    showConfirm,
    isInTelegram: !!telegram
  };
  
  return (
    <TelegramContext.Provider value={value}>
      {children}
    </TelegramContext.Provider>
  );
};

export default TelegramContext; 