import React from 'react';
import NoInventoryIllustration from './NoInventoryIllustration';

interface EmptyStateIconProps {
  icon?: React.ReactNode;
  size?: number;
}

const EmptyStateIcon: React.FC<EmptyStateIconProps> = ({ icon, size = 120 }) => {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        flexShrink: 0,
      }}
    >
      {icon ? (
        <div
          style={{
            width: `${size}px`,
            height: `${size}px`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {icon}
        </div>
      ) : (
        <div
          style={{
            width: '100%',
            maxWidth: '300px',
            maxHeight: 'min(221px, 30vh)',
            aspectRatio: '300 / 221',
            flexShrink: 1,
            minHeight: 0,
          }}
        >
          <NoInventoryIllustration
            aria-label="No inventory items illustration"
            data-testid="no-inventory-illustration"
            style={{ width: '100%', height: '100%', display: 'block' }}
          />
        </div>
      )}
    </div>
  );
};

export default EmptyStateIcon;
