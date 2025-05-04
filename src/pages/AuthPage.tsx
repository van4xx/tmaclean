import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaPhone, FaUser } from 'react-icons/fa';
import { useAuth } from '../hooks/useAuth';
import { useTelegram } from '../hooks/useTelegram';
import '../styles/AuthPage.scss';

const AuthPage: React.FC = () => {
  const { login, register, user, error: authError } = useAuth();
  const { webApp, user: telegramUser } = useTelegram();
  const navigate = useNavigate();
  
  const [isLogin, setIsLogin] = useState(true);
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Если пользователь уже авторизован, перенаправляем на главную
  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);
  
  useEffect(() => {
    if (telegramUser?.first_name) {
      setName(telegramUser.first_name);
    }
    
    if (webApp) {
      webApp.BackButton.hide();
      webApp.MainButton.hide();
    }
  }, [webApp, telegramUser]);
  
  const validatePhone = (phoneNumber: string): boolean => {
    const phoneRegex = /^\+?[0-9]{10,12}$/;
    return phoneRegex.test(phoneNumber);
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!validatePhone(phone)) {
      setError('Пожалуйста, введите корректный номер телефона');
      return;
    }
    
    setLoading(true);
    
    try {
      if (isLogin) {
        await login(phone);
      } else {
        if (!name) {
          setError('Пожалуйста, введите ваше имя');
          setLoading(false);
          return;
        }
        
        await register({ name, phone });
      }
      
      // После успешной авторизации/регистрации перенаправляем пользователя
      navigate('/');
    } catch (err) {
      console.error('Ошибка авторизации:', err);
      setError('Не удалось выполнить запрос. Пожалуйста, попробуйте позже.');
    } finally {
      setLoading(false);
    }
  };
  
  const toggleAuthMode = () => {
    setIsLogin(!isLogin);
    setError(null);
  };
  
  return (
    <motion.div 
      className="auth-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="auth-container">
        <h1 className="auth-title">{isLogin ? 'Вход' : 'Регистрация'}</h1>
        
        {(error || authError) && (
          <div className="error-message">
            {error || authError}
          </div>
        )}
        
        <form className="auth-form" onSubmit={handleSubmit}>
          {!isLogin && (
            <div className="form-group">
              <label className="form-label" htmlFor="name">Имя</label>
              <div className="input-with-icon">
                <FaUser className="input-icon" />
                <input
                  type="text"
                  id="name"
                  className="form-input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ваше имя"
                  required={!isLogin}
                />
              </div>
            </div>
          )}
          
          <div className="form-group">
            <label className="form-label" htmlFor="phone">Номер телефона</label>
            <div className="input-with-icon">
              <FaPhone className="input-icon" />
              <input
                type="tel"
                id="phone"
                className="form-input"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+7 (___) ___-__-__"
                required
              />
            </div>
          </div>
          
          <button 
            type="submit" 
            className="btn btn-primary btn-block"
            disabled={loading}
          >
            {loading 
              ? (isLogin ? 'Вход...' : 'Регистрация...') 
              : (isLogin ? 'Войти' : 'Зарегистрироваться')}
          </button>
        </form>
        
        <div className="auth-footer">
          <button 
            className="toggle-auth-mode" 
            onClick={toggleAuthMode}
            disabled={loading}
          >
            {isLogin 
              ? 'Нет аккаунта? Зарегистрироваться' 
              : 'Уже есть аккаунт? Войти'}
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default AuthPage; 