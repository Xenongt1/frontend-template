import React from 'react';
import NoInventoryIllustration from './NoInventoryIllustration';

interface EmptyStateIconProps {
  icon?: React.ReactNode;
  size?: number;
}

const EmptyStateIcon: React.FC<EmptyStateIconProps> = ({ icon, size = 120 }) => {
  return (
    <div className="flex justify-center items-center shrink-0">
      {icon ? (
        // Size is a runtime prop — keep inline so callers can vary it.
        <div
          style={{ width: size, height: size }}
          className="flex items-center justify-center"
        >
          {icon}
        </div>
      ) : (
        <div className="w-full max-w-[300px] max-h-[min(221px,30vh)] aspect-[300/221] shrink min-h-0">
          <NoInventoryIllustration
            aria-label="No inventory items illustration"
            data-testid="no-inventory-illustration"
            className="w-full h-full block"
          />
        </div>
      )}
    </div>
  );
};

export default EmptyStateIcon;
