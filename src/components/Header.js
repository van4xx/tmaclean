import React from 'react';
import { useTelegram } from '../context/TelegramContext';
import '../styles/Header.css';

const Header = ({ activeTab }) => {
  const { user } = useTelegram();
  
  const getTitle = () => {
    switch (activeTab) {
      case 'home':
        return 'BotClean';
      case 'schedule':
        return 'Назначить уборку';
      case 'cleanings':
        return 'Мои уборки';
      case 'profile':
        return 'Мой профиль';
      case 'support':
        return 'Поддержка';
      default:
        return 'BotClean';
    }
  };
  
  return (
    <header className="header">
      <div className="header-content">
        <h1 className="header-title">{getTitle()}</h1>
        {user && <div className="header-user-initial">{user.first_name?.[0]}</div>}
      </div>
    </header>
  );
};

export default Header; 