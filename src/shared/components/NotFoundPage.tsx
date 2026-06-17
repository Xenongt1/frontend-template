import React from 'react';
import { useNavigate, useRouter } from '@tanstack/react-router';
import ErrorPage from './ErrorPage';
import illustrationSrc from '@/assert/error-illustrations/404.svg';

const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();
  const router = useRouter();

  return (
    <ErrorPage
      illustration={<img src={illustrationSrc} alt="" width={312} height={190} />}
      title="Page Not Found"
      description="The page you're looking for doesn't exist or may have been moved."
      secondaryAction={{ label: 'Browse Pages', onClick: () => router.history.back() }}
      primaryAction={{ label: 'Go to Home', onClick: () => navigate({ to: '/' }) }}
    />
  );
};

export default NotFoundPage;
