import React from 'react';
import { CheckCircle2 } from 'lucide-react';

const FEATURE_BULLETS = [
  'Role-based access control across all modules',
  'Real-time status-driven workflow automation',
  'Immutable audit trail for compliance & review',
];

function ChainPilotIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" stroke="#E6EAEB" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <polyline points="7.5 4.21 12 6.81 16.5 4.21" stroke="#E6EAEB" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <polyline points="7.5 19.79 7.5 14.6 3 12" stroke="#E6EAEB" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <polyline points="21 12 16.5 14.6 16.5 19.79" stroke="#E6EAEB" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <polyline points="3.27 6.96 12 12.01 20.73 6.96" stroke="#E6EAEB" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <line x1="12" y1="22.08" x2="12" y2="12" stroke="#E6EAEB" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function BrandingPanel() {
  return (
    <div className="hidden lg:flex flex-col w-[42%] max-w-[601px] min-w-[420px] bg-[#041620] shrink-0 px-[107px] pt-[106px] pb-8 overflow-hidden">
      <div className="flex items-center gap-1 mb-24 shrink-0">
        <ChainPilotIcon />
        <span className="text-[#E6EAEB] font-semibold text-base leading-[1.5]">Chain Pilot</span>
      </div>
      <div className="flex flex-col gap-8 mb-28 shrink-0">
        <h1 className="font-['Poppins'] font-semibold text-[36px] leading-[1.5] text-[#FDFDFD]">
          Enterprise resource planning,{' '}
          <span className="text-[#5A6F7C]">simplified</span>.
        </h1>
        <p className="text-sm text-[#FDFDFD] font-normal leading-[1.5]">
          A unified platform for procurement, inventory, production, and finance — with enterprise-grade access control.
        </p>
      </div>
      <div className="flex flex-col gap-3 shrink-0">
        {FEATURE_BULLETS.map(text => (
          <div key={text} className="flex items-center gap-[13px]">
            <CheckCircle2 className="w-6 h-6 shrink-0 text-[#FDFDFD]" />
            <span className="text-sm text-[#FDFDFD] font-normal leading-[1.5]">{text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AuthLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="flex min-h-screen w-full overflow-hidden">
      <BrandingPanel />
      <div className="flex-1 bg-[#FDFDFD] flex items-center justify-center overflow-y-auto">
        <div className="w-full max-w-[441px] px-8 py-14 lg:px-0 lg:py-0">
          {children}
        </div>
      </div>
    </div>
  );
}
