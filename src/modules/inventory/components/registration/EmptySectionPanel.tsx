import React from 'react';

interface EmptySectionPanelProps {
  children: React.ReactNode;
}

export const EmptySectionPanel: React.FC<EmptySectionPanelProps> = ({ children }) => (
  <div
    style={{
      alignSelf: 'stretch',
      width: '100%',
      paddingTop: 21,
      paddingBottom: 21,
      boxSizing: 'border-box',
      borderRadius: 6,
      border: '1px solid #E6EAEB',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}
  >
    <p
      style={{
        margin: 0,
        color: '#5A6F7C',
        fontSize: 14,
        fontFamily: "'Inter', system-ui, sans-serif",
        fontWeight: 500,
        lineHeight: '21px',
        textAlign: 'center',
      }}
    >
      {children}
    </p>
  </div>
);
