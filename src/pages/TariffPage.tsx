import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTelegram } from '../hooks/useTelegram';
import { tariffAPI } from '../services/api';
import '../styles/TariffPage.scss';

interface Tariff {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  cleaningsPerMonth: number;
}

const TariffPage: React.FC = () => {
  const [tariffs, setTariffs] = useState<Tariff[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { webApp } = useTelegram();
  const navigate = useNavigate();

  useEffect(() => {
    if (webApp) {
      webApp.BackButton.show();
      webApp.BackButton.onClick(() => navigate(-1));
    }

    // Загрузка тарифов
    const fetchTariffs = async () => {
      try {
        const response = await tariffAPI.getAllTariffs();
        setTariffs(response.data || []);
      } catch (err) {
        console.error('Ошибка при загрузке тарифов:', err);
        setError('Не удалось загрузить тарифы. Пожалуйста, попробуйте позже.');
      } finally {
        setLoading(false);
      }
    };

    fetchTariffs();
  }, [webApp, navigate]);

  const handleSelectTariff = (tariffId: string) => {
    // Здесь будет логика выбора тарифа
    navigate(`/tariffs/${tariffId}`);
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Загрузка тарифов...</p>
      </div>
    );
  }

  return (
    <motion.div
      className="tariff-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <h1 className="page-title">Тарифы</h1>
      <p className="page-subtitle">Выберите подходящий тариф для регулярной уборки</p>

      {error && <p className="error-message">{error}</p>}

      <div className="tariff-list">
        {tariffs.map((tariff) => (
          <div key={tariff.id} className="tariff-card" onClick={() => handleSelectTariff(tariff.id)}>
            <div className="tariff-header">
              <h2>{tariff.name}</h2>
              <span className="price">{tariff.basePrice} ₽/мес</span>
            </div>
            <div className="tariff-body">
              <p className="description">{tariff.description}</p>
              <p className="cleanings">
                <strong>{tariff.cleaningsPerMonth}</strong> уборок в месяц
              </p>
            </div>
            <button className="btn btn-primary btn-block">Выбрать</button>
          </div>
        ))}
      </div>

      {tariffs.length === 0 && !error && (
        <p className="no-tariffs">Тарифы не найдены</p>
      )}
    </motion.div>
  );
};

export default TariffPage; 