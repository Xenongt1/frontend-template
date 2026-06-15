import React, { useMemo } from 'react';
import { Skeleton } from '@/shared/components/ui/Skeleton/Skeleton';

const tdClass = 'px-4 h-20 align-middle border-b border-canvas-300';

interface Props {
  rowCount?: number;
}

const InventoryTableSkeleton: React.FC<Props> = ({ rowCount = 10 }) => {
  const rowKeys = useMemo(
    () => Array.from({ length: rowCount }, () => crypto.randomUUID()),
    [rowCount]
  );

  return (
    <>
      {rowKeys.map((key) => (
        <tr key={key} className="bg-canvas-50">
          <td className={tdClass}>
            <Skeleton variant="text" className="w-20" />
          </td>
          <td className={tdClass}>
            <Skeleton variant="text" className="w-[85%]" />
          </td>
          <td className={`${tdClass} hide-on-mobile`}>
            <Skeleton variant="text" className="w-24" />
          </td>
          <td className={`${tdClass} hide-on-mobile`}>
            <Skeleton variant="text" className="w-16" />
          </td>
          <td className={tdClass}>
            <Skeleton variant="pill" className="w-24" />
          </td>
          <td className={`${tdClass} text-center`}>
            <Skeleton variant="circle" className="mx-auto h-8 w-8" />
          </td>
        </tr>
      ))}
    </>
  );
};

export default InventoryTableSkeleton;
