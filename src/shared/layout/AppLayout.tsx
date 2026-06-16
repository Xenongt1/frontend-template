import React from 'react';
import Sidebar from './Sidebar';
import TopBar from './TopBar';

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  return (
    <div className="flex h-screen bg-canvas-50 overflow-hidden">
      <Sidebar />
      <div className="flex flex-col flex-1 min-w-0 min-h-0 overflow-hidden">
        <TopBar />
        <main className="flex-1 min-h-0 overflow-hidden bg-surface-page p-6 flex flex-col">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
