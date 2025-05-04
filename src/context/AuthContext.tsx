import React, { createContext, useEffect, useState, ReactNode } from 'react';
import { useTelegram } from '../hooks/useTelegram';
import { api } from '../services/api';

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

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<UserType | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { initData, user: telegramUser } = useTelegram();

  useEffect(() => {
    // Когда компонент монтируется, проверяем текущую сессию
    const checkAuth = async () => {
      if (!initData) {
        setLoading(false);
        return;
      }

      console.log('Checking auth with initData:', initData);
      
      try {
        console.log('Making API request to /user/me');
        const response = await api.get('/user/me', {
          headers: {
            'x-telegram-init-data': initData
          }
        });
        console.log('Auth response:', response.data);

        if (response.data?.user) {
          setUser(response.data.user);
        }
      } catch (err) {
        console.error('Ошибка при проверке аутентификации', err);
        setError('Не удалось войти. Пожалуйста, попробуйте снова.');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [initData]);

  const login = async (phone: string) => {
    if (!telegramUser) {
      setError('Telegram пользователь не найден');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/user/login', {
        phone,
        telegramId: telegramUser.id
      }, {
        headers: {
          'x-telegram-init-data': initData
        }
      });

      if (response.data?.user) {
        setUser(response.data.user);
      }
    } catch (err) {
      console.error('Ошибка при входе', err);
      setError('Не удалось войти. Пожалуйста, попробуйте снова.');
    } finally {
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
      const response = await api.post('/user/register', {
        ...userData,
        chatId: telegramUser.id
      }, {
        headers: {
          'x-telegram-init-data': initData
        }
      });

      if (response.data?.user) {
        setUser(response.data.user);
      }
    } catch (err) {
      console.error('Ошибка при регистрации', err);
      setError('Не удалось зарегистрироваться. Пожалуйста, попробуйте снова.');
    } finally {
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
      const response = await api.put('/user/update', userData, {
        headers: {
          'x-telegram-init-data': initData
        }
      });

      if (response.data?.user) {
        setUser(response.data.user);
      }
    } catch (err) {
      console.error('Ошибка при обновлении пользователя', err);
      setError('Не удалось обновить данные. Пожалуйста, попробуйте снова.');
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await api.post('/user/logout', {}, {
        headers: {
          'x-telegram-init-data': initData
        }
      });
      setUser(null);
    } catch (err) {
      console.error('Ошибка при выходе', err);
    } finally {
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