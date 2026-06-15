import React from 'react';
import { ArrowLeft } from 'lucide-react';

interface BackButtonProps {
  label: string;
  onClick: () => void;
}

export const BackButton: React.FC<BackButtonProps> = ({ label, onClick }) => (
  <button
    onClick={onClick}
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 8,
      padding: '8px 12px',
      background: '#FDFDFD',
      border: '1px solid var(--Stroke-Default-Medium, #B2BCC2)',
      borderRadius: 8,
      cursor: 'pointer',
      alignSelf: 'flex-start',
    }}
  >
    <ArrowLeft size={16} color="#061C2A" />
    <span style={{
      fontFamily: 'Inter',
      fontWeight: 500,
      fontSize: 14,
      lineHeight: '21px',
      color: '#061C2A',
      whiteSpace: 'nowrap',
    }}>
      {label}
    </span>
  </button>
);

interface InventoryPageHeaderProps {
  title: string;
  subtitle: string;
}

export const InventoryPageHeader: React.FC<InventoryPageHeaderProps> = ({ title, subtitle }) => (
  <div style={{
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  }}>
    <h1 style={{
      margin: 0,
      fontFamily: 'Inter',
      fontWeight: 600,
      fontSize: 18,
      lineHeight: '28px',
      color: '#041620',
    }}>
      {title}
    </h1>
    <p style={{
      margin: 0,
      fontFamily: 'Inter',
      fontWeight: 400,
      fontSize: 14,
      lineHeight: '20px',
      color: 'var(--Body-Text-Primary, #08283B)',
    }}>
      {subtitle}
    </p>
  </div>
);

interface InventoryPageShellProps {
  children: React.ReactNode;
}

const InventoryPageShell: React.FC<InventoryPageShellProps> = ({ children }) => (
  <div style={{
    background: 'var(--Page-Background, #F7F7F7)',
    minHeight: '100%',
    padding: 24,
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
    boxSizing: 'border-box',
  }}>
    {children}
  </div>
);

export default InventoryPageShell;
