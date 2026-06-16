import React from 'react';

interface EmptyStateContainerProps {
  children: React.ReactNode;
}

const EmptyStateContainer: React.FC<EmptyStateContainerProps> = ({ children }) => {
  return (
    <section
      aria-label="Empty state"
      className="flex flex-col items-center justify-center flex-1 min-h-0 self-stretch bg-canvas-50 rounded-lg gap-[clamp(12px,2vh,24px)] px-[clamp(16px,4vw,80px)] py-[clamp(16px,3vh,48px)]"
    >
      {children}
    </section>
  );
};

export default EmptyStateContainer;
