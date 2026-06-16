import React from 'react';

interface EmptyStateLabelProps {
  title: string;
  description: string | string[];
}

const EmptyStateLabel: React.FC<EmptyStateLabelProps> = ({ title, description }) => {
  return (
    <div className="flex flex-col items-center gap-3 self-stretch">
      <h2 className="m-0 font-poppins text-2xl font-medium leading-8 text-center text-brand-navy-dark">
        {title}
      </h2>

      <div className="font-inter text-base font-normal leading-[1.5] text-center text-text-secondary max-w-[500px]">
        {Array.isArray(description) ? (
          description.map((line, i) => (
            <p key={line} className={i < description.length - 1 ? 'm-0' : ''}>
              {line}
            </p>
          ))
        ) : (
          <p className="m-0">{description}</p>
        )}
      </div>
    </div>
  );
};

export default EmptyStateLabel;
