import React from 'react';
import { useTranslation } from 'react-i18next';

const DashboardPage: React.FC = () => {
  const { t } = useTranslation();
  return (
    <div className="card">
      <h1 className="text-3xl font-bold text-gray-900">{t('page.dashboard')}</h1>
      <p className="text-gray-600 mt-2">{t('page.dashboardWelcome')}</p>
    </div>
  );
};

export default DashboardPage;
