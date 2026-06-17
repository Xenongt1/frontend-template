import React from 'react';

// Per Figma catalogue spec — four themed chips matching the Category column.
const CLASSES: Record<string, string> = {
  // Indigo — raw materials
  RAW_MATERIAL: 'bg-[#F0F5FF] border border-[#E5EDFF] text-[#020769]',
  CONSTRUCTION: 'bg-[#F0F5FF] border border-[#E5EDFF] text-[#020769]',
  // Red — consumables
  CONSUMABLES:  'bg-[#FDF2F2] border border-[#FDE8E8] text-[#9B1C1C]',
  // Yellow — work in progress
  WIP:                 'bg-[#FFF9E6] border border-[#FFEBB0] text-[#8C6900]',
  WORK_IN_PROGRESS:    'bg-[#FFF9E6] border border-[#FFEBB0] text-[#8C6900]',
  // Green — finished goods
  FINISHED_GOODS: 'bg-[#F3FAF7] border border-[#DEF7EC] text-[#03543F]',
  FOOD:           'bg-[#F3FAF7] border border-[#DEF7EC] text-[#03543F]',
  VEHICLES:       'bg-[#F0F5FF] border border-[#E5EDFF] text-[#020769]',
  ELECTRONICS:    'bg-[#F0F5FF] border border-[#E5EDFF] text-[#020769]',
};

const LABELS: Record<string, string> = {
  RAW_MATERIAL: 'Raw',
  CONSUMABLES: 'Consumable',
  WIP: 'WIP',
  WORK_IN_PROGRESS: 'WIP',
  FINISHED_GOODS: 'Finished',
};

interface Props {
  category: string;
}

const CategoryBadge: React.FC<Props> = ({ category }) => {
  const upper = category.toUpperCase().replace(/\s+/g, '_');
  const label = LABELS[upper] ?? category.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  const className = CLASSES[upper] ?? 'bg-[#F0F5FF] border border-[#E5EDFF] text-[#020769]';

  return (
    <span
      className={`inline-flex items-center justify-center px-2.5 py-0.5 rounded-md font-inter text-xs font-medium leading-[18px] ${className}`}
    >
      {label}
    </span>
  );
};

export default CategoryBadge;
