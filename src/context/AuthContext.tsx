import React, { createContext, useEffect, useState, ReactNode } from 'react';
import { useTelegram } from '../hooks/useTelegram';

interface UserType {
  chatId: number;
  name: string;
  phone: string;
  apartmentArea?: number;
  address?: string;
  tariff?: {
    name: string;
    basePrice: number;
    finalPrice: number;
    cleaningsPerMonth: number;
  };
  subscription?: {
    active: boolean;
    endDate: string;
    remainingCleanings: number;
  };
  cleanings?: Array<{
    date: string;
    status: string;
  }>;
}

interface AuthContextProps {
  user: UserType | null;
  loading: boolean;
  error: string | null;
  login: (phone: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (userData: Partial<UserType>) => Promise<void>;
  updateUser: (userData: Partial<UserType>) => Promise<void>;
}

export const AuthContext = createContext<AuthContextProps>({
  user: null,
  loading: false,
  error: null,
  login: async () => {},
  logout: async () => {},
  register: async () => {},
  updateUser: async () => {}
});

interface AuthProviderProps {
  children: ReactNode;
}

// Функция для создания демо-пользователя из Telegram WebApp
const createMockUserFromTelegram = (telegramUser: any): UserType => {
  // Используем mockData для демонстрации интерфейса
  const mockCleanings = [
    { 
      date: new Date(Date.now() + 86400000 * 2).toISOString(), // через 2 дня
      status: 'запланирована' 
    },
    { 
      date: new Date(Date.now() + 86400000 * 9).toISOString(), // через 9 дней
      status: 'запланирована' 
    },
    { 
      date: new Date(Date.now() - 86400000 * 5).toISOString(), // 5 дней назад
      status: 'завершена' 
    }
  ];

  return {
    chatId: telegramUser.id,
    name: `${telegramUser.first_name} ${telegramUser.last_name || ''}`.trim(),
    phone: '+7XXXXXXXXXX', // Заглушка номера телефона
    apartmentArea: 75, // Заглушка площади квартиры
    address: 'г. Москва, ул. Примерная, д. 123, кв. 45', // Заглушка адреса
    tariff: {
      name: 'Стандарт',
      basePrice: 4000,
      finalPrice: 4500,
      cleaningsPerMonth: 2
    },
    subscription: {
      active: true,
      endDate: new Date(Date.now() + 86400000 * 30).toISOString(), // 30 дней вперед
      remainingCleanings: 3
    },
    cleanings: mockCleanings
  };
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<UserType | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { user: telegramUser, initData } = useTelegram();

  useEffect(() => {
    // Проверка авторизации через Telegram WebApp
    const checkAuth = async () => {
      console.log('Checking auth with Telegram user:', telegramUser);
      
      if (!telegramUser) {
        console.log('No Telegram user found');
        setLoading(false);
        return;
      }

      try {
        // В реальном проекте здесь был бы запрос к серверу
        // Но так как сервер не реализован для TMA, используем моки
        const mockUser = createMockUserFromTelegram(telegramUser);
        console.log('Created mock user:', mockUser);
        setUser(mockUser);
      } catch (err) {
        console.error('Ошибка при проверке аутентификации', err);
        setError('Не удалось войти. Пожалуйста, попробуйте снова.');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [telegramUser, initData]);

  const login = async (phone: string) => {
    if (!telegramUser) {
      setError('Telegram пользователь не найден');
      return;
    }

    setLoading(true);
    try {
      // Имитация логина
      setTimeout(() => {
        const mockUser = createMockUserFromTelegram(telegramUser);
        mockUser.phone = phone;
        setUser(mockUser);
        setLoading(false);
      }, 1000);
    } catch (err) {
      console.error('Ошибка при входе', err);
      setError('Не удалось войти. Пожалуйста, попробуйте снова.');
      setLoading(false);
    }
  };

  const register = async (userData: Partial<UserType>) => {
    if (!telegramUser) {
      setError('Telegram пользователь не найден');
      return;
    }

    setLoading(true);
    try {
      // Имитация регистрации
      setTimeout(() => {
        const mockUser = createMockUserFromTelegram(telegramUser);
        setUser({
          ...mockUser,
          ...userData,
        });
        setLoading(false);
      }, 1000);
    } catch (err) {
      console.error('Ошибка при регистрации', err);
      setError('Не удалось зарегистрироваться. Пожалуйста, попробуйте снова.');
      setLoading(false);
    }
  };

  const updateUser = async (userData: Partial<UserType>) => {
    if (!user) {
      setError('Пользователь не авторизован');
      return;
    }

    setLoading(true);
    try {
      // Имитация обновления пользователя
      setTimeout(() => {
        setUser({
          ...user,
          ...userData,
        });
        setLoading(false);
      }, 1000);
    } catch (err) {
      console.error('Ошибка при обновлении пользователя', err);
      setError('Не удалось обновить данные. Пожалуйста, попробуйте снова.');
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      // Имитация логаута
      setTimeout(() => {
        setUser(null);
        setLoading(false);
      }, 500);
    } catch (err) {
      console.error('Ошибка при выходе', err);
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        login,
        logout,
        register,
        updateUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}; 