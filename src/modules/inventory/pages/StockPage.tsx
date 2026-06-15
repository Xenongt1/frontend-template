import React from 'react';
import { useTranslation } from 'react-i18next';
import PlaceholderPage from '@/shared/components/PlaceholderPage';

const StockPage: React.FC = () => {
  const { t } = useTranslation();
  return <PlaceholderPage title={t('page.stock')} />;
};

export default StockPage;
