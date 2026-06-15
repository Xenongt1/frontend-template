import { Outlet } from '@tanstack/react-router';
import Sidebar from './Sidebar';
import TopBar from './TopBar';

const AppLayout: React.FC = () => (
  <div className="flex h-screen bg-[#FDFDFD] overflow-hidden">
    <Sidebar />
    <div className="flex flex-col flex-1 min-w-0 min-h-0 overflow-hidden">
      <TopBar />
      <main style={{ flex: 1, minHeight: 0, overflow: 'hidden', background: 'var(--Page-Background, #F7F7F7)', padding: 24, display: 'flex', flexDirection: 'column' }}>
        <Outlet />
      </main>
    </div>
  </div>
);

export default AppLayout;
