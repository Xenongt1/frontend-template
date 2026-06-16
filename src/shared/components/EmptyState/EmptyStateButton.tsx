import React from 'react';
import { Plus } from 'lucide-react';

interface EmptyStateButtonProps {
  label: string;
  onClick: () => void;
}

const EmptyStateButton: React.FC<EmptyStateButtonProps> = ({ label, onClick }) => {
  const [isHovered, setIsHovered] = React.useState(false);

  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        display: 'flex',
        padding: '10px 20px',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '8px',
        borderRadius: '8px',
        background: isHovered
          ? '#0a1f2e'
          : 'var(--Buttons-Filled-Dark-Blue-Default, #08283B)',
        border: 'none',
        cursor: 'pointer',
        color: 'var(--Buttons-Filled-Dark-Blue-Text, #FDFDFD)',
        fontSize: '14px',
        fontWeight: '500',
        fontFamily: "'Inter', system-ui, sans-serif",
        transition: 'all 0.2s ease',
        boxShadow: isHovered
          ? '0 4px 12px rgba(8, 40, 59, 0.3)'
          : '0 2px 8px rgba(8, 40, 59, 0.2)',
        transform: isHovered ? 'translateY(-1px)' : 'translateY(0)',
      }}
    >
      <Plus size={20} color="var(--Buttons-Filled-Dark-Blue-Icon, #FDFDFD)" strokeWidth={2} aria-hidden="true" />
      {label}
    </button>
  );
};

export default EmptyStateButton;
