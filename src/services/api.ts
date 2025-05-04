import axios from 'axios';

// Определяем базовый URL в зависимости от окружения
const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3003/api';

// Создаем экземпляр axios с настройками по умолчанию
export const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Интерцептор для добавления заголовков авторизации
api.interceptors.request.use(
  (config) => {
    // Проверяем, есть ли Telegram initial data в localStorage
    const telegramInitData = localStorage.getItem('tg_init_data');
    if (telegramInitData) {
      config.headers = {
        ...config.headers,
        'x-telegram-init-data': telegramInitData,
      };
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// API для работы с пользователями
export const userAPI = {
  // Получение данных текущего пользователя
  getMe: () => api.get('/user/me'),
  
  // Регистрация нового пользователя
  register: (userData: any) => api.post('/user/register', userData),
  
  // Вход пользователя
  login: (credentials: { phone: string; telegramId: number }) => 
    api.post('/user/login', credentials),
  
  // Обновление данных пользователя
  updateUser: (userData: any) => api.put('/user/update', userData),
};

// API для работы с тарифами
export const tariffAPI = {
  // Получение всех тарифов
  getAllTariffs: () => api.get('/tariffs'),
  
  // Получение информации о конкретном тарифе
  getTariff: (tariffId: string) => api.get(`/tariffs/${tariffId}`),
  
  // Расчет стоимости тарифа для указанной площади
  calculatePrice: (tariffId: string, area: number) => 
    api.get(`/tariffs/${tariffId}/calculate?area=${area}`),
  
  // Выбор тарифа для пользователя
  selectTariff: (tariffId: string, area: number) => 
    api.post('/tariffs/select', { tariffId, area }),
};

// API для работы с уборками
export const cleaningAPI = {
  // Получение запланированных уборок
  getCleanings: () => api.get('/cleanings'),
  
  // Планирование новой уборки
  scheduleCleaning: (data: { date: string; time: string }) => 
    api.post('/cleanings/schedule', data),
  
  // Отмена уборки
  cancelCleaning: (cleaningId: string) => 
    api.post(`/cleanings/${cleaningId}/cancel`),
  
  // Перенос уборки
  rescheduleСleaning: (cleaningId: string, data: { date: string; time: string }) => 
    api.post(`/cleanings/${cleaningId}/reschedule`, data),
}; 