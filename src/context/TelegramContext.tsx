import React, { createContext, useState, useEffect, ReactNode } from 'react';

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
      setWebApp(tgWebApp);
      setUser(tgWebApp.initDataUnsafe?.user || null);
      setInitData(tgWebApp.initData);
      setColorScheme(tgWebApp.colorScheme);
      setThemeParams(tgWebApp.themeParams);
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