import React from 'react';

interface EmptyStateLabelProps {
  title: string;
  description: string | string[];
}

const EmptyStateLabel: React.FC<EmptyStateLabelProps> = ({ title, description }) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '12px',
        alignSelf: 'stretch',
      }}
    >
      <h2
        style={{
          color: 'var(--Header-Text-Primary, #041620)',
          fontSize: '24px',
          fontFamily: "'Poppins', system-ui, sans-serif",
          fontWeight: '500',
          fontStyle: 'normal',
          lineHeight: '32px',
          textAlign: 'center',
          margin: 0,
        }}
      >
        {title}
      </h2>

      <div
        style={{
          color: 'var(--Body-Text-Secondary, #395362)',
          fontSize: '16px',
          fontFamily: "'Inter', system-ui, sans-serif",
          fontWeight: '400',
          lineHeight: '1.5',
          textAlign: 'center',
          maxWidth: '500px',
        }}
      >
        {Array.isArray(description) ? (
          description.map((line, i) => (
            <p key={line} style={{ margin: i < description.length - 1 ? 0 : undefined }}>
              {line}
            </p>
          ))
        ) : (
          <p style={{ margin: 0 }}>{description}</p>
        )}
      </div>
    </div>
  );
};

export default EmptyStateLabel;
