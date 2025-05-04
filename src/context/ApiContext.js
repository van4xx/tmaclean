import React, { createContext, useContext, useState } from 'react';
import axios from 'axios';
import { useTelegram } from './TelegramContext';

// API base URL - adjust this based on your backend URL
const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://your-backend-url.com/api';

// Creating the context
const ApiContext = createContext(null);

// Custom hook to use the API context
export const useApi = () => {
  const context = useContext(ApiContext);
  if (!context) {
    throw new Error('useApi must be used within an ApiProvider');
  }
  return context;
};

// Provider component
export const ApiProvider = ({ children }) => {
  const { user, telegram } = useTelegram();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Create axios instance with default configuration
  const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
      'Content-Type': 'application/json',
    },
  });
  
  // Add authorization header if we have telegram init data
  if (telegram) {
    api.interceptors.request.use((config) => {
      const initData = telegram.initData;
      if (initData) {
        config.headers['X-Telegram-Init-Data'] = initData;
      }
      return config;
    });
  }
  
  // General API request function with error handling
  const apiRequest = async (method, endpoint, data = null, options = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api({
        method,
        url: endpoint,
        data: method !== 'get' ? data : null,
        params: method === 'get' ? data : null,
        ...options,
      });
      
      setLoading(false);
      return response.data;
    } catch (err) {
      setLoading(false);
      
      const errorMessage = err.response?.data?.message || err.message || 'Неизвестная ошибка';
      setError(errorMessage);
      
      // Optionally show error in Telegram UI
      if (telegram && options.showError !== false) {
        telegram.showAlert(`Ошибка: ${errorMessage}`);
      }
      
      throw err;
    }
  };
  
  // Specific API methods
  
  // User related API calls
  const getUserProfile = () => {
    return apiRequest('get', '/user/profile');
  };
  
  // Cleaning schedule related API calls
  const getCleanings = () => {
    return apiRequest('get', '/cleanings');
  };
  
  const scheduleCleaning = (date, time) => {
    return apiRequest('post', '/cleanings', { 
      date, 
      time,
      action: 'schedule_cleaning' 
    });
  };
  
  const cancelCleaning = (cleaningIndex) => {
    return apiRequest('post', '/cleanings/cancel', { 
      cleaningIndex,
      action: 'cancel_cleaning' 
    });
  };
  
  const rescheduleCleaning = (cleaningIndex, date, time) => {
    return apiRequest('post', '/cleanings/reschedule', { 
      cleaningIndex, 
      date, 
      time,
      action: 'reschedule_cleaning' 
    });
  };
  
  // Subscription related API calls
  const getSubscriptionInfo = () => {
    return apiRequest('get', '/subscription');
  };
  
  const extendSubscription = (tariffId) => {
    return apiRequest('post', '/subscription/extend', { tariffId });
  };
  
  // Value object to provide through the context
  const value = {
    loading,
    error,
    apiRequest,
    getUserProfile,
    getCleanings,
    scheduleCleaning,
    cancelCleaning,
    rescheduleCleaning,
    getSubscriptionInfo,
    extendSubscription
  };
  
  return (
    <ApiContext.Provider value={value}>
      {children}
    </ApiContext.Provider>
  );
};

export default ApiContext; 