import React from 'react';

const CLASSES: Record<string, string> = {
  RAW_MATERIAL: 'bg-[#DEF7EC] border border-[#84E1BC] text-[#03543F]',
  CONSUMABLES: 'bg-[#FFF9E6] border border-[#FFEBB0] text-[#8C6900]',
  FOOD: 'bg-[#FFF9E6] border border-[#FFEBB0] text-[#8C6900]',
  FINISHED_GOODS: 'bg-[#F3FAF7] border border-[#DEF7EC] text-[#03543F]',
  CONSTRUCTION: 'bg-[#DEF7EC] border border-[#84E1BC] text-[#03543F]',
  VEHICLES: 'bg-[#EDF2FF] border border-[#C5D8FF] text-[#1A4DC5]',
  ELECTRONICS: 'bg-[#EDF2FF] border border-[#C5D8FF] text-[#1A4DC5]',
};

interface Props {
  category: string;
}

const CategoryBadge: React.FC<Props> = ({ category }) => {
  const label = category.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
  const className = CLASSES[category] ?? 'bg-[#EDF2FF] border border-[#C5D8FF] text-[#1A4DC5]';

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[13px] font-medium ${className}`}>
      {label}
    </span>
  );
};

export default CategoryBadge;
