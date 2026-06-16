import React from 'react';
import illustrationSrc from '@/assert/Empty-state-illustration.svg';

const PanaIllustration: React.FC = () => (
  <img
    src={illustrationSrc}
    alt=""
    width={290}
    height={220}
    style={{ display: 'block', flexShrink: 0 }}
  />
);

export default PanaIllustration;
