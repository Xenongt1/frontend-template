import React from 'react';

interface PlaceholderPageProps {
  title: string;
}

const PlaceholderPage: React.FC<PlaceholderPageProps> = ({ title }) => (
  <div className="flex-1 flex flex-col gap-4 overflow-hidden">
    <div className="font-inter text-xl font-medium leading-[30px] text-text-primary shrink-0">
      {title}
    </div>
    <div className="flex-1 bg-canvas-50 rounded-lg" />
  </div>
);

export default PlaceholderPage;
