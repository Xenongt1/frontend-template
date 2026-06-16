import React from 'react';
import { Outlet } from 'react-router-dom';
import AppLayout from '@/shared/layout/AppLayout';

const App: React.FC = () => (
  <AppLayout>
    <Outlet />
  </AppLayout>
);

export default App;
