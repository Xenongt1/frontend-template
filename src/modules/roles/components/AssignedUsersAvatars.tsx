import React from 'react';
import { initialsOf } from '../utils/initials';

interface AvatarPreview {
  /** Stable identifier (e.g. member id). Used as the React key. */
  id: string;
  /** Optional avatar URL. When omitted, an initials swatch is rendered. */
  url?: string;
  /** Display name used to derive initials when `url` is absent. */
  name?: string;
}

interface AssignedUsersAvatarsProps {
  /** Total number of assigned members. */
  count: number;
  /** Optional preview members (first N). Each entry needs a stable id. */
  previews?: AvatarPreview[];
  /** How many avatars to show before collapsing into a +N badge. */
  maxAvatars?: number;
}

const INITIALS_BG = 'bg-[#C3C3C2]';
const OVERFLOW_BG_CLASS = 'bg-[#222220]';

/**
 * Avatar group matching the design (32px circles, 1.5px white separator,
 * dark "+N" overflow badge). When a preview has no `url`, the member's
 * initials are rendered on a neutral swatch — mirrors the popover.
 */
const AssignedUsersAvatars: React.FC<AssignedUsersAvatarsProps> = ({
  count,
  previews = [],
  maxAvatars = 3,
}) => {
  const visible = Math.min(count, maxAvatars);
  const overflow = Math.max(0, count - visible);

  if (count === 0) {
    return <span className="text-[14px] text-navy-500">—</span>;
  }

  const visiblePreviews = previews.slice(0, visible);

  return (
    <div className="inline-flex items-center">
      {visiblePreviews.map((p) => {
        if (p.url) {
          return (
            <span
              key={p.id}
              className="inline-flex items-center justify-center w-8 h-8 rounded-full border-[1.5px] border-canvas-50 -ml-2 first:ml-0 overflow-hidden"
            >
              <img src={p.url} alt="" className="w-full h-full object-cover" />
            </span>
          );
        }
        return (
          <span
            key={p.id}
            className={`inline-flex items-center justify-center w-8 h-8 rounded-full border-[1.5px] border-canvas-50 -ml-2 first:ml-0 text-[12px] font-medium text-[#222220] ${INITIALS_BG}`}
          >
            {initialsOf(p.name ?? '')}
          </span>
        );
      })}
      {overflow > 0 && (
        <span
          className={`inline-flex items-center justify-center w-8 h-8 rounded-full border-[1.5px] border-canvas-50 -ml-2 text-[12px] font-medium text-canvas-50 ${OVERFLOW_BG_CLASS}`}
        >
          +{overflow}
        </span>
      )}
    </div>
  );
};

export default AssignedUsersAvatars;
