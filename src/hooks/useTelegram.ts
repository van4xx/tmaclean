import { useContext } from 'react';
import { TelegramContext } from '../context/TelegramContext';

export const useTelegram = () => {
  const context = useContext(TelegramContext);

  if (!context) {
    throw new Error('useTelegram должен использоваться внутри TelegramProvider');
  }

  return context;
}; 