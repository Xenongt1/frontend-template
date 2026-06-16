import React from 'react';
import { useTranslation } from 'react-i18next';

const NotificationsPage: React.FC = () => {
  const { t } = useTranslation();
  return (
    <div className="card">
      <h1 className="text-3xl font-bold text-gray-900">{t('page.notifications')}</h1>
      <p className="text-gray-600 mt-2">{t('page.notificationsDescription')}</p>
    </div>
  );
};

export default NotificationsPage;
