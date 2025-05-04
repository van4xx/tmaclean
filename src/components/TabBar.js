import React from 'react';
import { FaHome, FaCalendarPlus, FaCalendarAlt, FaUser, FaHeadset } from 'react-icons/fa';
import '../styles/TabBar.css';

const TabBar = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'home', label: 'Главная', icon: FaHome },
    { id: 'schedule', label: 'Назначить', icon: FaCalendarPlus },
    { id: 'cleanings', label: 'Мои уборки', icon: FaCalendarAlt },
    { id: 'profile', label: 'Профиль', icon: FaUser },
    { id: 'support', label: 'Поддержка', icon: FaHeadset }
  ];
  
  return (
    <nav className="tab-bar">
      <div className="tab-bar-container">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => onTabChange(tab.id)}
          >
            <tab.icon className={`tab-icon ${activeTab === tab.id ? 'active' : ''}`} />
            <span className={`tab-label ${activeTab === tab.id ? 'active' : ''}`}>
              {tab.label}
            </span>
            {activeTab === tab.id && <div className="tab-indicator" />}
          </button>
        ))}
      </div>
    </nav>
  );
};

export default TabBar; 