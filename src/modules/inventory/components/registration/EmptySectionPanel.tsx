import React from 'react';

interface EmptySectionPanelProps {
  children: React.ReactNode;
}

export const EmptySectionPanel: React.FC<EmptySectionPanelProps> = ({ children }) => (
  <div className="self-stretch w-full py-[21px] box-border rounded-md border border-stroke-light flex items-center justify-center">
    <p className="m-0 font-inter text-sm font-medium leading-[21px] text-center text-text-tertiary">
      {children}
    </p>
  </div>
);
