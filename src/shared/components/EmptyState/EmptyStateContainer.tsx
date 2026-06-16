import React from 'react';

interface EmptyStateContainerProps {
  children: React.ReactNode;
}

const EmptyStateContainer: React.FC<EmptyStateContainerProps> = ({ children }) => {
  return (
    <section
      aria-label="Empty state"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
        minHeight: 0,
        alignSelf: 'stretch',
        gap: 'clamp(12px, 2vh, 24px)',
        padding: 'clamp(16px, 3vh, 48px) clamp(16px, 4vw, 80px)',
        background: 'var(--Background-General-Light, #FDFDFD)',
        borderRadius: '8px',
      }}
    >
      {children}
    </section>
  );
};

export default EmptyStateContainer;
