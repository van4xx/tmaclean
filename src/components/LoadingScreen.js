import React from 'react';
import '../styles/LoadingScreen.css';

const LoadingScreen = () => {
  return (
    <div className="loading-screen">
      <div className="loading-animation">
        <div className="cleaning-icon">🧹</div>
        <div className="loading-drops">
          <span className="drop drop-1"></span>
          <span className="drop drop-2"></span>
          <span className="drop drop-3"></span>
        </div>
      </div>
      <h2 className="loading-text">Загрузка BotClean</h2>
      <p className="loading-subtext">Делаем чистоту доступнее</p>
    </div>
  );
};

export default LoadingScreen; 