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
      console.warn('Telegram WebApp не обнаружен, используется мок для разработки');
      
      // Создаем моковые данные для тестирования вне Telegram
      const mockUser = {
        id: 12345678,
        first_name: "Тестовый",
        last_name: "Пользователь",
        username: "testuser",
        language_code: "ru"
      };
      
      // Создаем мок WebApp API
      const mockWebApp = {
        initData: "mock_init_data",
        initDataUnsafe: {
          user: mockUser,
          auth_date: Math.floor(Date.now() / 1000),
          hash: "mock_hash"
        },
        BackButton: {
          isVisible: false,
          show: () => console.log('BackButton.show called'),
          hide: () => console.log('BackButton.hide called'),
          onClick: (callback: () => void) => console.log('BackButton.onClick registered')
        },
        MainButton: {
          text: "",
          color: "#3A66FF",
          textColor: "#FFFFFF",
          isVisible: false,
          isActive: true,
          isProgressVisible: false,
          show: () => console.log('MainButton.show called'),
          hide: () => console.log('MainButton.hide called'),
          enable: () => console.log('MainButton.enable called'),
          disable: () => console.log('MainButton.disable called'),
          showProgress: (leaveActive: boolean) => console.log('MainButton.showProgress called'),
          hideProgress: () => console.log('MainButton.hideProgress called'),
          setText: (text: string) => console.log('MainButton.setText called with', text),
          onClick: (callback: () => void) => console.log('MainButton.onClick registered'),
          offClick: (callback: () => void) => console.log('MainButton.offClick called')
        },
        HapticFeedback: {
          impactOccurred: (style: string) => console.log('HapticFeedback.impactOccurred called'),
          notificationOccurred: (type: string) => console.log('HapticFeedback.notificationOccurred called'),
          selectionChanged: () => console.log('HapticFeedback.selectionChanged called')
        },
        colorScheme: 'light' as 'light' | 'dark',
        themeParams: {
          bg_color: "#FFFFFF",
          text_color: "#1D2733",
          hint_color: "#9DACBF",
          link_color: "#3A66FF",
          button_color: "#3A66FF",
          button_text_color: "#FFFFFF"
        },
        expand: () => console.log('WebApp.expand called'),
        enableClosingConfirmation: () => console.log('WebApp.enableClosingConfirmation called'),
        ready: () => console.log('WebApp.ready called'),
        close: () => console.log('WebApp.close called'),
        sendData: (data: string) => console.log('WebApp.sendData called with', data)
      } as TelegramWebApp;
      
      setWebApp(mockWebApp);
      setUser(mockUser);
      setInitData("mock_init_data");
      setColorScheme('light');
      setThemeParams(mockWebApp.themeParams);
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