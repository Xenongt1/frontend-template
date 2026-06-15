import React from 'react';
import { useTranslation } from 'react-i18next';
import type { InventoryStatus } from '../types';

const CLASSES: Record<InventoryStatus, string> = {
  ACTIVE:           'bg-[#F3FAF7] border border-[#DEF7EC] text-[#03543F]',
  INACTIVE:         'bg-[#FDF2F2] border border-[#FDE8E8] text-[#9B1C1C]',
  INTAKE_SUSPENDED: 'bg-[#FDF2F2] border border-[#99154B] text-[#9B1C1C]',
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
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-[13px] font-medium whitespace-nowrap ${CLASSES[status]}`}>
      {t(LABEL_KEYS[status])}
    </span>
  );
};

export default StatusBadge;
