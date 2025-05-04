import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { FaCalendarAlt, FaTrash, FaExchangeAlt } from 'react-icons/fa';
import { useTelegram } from '../hooks/useTelegram';
import { cleaningAPI } from '../services/api';
import '../styles/MyCleaningsPage.scss';

interface Cleaning {
  id: string;
  date: string;
  status: 'запланирована' | 'завершена' | 'отменена';
}

const MyCleaningsPage: React.FC = () => {
  const { webApp } = useTelegram();
  const navigate = useNavigate();
  
  const [cleanings, setCleanings] = useState<Cleaning[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    if (webApp) {
      webApp.BackButton.show();
      webApp.BackButton.onClick(() => navigate(-1));
    }
    
    // Загрузка данных об уборках
    const fetchCleanings = async () => {
      try {
        const response = await cleaningAPI.getCleanings();
        setCleanings(response.data || []);
      } catch (err) {
        console.error('Ошибка при загрузке уборок:', err);
        setError('Не удалось загрузить уборки. Пожалуйста, попробуйте позже.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchCleanings();
  }, [webApp, navigate]);
  
  const handleCancelCleaning = async (cleaningId: string) => {
    if (!window.confirm('Вы действительно хотите отменить уборку?')) {
      return;
    }
    
    try {
      await cleaningAPI.cancelCleaning(cleaningId);
      
      // Обновляем список уборок после отмены
      setCleanings(prevCleanings => 
        prevCleanings.map(cleaning => 
          cleaning.id === cleaningId 
            ? { ...cleaning, status: 'отменена' } 
            : cleaning
        )
      );
    } catch (err) {
      console.error('Ошибка при отмене уборки:', err);
      alert('Не удалось отменить уборку. Пожалуйста, попробуйте позже.');
    }
  };
  
  const handleRescheduleCleaning = (cleaningId: string) => {
    navigate(`/reschedule/${cleaningId}`);
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, 'PPP', { locale: ru });
  };
  
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, 'HH:mm', { locale: ru });
  };
  
  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Загрузка уборок...</p>
      </div>
    );
  }
  
  return (
    <motion.div 
      className="my-cleanings-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <h1 className="page-title">Мои уборки</h1>
      
      {error && <p className="error-message">{error}</p>}
      
      {cleanings.length > 0 ? (
        <div className="cleanings-list">
          {cleanings
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
            .map(cleaning => (
              <div 
                key={cleaning.id} 
                className={`cleaning-card ${cleaning.status === 'отменена' ? 'cancelled' : ''}`}
              >
                <div className="cleaning-icon">
                  <FaCalendarAlt />
                </div>
                <div className="cleaning-details">
                  <div className="cleaning-date">
                    {formatDate(cleaning.date)}
                  </div>
                  <div className="cleaning-time">
                    {formatTime(cleaning.date)}
                  </div>
                  <div className="cleaning-status">
                    Статус: <span className={`status-${cleaning.status}`}>{cleaning.status}</span>
                  </div>
                </div>
                {cleaning.status === 'запланирована' && (
                  <div className="cleaning-actions">
                    <button 
                      className="action-button reschedule" 
                      onClick={() => handleRescheduleCleaning(cleaning.id)}
                      title="Перенести уборку"
                    >
                      <FaExchangeAlt />
                    </button>
                    <button 
                      className="action-button cancel" 
                      onClick={() => handleCancelCleaning(cleaning.id)}
                      title="Отменить уборку"
                    >
                      <FaTrash />
                    </button>
                  </div>
                )}
              </div>
            ))}
        </div>
      ) : (
        <div className="no-cleanings">
          <p>У вас пока нет запланированных уборок</p>
          <button 
            className="btn btn-primary btn-block mt-3"
            onClick={() => navigate('/schedule')}
          >
            Запланировать уборку
          </button>
        </div>
      )}
      
      {cleanings.length > 0 && (
        <button 
          className="btn btn-primary btn-block mt-3"
          onClick={() => navigate('/schedule')}
        >
          Запланировать новую уборку
        </button>
      )}
    </motion.div>
  );
};

export default MyCleaningsPage; 