import React from 'react';
import ErrorPage from './ErrorPage';
import illustrationSrc from '@/assert/error-illustrations/connection-lost.svg';

interface Props {
  onRetry?: () => void;
  onAdvanced?: () => void;
}

const ConnectionLostPage: React.FC<Props> = ({ onRetry, onAdvanced }) => (
  <ErrorPage
    illustration={<img src={illustrationSrc} alt="" width={300} height={304} />}
    title="Connection Lost"
    description="We're having trouble connecting. Please check your internet connection and try again."
    secondaryAction={onAdvanced ? { label: 'Advanced', onClick: onAdvanced } : undefined}
    primaryAction={{ label: 'Retry', onClick: onRetry ?? (() => window.location.reload()) }}
  />
);

export default ConnectionLostPage;
