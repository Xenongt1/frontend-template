import React from 'react';
import { useNavigate } from '@tanstack/react-router';
import ErrorPage from './ErrorPage';
import illustrationSrc from '@/assert/error-illustrations/503.svg';

interface Props {
  onRetry?: () => void;
}

const ServiceUnavailablePage: React.FC<Props> = ({ onRetry }) => {
  const navigate = useNavigate();

  return (
    <ErrorPage
      illustration={<img src={illustrationSrc} alt="" width={300} height={296} />}
      title="Service Temporarily Unavailable"
      description="We're currently experiencing issues. Please try again in a few minutes."
      secondaryAction={{ label: 'Go to Home', onClick: () => navigate({ to: '/' }) }}
      primaryAction={{ label: 'Retry', onClick: onRetry ?? (() => window.location.reload()) }}
    />
  );
};

export default ServiceUnavailablePage;
