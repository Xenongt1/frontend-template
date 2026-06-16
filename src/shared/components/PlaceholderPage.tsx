import React from 'react';

interface PlaceholderPageProps {
  title: string;
}

const PlaceholderPage: React.FC<PlaceholderPageProps> = ({ title }) => (
  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 16, overflow: 'hidden' }}>
    <div style={{
      color: 'var(--Body-Text-Primary, #08283B)',
      fontSize: 20,
      fontFamily: 'Inter',
      fontWeight: '500',
      lineHeight: '30px',
      flexShrink: 0,
    }}>
      {title}
    </div>
    <div style={{
      flex: 1,
      background: 'var(--Background-General-Light, #FDFDFD)',
      borderRadius: 8,
    }} />
  </div>
);

export default PlaceholderPage;
