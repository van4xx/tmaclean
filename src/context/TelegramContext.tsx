import React, { createContext, useState, useEffect, ReactNode } from 'react';

// Define the interface for Telegram WebApp
interface TelegramWebApp {
  expand: () => void;
  enableClosingConfirmation: () => void;
  sendData: (data: string) => void;
  ready: () => void;
  close: () => void;
  initData: string;
  initDataUnsafe: {
    user?: {
      id: number;
      first_name: string;
      last_name?: string;
      username?: string;
      language_code?: string;
    };
    query_id?: string;
    auth_date: number;
    hash: string;
  };
  BackButton: {
    isVisible: boolean;
    show: () => void;
    hide: () => void;
    onClick: (callback: () => void) => void;
  };
  MainButton: {
    text: string;
    color: string;
    textColor: string;
    isVisible: boolean;
    isActive: boolean;
    isProgressVisible: boolean;
    show: () => void;
    hide: () => void;
    enable: () => void;
    disable: () => void;
    showProgress: (leaveActive: boolean) => void;
    hideProgress: () => void;
    setText: (text: string) => void;
    onClick: (callback: () => void) => void;
    offClick: (callback: () => void) => void;
  };
  HapticFeedback: {
    impactOccurred: (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') => void;
    notificationOccurred: (type: 'error' | 'success' | 'warning') => void;
    selectionChanged: () => void;
  };
  themeParams: {
    bg_color?: string;
    text_color?: string;
    hint_color?: string;
    link_color?: string;
    button_color?: string;
    button_text_color?: string;
  };
  colorScheme: 'light' | 'dark';
}

interface TelegramContextProps {
  webApp: TelegramWebApp | null;
  user: any;
  initData: string;
  colorScheme: 'light' | 'dark';
  themeParams: any;
  sendData: (data: any) => void;
}

export const TelegramContext = createContext<TelegramContextProps>({
  webApp: null,
  user: null,
  initData: '',
  colorScheme: 'light',
  themeParams: {},
  sendData: () => {}
});

interface TelegramProviderProps {
  children: ReactNode;
}

export const TelegramProvider: React.FC<TelegramProviderProps> = ({ children }) => {
  const [webApp, setWebApp] = useState<TelegramWebApp | null>(null);
  const [user, setUser] = useState<any>(null);
  const [initData, setInitData] = useState<string>('');
  const [colorScheme, setColorScheme] = useState<'light' | 'dark'>('light');
  const [themeParams, setThemeParams] = useState<any>({});

  useEffect(() => {
    // Проверяем, доступен ли Telegram WebApp API
    if (window.Telegram && window.Telegram.WebApp) {
      const tgWebApp = window.Telegram.WebApp;
      console.log('Telegram WebApp initialized', { 
        initData: tgWebApp.initData,
        user: tgWebApp.initDataUnsafe?.user
      });
      setWebApp(tgWebApp);
      setUser(tgWebApp.initDataUnsafe?.user || null);
      setInitData(tgWebApp.initData);
      setColorScheme(tgWebApp.colorScheme);
      setThemeParams(tgWebApp.themeParams);
    } else {
      console.error('Telegram WebApp не обнаружен');
    }
  }, []);

  // Отправка данных в Telegram Bot
  const sendData = (data: any) => {
    if (webApp) {
      webApp.sendData(JSON.stringify(data));
    } else {
      console.error('Telegram WebApp не доступен');
    }
  };

  return (
    <TelegramContext.Provider
      value={{
        webApp,
        user,
        initData,
        colorScheme,
        themeParams,
        sendData
      }}
    >
      {children}
    </TelegramContext.Provider>
  );
}; 