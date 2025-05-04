import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaUser, FaPhone, FaHome, FaCheck } from 'react-icons/fa';
import { useAuth } from '../hooks/useAuth';
import { useTelegram } from '../hooks/useTelegram';
import '../styles/ProfilePage.scss';

const ProfilePage: React.FC = () => {
  const { user, updateUser, logout } = useAuth();
  const { webApp } = useTelegram();
  const navigate = useNavigate();
  
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    address: user?.address || '',
    apartmentArea: user?.apartmentArea || 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  React.useEffect(() => {
    if (webApp) {
      webApp.BackButton.show();
      webApp.BackButton.onClick(() => navigate(-1));
    }
  }, [webApp, navigate]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'apartmentArea' ? Number(value) : value
    });
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      await updateUser(formData);
      setIsEditing(false);
      setSuccessMessage('Профиль успешно обновлен');
      
      // Скрываем сообщение об успехе через 3 секунды
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    } catch (err) {
      console.error('Ошибка при обновлении профиля:', err);
      setError('Не удалось обновить профиль. Пожалуйста, попробуйте позже.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleLogout = async () => {
    try {
      await logout();
      navigate('/auth');
    } catch (err) {
      console.error('Ошибка при выходе:', err);
    }
  };
  
  return (
    <motion.div 
      className="profile-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <h1 className="page-title">Профиль</h1>
      
      {error && <p className="error-message">{error}</p>}
      {successMessage && (
        <div className="success-message">
          <FaCheck /> {successMessage}
        </div>
      )}
      
      {isEditing ? (
        <form className="profile-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="name">Имя</label>
            <div className="input-with-icon">
              <FaUser className="input-icon" />
              <input
                type="text"
                id="name"
                name="name"
                className="form-input"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          
          <div className="form-group">
            <label className="form-label" htmlFor="phone">Телефон</label>
            <div className="input-with-icon">
              <FaPhone className="input-icon" />
              <input
                type="tel"
                id="phone"
                name="phone"
                className="form-input"
                value={formData.phone}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          
          <div className="form-group">
            <label className="form-label" htmlFor="address">Адрес</label>
            <div className="input-with-icon">
              <FaHome className="input-icon" />
              <input
                type="text"
                id="address"
                name="address"
                className="form-input"
                value={formData.address}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          
          <div className="form-group">
            <label className="form-label" htmlFor="apartmentArea">Площадь квартиры (м²)</label>
            <input
              type="number"
              id="apartmentArea"
              name="apartmentArea"
              className="form-input"
              value={formData.apartmentArea}
              onChange={handleChange}
              min="1"
              required
            />
          </div>
          
          <div className="form-actions">
            <button 
              type="submit" 
              className="btn btn-primary btn-block"
              disabled={loading}
            >
              {loading ? 'Сохранение...' : 'Сохранить'}
            </button>
            <button 
              type="button" 
              className="btn btn-secondary btn-block mt-2"
              onClick={() => setIsEditing(false)}
              disabled={loading}
            >
              Отмена
            </button>
          </div>
        </form>
      ) : (
        <div className="profile-info">
          <div className="info-item">
            <span className="info-label">Имя:</span>
            <span className="info-value">{user?.name}</span>
          </div>
          
          <div className="info-item">
            <span className="info-label">Телефон:</span>
            <span className="info-value">{user?.phone}</span>
          </div>
          
          {user?.address && (
            <div className="info-item">
              <span className="info-label">Адрес:</span>
              <span className="info-value">{user.address}</span>
            </div>
          )}
          
          {user?.apartmentArea && (
            <div className="info-item">
              <span className="info-label">Площадь:</span>
              <span className="info-value">{user.apartmentArea} м²</span>
            </div>
          )}
          
          {user?.tariff && (
            <div className="info-item tariff-info">
              <span className="info-label">Текущий тариф:</span>
              <span className="info-value">{user.tariff.name}</span>
            </div>
          )}
          
          <button 
            className="btn btn-primary btn-block mt-4"
            onClick={() => setIsEditing(true)}
          >
            Редактировать
          </button>
          
          <button 
            className="btn btn-secondary btn-block mt-2"
            onClick={handleLogout}
          >
            Выйти
          </button>
        </div>
      )}
    </motion.div>
  );
};

export default ProfilePage; 