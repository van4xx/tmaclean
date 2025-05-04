import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import { useTelegram } from '../hooks/useTelegram';
import { FaCalendarPlus, FaCalendarAlt, FaExchangeAlt, FaUserAlt } from 'react-icons/fa';
import '../styles/HomePage.scss';

const HomePage: React.FC = () => {
  const { user } = useAuth();
  const { webApp } = useTelegram();
  const navigate = useNavigate();

  useEffect(() => {
    if (webApp) {
      webApp.BackButton.hide();
      webApp.MainButton.hide();
    }
  }, [webApp]);

  const handleScheduleClick = () => {
    navigate('/schedule');
  };

  const handleMyCleaningsClick = () => {
    navigate('/cleanings');
  };
  
  const handleTariffsClick = () => {
    navigate('/tariffs');
  };
  
  const handleProfileClick = () => {
    navigate('/profile');
  };

  return (
    <motion.div 
      className="home-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="home-header">
        <h1>BotClean</h1>
        <p className="subtitle">Профессиональная уборка помещений</p>
      </div>
      
      {user && user.subscription?.active ? (
        <div className="subscription-info">
          <p className="tariff-name">{user.tariff?.name}</p>
          <div className="subscription-details">
            <p>
              <span className="info-label">Осталось уборок:</span> 
              <span className="info-value">{user.subscription.remainingCleanings}</span>
            </p>
            <p>
              <span className="info-label">Активна до:</span> 
              <span className="info-value">{new Date(user.subscription.endDate).toLocaleDateString('ru')}</span>
            </p>
          </div>
        </div>
      ) : (
        <div className="cta-container">
          <h2>Мы сохраним ваше время и силы!</h2>
          <p>Выберите удобный тариф и начните пользоваться нашими услугами уже сегодня.</p>
          <button className="btn btn-primary btn-block mt-3" onClick={handleTariffsClick}>
            Выбрать тариф
          </button>
        </div>
      )}
      
      <div className="menu-grid">
        <div className="menu-item" onClick={handleScheduleClick}>
          <div className="menu-icon">
            <FaCalendarPlus />
          </div>
          <p>Назначить уборку</p>
        </div>
        <div className="menu-item" onClick={handleMyCleaningsClick}>
          <div className="menu-icon">
            <FaCalendarAlt />
          </div>
          <p>Мои уборки</p>
        </div>
        <div className="menu-item" onClick={handleTariffsClick}>
          <div className="menu-icon">
            <FaExchangeAlt />
          </div>
          <p>Тарифы</p>
        </div>
        <div className="menu-item" onClick={handleProfileClick}>
          <div className="menu-icon">
            <FaUserAlt />
          </div>
          <p>Профиль</p>
        </div>
      </div>
      
      {/* Если у пользователя есть ближайшая уборка, показываем информацию о ней */}
      {user && user.cleanings && user.cleanings.length > 0 && (
        <div className="next-cleaning">
          <h3>Ближайшая уборка</h3>
          {user.cleanings
            .filter(cleaning => cleaning.status === 'запланирована')
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
            .slice(0, 1)
            .map((cleaning, index) => (
              <div key={index} className="cleaning-card">
                <div className="cleaning-date">
                  <span className="day">{new Date(cleaning.date).getDate()}</span>
                  <span className="month">{new Date(cleaning.date).toLocaleDateString('ru', { month: 'long' })}</span>
                </div>
                <div className="cleaning-time">
                  {new Date(cleaning.date).toLocaleTimeString('ru', { hour: '2-digit', minute: '2-digit' })}
                </div>
                <div className="cleaning-actions">
                  <button className="btn btn-outline" onClick={() => navigate('/cleanings')}>
                    Детали
                  </button>
                </div>
              </div>
            ))}
        </div>
      )}
    </motion.div>
  );
};

export default HomePage; 