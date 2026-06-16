import React from 'react';
import EmptyStateContainer from './EmptyStateContainer';
import EmptyStateIcon from './EmptyStateIcon';
import EmptyStateLabel from './EmptyStateLabel';
import EmptyStateButton from './EmptyStateButton';

interface EmptyStateProps {
  title: string;
  description: string | string[];
  actionLabel?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
  iconSize?: number;
  showIcon?: boolean;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  actionLabel,
  onAction,
  icon,
  iconSize = 120,
  showIcon = true,
}) => {
  return (
    <EmptyStateContainer>
      {showIcon && <EmptyStateIcon icon={icon} size={iconSize} />}
      <EmptyStateLabel title={title} description={description} />
      {actionLabel && onAction && <EmptyStateButton label={actionLabel} onClick={onAction} />}
    </EmptyStateContainer>
  );
};

export { default as PanaIllustration } from './PanaIllustration';
export default EmptyState;
