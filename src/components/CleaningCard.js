import React from 'react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { FaCalendarAlt, FaClock, FaMapMarkerAlt, FaCheck, FaTimesCircle, FaExclamationCircle } from 'react-icons/fa';
import '../styles/CleaningCard.css';

const CleaningCard = ({ cleaning, onReschedule, onCancel }) => {
  const { date, status } = cleaning;
  
  const formatDate = (date) => {
    return format(new Date(date), 'd MMMM', { locale: ru });
  };
  
  const formatTime = (date) => {
    return format(new Date(date), 'HH:mm');
  };
  
  const getStatusBadge = () => {
    const statuses = {
      'запланирована': { class: 'badge-primary', icon: FaCalendarAlt, text: 'Запланирована' },
      'выполнена': { class: 'badge-success', icon: FaCheck, text: 'Выполнена' },
      'отменена': { class: 'badge-danger', icon: FaTimesCircle, text: 'Отменена' },
      'заморожена': { class: 'badge-warning', icon: FaExclamationCircle, text: 'Заморожена' }
    };
    
    const statusInfo = statuses[status] || statuses['запланирована'];
    const StatusIcon = statusInfo.icon;
    
    return (
      <div className={`badge ${statusInfo.class}`}>
        <StatusIcon className="badge-icon" />
        <span>{statusInfo.text}</span>
      </div>
    );
  };
  
  const canModify = status === 'запланирована';
  
  return (
    <div className={`cleaning-card ${status}`}>
      <div className="cleaning-card-header">
        <h3 className="cleaning-card-title">Уборка</h3>
        {getStatusBadge()}
      </div>
      
      <div className="cleaning-card-details">
        <div className="cleaning-detail">
          <FaCalendarAlt className="cleaning-detail-icon" />
          <span>{formatDate(date)}</span>
        </div>
        
        <div className="cleaning-detail">
          <FaClock className="cleaning-detail-icon" />
          <span>{formatTime(date)}</span>
        </div>
      </div>
      
      {canModify && (
        <div className="cleaning-card-actions">
          <button 
            className="button button-secondary button-small" 
            onClick={() => onReschedule(cleaning)}
          >
            Перенести
          </button>
          <button 
            className="button button-danger button-small" 
            onClick={() => onCancel(cleaning)}
          >
            Отменить
          </button>
        </div>
      )}
    </div>
  );
};

export default CleaningCard; 