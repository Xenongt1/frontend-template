import React from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';

const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
      <div className="text-center max-w-md">
        <p className="text-6xl font-bold text-primary-600 mb-4">404</p>
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">
          {t('notFound.title')}
        </h1>
        <p className="text-gray-500 mb-8">
          {t('notFound.description')}
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => window.history.back()}
            className="px-5 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors"
          >
            {t('notFound.goBack')}
          </button>
          <button
            onClick={() => navigate({ to: '/dashboard', replace: true })}
            className="px-5 py-2 rounded-md bg-primary-600 text-white hover:bg-primary-700 transition-colors"
          >
            {t('notFound.goHome')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
