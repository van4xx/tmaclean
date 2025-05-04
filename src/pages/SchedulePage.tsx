import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import DatePicker, { registerLocale } from 'react-datepicker';
import { addDays, startOfDay } from 'date-fns';
import { ru } from 'date-fns/locale';
import { FaRegCalendarAlt, FaClock, FaArrowLeft, FaCheck } from 'react-icons/fa';
import { useAuth } from '../hooks/useAuth';
import { useTelegram } from '../hooks/useTelegram';
import { cleaningAPI } from '../services/api';
import 'react-datepicker/dist/react-datepicker.css';
import '../styles/SchedulePage.scss';

// Регистрируем русскую локализацию для DatePicker
registerLocale('ru', ru);

// Доступные временные слоты
const TIME_SLOTS = [
  '09:00', '10:00', '11:00', '12:00', '13:00', 
  '14:00', '15:00', '16:00', '17:00'
];

const SchedulePage: React.FC = () => {
  const { user } = useAuth();
  const { webApp, sendData } = useTelegram();
  const navigate = useNavigate();
  
  const [step, setStep] = useState<'date' | 'time' | 'confirm'>('date');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  
  // Проверяем, есть ли активная подписка
  const hasActiveSubscription = user?.subscription?.active;
  
  // Определяем минимальную доступную дату (завтра или послезавтра в зависимости от времени)
  const now = new Date();
  const tomorrow = addDays(startOfDay(now), 1);
  const afterTomorrow = addDays(startOfDay(now), 2);
  const is20PMPassed = now.getHours() >= 20;
  const minDate = is20PMPassed ? afterTomorrow : tomorrow;
  
  // Определяем максимальную доступную дату (через 30 дней)
  const maxDate = addDays(now, 30);
  
  useEffect(() => {
    if (webApp) {
      webApp.BackButton.show();
      webApp.BackButton.onClick(() => {
        if (step === 'time') {
          setStep('date');
        } else if (step === 'confirm') {
          setStep('time');
        } else {
          navigate(-1);
        }
      });
    }
  }, [webApp, step, navigate]);
  
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        navigate('/cleanings');
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [success, navigate]);
  
  // Проверяем, есть ли уже уборка на выбранную дату
  const isDateBooked = (date: Date): boolean => {
    if (!user?.cleanings) return false;
    
    return user.cleanings.some(cleaning => {
      const cleaningDate = new Date(cleaning.date);
      return (
        cleaningDate.getDate() === date.getDate() &&
        cleaningDate.getMonth() === date.getMonth() &&
        cleaningDate.getFullYear() === date.getFullYear() &&
        cleaning.status === 'запланирована'
      );
    });
  };
  
  const handleDateSelect = (date: Date) => {
    if (isDateBooked(date)) {
      setError('На выбранную дату уже запланирована уборка');
      return;
    }
    
    setSelectedDate(date);
    setError(null);
    setStep('time');
  };
  
  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
    setStep('confirm');
  };
  
  const handleConfirm = async () => {
    if (!selectedDate || !selectedTime) {
      setError('Пожалуйста, выберите дату и время');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // Создаем дату с учетом выбранного времени
      const [hours, minutes] = selectedTime.split(':').map(Number);
      const scheduledDate = new Date(selectedDate);
      scheduledDate.setHours(hours, minutes, 0, 0);
      
      // Отправляем данные в Telegram Bot
      if (webApp && sendData) {
        sendData({
          action: 'schedule_cleaning',
          date: scheduledDate.toISOString(),
          time: selectedTime
        });
      }
      
      // Отправляем запрос на сервер через API
      const response = await cleaningAPI.scheduleCleaning({
        date: scheduledDate.toISOString(),
        time: selectedTime
      });

      console.log('Cleaning scheduled successfully:', response.data);
      
      setSuccess(true);
    } catch (err) {
      console.error('Ошибка при планировании уборки:', err);
      setError('Не удалось запланировать уборку. Пожалуйста, попробуйте позже.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleBack = () => {
    if (step === 'time') {
      setStep('date');
    } else if (step === 'confirm') {
      setStep('time');
    } else {
      navigate(-1);
    }
  };
  
  // Если нет активной подписки, показываем уведомление
  if (!hasActiveSubscription) {
    return (
      <motion.div 
        className="schedule-page"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <div className="no-subscription">
          <h2>У вас нет активной подписки</h2>
          <p>Чтобы назначить уборку, необходимо выбрать тариф и оплатить подписку.</p>
          <button 
            className="btn btn-primary btn-block mt-3" 
            onClick={() => navigate('/tariffs')}
          >
            Выбрать тариф
          </button>
          <button 
            className="btn btn-secondary btn-block mt-2" 
            onClick={() => navigate(-1)}
          >
            Назад
          </button>
        </div>
      </motion.div>
    );
  }
  
  // Если успешно запланирована уборка
  if (success) {
    return (
      <motion.div 
        className="schedule-page"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <div className="success-container">
          <div className="success-icon">
            <FaCheck />
          </div>
          <h2>Уборка запланирована!</h2>
          <p>
            Дата: {selectedDate?.toLocaleDateString('ru', { day: 'numeric', month: 'long' })}
            <br />
            Время: {selectedTime}
          </p>
          <p className="redirect-message">Сейчас вы будете перенаправлены на страницу "Мои уборки"...</p>
        </div>
      </motion.div>
    );
  }
  
  return (
    <motion.div 
      className="schedule-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <button className="back-button" onClick={handleBack}>
        <FaArrowLeft />
      </button>
      
      {step === 'date' && (
        <div className="date-selection">
          <h2>Выберите дату уборки</h2>
          <p className="instructions">
            Можно выбрать дату не ранее {minDate.toLocaleDateString('ru', { day: 'numeric', month: 'long' })}
          </p>
          
          <div className="datepicker-container">
            <FaRegCalendarAlt className="calendar-icon" />
            <DatePicker
              selected={selectedDate}
              onChange={handleDateSelect}
              minDate={minDate}
              maxDate={maxDate}
              locale="ru"
              dateFormat="dd MMMM yyyy"
              inline
              filterDate={(date: Date) => !isDateBooked(date)}
            />
          </div>
          
          {error && <p className="error-message">{error}</p>}
        </div>
      )}
      
      {step === 'time' && selectedDate && (
        <div className="time-selection">
          <h2>Выберите время уборки</h2>
          <p className="selected-date">
            {selectedDate.toLocaleDateString('ru', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
          
          <div className="time-slots">
            {TIME_SLOTS.map((time) => (
              <button
                key={time}
                className={`time-slot ${selectedTime === time ? 'selected' : ''}`}
                onClick={() => handleTimeSelect(time)}
              >
                <FaClock className="time-icon" />
                {time}
              </button>
            ))}
          </div>
        </div>
      )}
      
      {step === 'confirm' && selectedDate && selectedTime && (
        <div className="confirmation">
          <h2>Подтверждение</h2>
          
          <div className="booking-details">
            <div className="detail">
              <span className="label">Дата:</span>
              <span className="value">
                {selectedDate.toLocaleDateString('ru', { day: 'numeric', month: 'long', year: 'numeric' })}
              </span>
            </div>
            <div className="detail">
              <span className="label">Время:</span>
              <span className="value">{selectedTime}</span>
            </div>
            <div className="detail">
              <span className="label">Тариф:</span>
              <span className="value">{user?.tariff?.name}</span>
            </div>
            {user?.address && (
              <div className="detail">
                <span className="label">Адрес:</span>
                <span className="value">{user.address}</span>
              </div>
            )}
          </div>
          
          <div className="actions">
            <button 
              className="btn btn-primary btn-block" 
              onClick={handleConfirm}
              disabled={loading}
            >
              {loading ? 'Планирование...' : 'Подтвердить'}
            </button>
            <button 
              className="btn btn-secondary btn-block mt-2" 
              onClick={handleBack}
              disabled={loading}
            >
              Изменить
            </button>
          </div>
          
          {error && <p className="error-message">{error}</p>}
        </div>
      )}
    </motion.div>
  );
};

export default SchedulePage; 