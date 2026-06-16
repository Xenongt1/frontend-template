import React from 'react';
import Sidebar from './Sidebar';
import TopBar from './TopBar';

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  return (
    <div className="flex h-screen bg-[#FDFDFD] overflow-hidden">
      <Sidebar />
      <div className="flex flex-col flex-1 min-w-0 min-h-0 overflow-hidden">
        <TopBar />
        <main
          style={{
            flex: 1,
            minHeight: 0,
            overflow: 'hidden',
            background: 'var(--Page-Background, #F7F7F7)',
            padding: 24,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {children}
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
