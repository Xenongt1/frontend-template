import React from 'react';

interface PageHeaderProps {
  title: string;
  description?: string;
}

const PageHeader: React.FC<PageHeaderProps> = ({ title, description }) => (
  <div className="flex flex-col gap-1">
    <h1 className="m-0 font-semibold text-lg leading-7 text-[#041620]">{title}</h1>
    {description && (
      <p className="m-0 text-sm text-[#395362]">{description}</p>
    )}
  </div>
);

export default PageHeader;
