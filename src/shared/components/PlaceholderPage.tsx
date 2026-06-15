import React from 'react';

interface PlaceholderPageProps {
  title: string;
  description?: string;
}

const PlaceholderPage: React.FC<PlaceholderPageProps> = ({ title, description }) => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 300, gap: 8 }}>
    <h2 style={{ margin: 0, fontFamily: 'Inter', fontWeight: 600, fontSize: 20, color: '#041620' }}>{title}</h2>
    {description && <p style={{ margin: 0, fontFamily: 'Inter', fontSize: 14, color: '#395362' }}>{description}</p>}
    <p style={{ margin: 0, fontFamily: 'Inter', fontSize: 13, color: '#6B7A85' }}>Coming soon</p>
  </div>
);

export default PlaceholderPage;
