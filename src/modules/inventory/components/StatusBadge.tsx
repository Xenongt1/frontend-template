import React from 'react';
import { useTranslation } from 'react-i18next';
import type { InventoryStatus } from '../types';

// Per Figma catalogue spec.
//   ACTIVE           → Green chip
//   INTAKE_SUSPENDED → Pink chip
//   INACTIVE         → Red chip (kept; not in catalogue spec but used elsewhere)
const CLASSES: Record<InventoryStatus, string> = {
  ACTIVE:           'bg-[#F3FAF7] border border-[#DEF7EC] text-[#03543F]',
  INACTIVE:         'bg-[#FDF2F2] border border-[#FDE8E8] text-[#9B1C1C]',
  INTAKE_SUSPENDED: 'bg-[#FCE8F3] border border-[#FCE8F3] text-[#99154B]',
};

const LABEL_KEYS: Record<InventoryStatus, string> = {
  ACTIVE:           'status.active',
  INACTIVE:         'status.inactive',
  INTAKE_SUSPENDED: 'status.intakeSuspended',
};

interface Props {
  status: InventoryStatus;
}

const StatusBadge: React.FC<Props> = ({ status }) => {
  const { t } = useTranslation();
  return (
    <span
      className={`inline-flex items-center justify-center px-2.5 py-0.5 rounded-md font-inter text-xs font-medium leading-[18px] whitespace-nowrap ${CLASSES[status]}`}
    >
      {t(LABEL_KEYS[status])}
    </span>
  );
};

export default StatusBadge;
