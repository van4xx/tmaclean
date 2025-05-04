// Fake API service for demo purposes
// In a real app, this would be an actual API client that communicates with your backend

// Mock data
const MOCK_TARIFFS = [
  {
    id: 'tariff-1',
    name: 'Стандарт',
    description: 'Идеально для регулярной уборки небольших квартир',
    basePrice: 4000,
    cleaningsPerMonth: 2
  },
  {
    id: 'tariff-2',
    name: 'Премиум',
    description: 'Расширенная уборка с дополнительными опциями',
    basePrice: 6000,
    cleaningsPerMonth: 4
  },
  {
    id: 'tariff-3',
    name: 'VIP',
    description: 'Полный комплекс услуг с индивидуальным подходом',
    basePrice: 8000,
    cleaningsPerMonth: 8
  }
];

const MOCK_CLEANINGS = [
  { 
    id: 'cleaning-1',
    date: new Date(Date.now() + 86400000 * 2).toISOString(), 
    status: 'запланирована' 
  },
  { 
    id: 'cleaning-2',
    date: new Date(Date.now() + 86400000 * 9).toISOString(), 
    status: 'запланирована' 
  },
  { 
    id: 'cleaning-3',
    date: new Date(Date.now() - 86400000 * 5).toISOString(), 
    status: 'завершена' 
  }
];

// Helper function to simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// API для работы с пользователями
export const userAPI = {
  // Получение данных текущего пользователя
  getMe: async () => {
    await delay(500);
    return { data: { user: null } }; // Будет использоваться mock из AuthContext
  },
  
  // Регистрация нового пользователя
  register: async (userData: any) => {
    await delay(800);
    return { data: { user: userData } };
  },
  
  // Вход пользователя
  login: async (credentials: { phone: string; telegramId: number }) => {
    await delay(700);
    return { data: { success: true } };
  },
  
  // Обновление данных пользователя
  updateUser: async (userData: any) => {
    await delay(600);
    return { data: { user: userData } };
  },
};

// API для работы с тарифами
export const tariffAPI = {
  // Получение всех тарифов
  getAllTariffs: async () => {
    await delay(500);
    return { data: MOCK_TARIFFS };
  },
  
  // Получение информации о конкретном тарифе
  getTariff: async (tariffId: string) => {
    await delay(300);
    const tariff = MOCK_TARIFFS.find(t => t.id === tariffId);
    return { data: tariff };
  },
  
  // Расчет стоимости тарифа для указанной площади
  calculatePrice: async (tariffId: string, area: number) => {
    await delay(400);
    const tariff = MOCK_TARIFFS.find(t => t.id === tariffId);
    if (!tariff) return { data: { price: 0 } };
    
    // Рассчитываем стоимость в зависимости от площади
    const basePrice = tariff.basePrice;
    const multiplier = area <= 50 ? 1 : area <= 100 ? 1.2 : 1.4;
    
    return { data: { price: Math.round(basePrice * multiplier) } };
  },
  
  // Выбор тарифа для пользователя
  selectTariff: async (tariffId: string, area: number) => {
    await delay(800);
    return { data: { success: true } };
  },
};

// API для работы с уборками
export const cleaningAPI = {
  // Получение запланированных уборок
  getCleanings: async () => {
    await delay(600);
    return { data: MOCK_CLEANINGS };
  },
  
  // Планирование новой уборки
  scheduleCleaning: async (data: { date: string; time: string }) => {
    await delay(1000);
    const newCleaning = {
      id: `cleaning-${Date.now()}`,
      date: new Date(data.date).toISOString(),
      status: 'запланирована'
    };
    
    return { data: { cleaning: newCleaning, success: true } };
  },
  
  // Отмена уборки
  cancelCleaning: async (cleaningId: string) => {
    await delay(700);
    return { data: { success: true } };
  },
  
  // Перенос уборки
  rescheduleСleaning: async (cleaningId: string, data: { date: string; time: string }) => {
    await delay(800);
    return { data: { success: true } };
  },
}; 