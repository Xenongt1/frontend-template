import { createBrowserRouter, Navigate } from 'react-router-dom';
import App from './App';
import DashboardPage from '@/modules/dashboard/pages/DashboardPage';
import InventoryPage from '@/modules/inventory/pages/InventoryPage';
import CataloguePage from '@/modules/inventory/pages/CataloguePage';
import RegisterInventoryPage from '@/modules/inventory/pages/RegisterInventoryPage';
import EditInventoryPage from '@/modules/inventory/pages/EditInventoryPage';
import StockPage from '@/modules/inventory/pages/StockPage';
import StockLocationsPage from '@/modules/inventory/pages/StockLocationsPage';
import RegisterStockLocationPage from '@/modules/inventory/pages/RegisterStockLocationPage';
import EditStockLocationPage from '@/modules/inventory/pages/EditStockLocationPage';
import StockLocationDetailPage from '@/modules/inventory/pages/StockLocationDetailPage';
import ProductionPage from '@/modules/production/pages/ProductionPage';
import OrdersPage from '@/modules/orders/pages/OrdersPage';
import PaymentsPage from '@/modules/payments/pages/PaymentsPage';
import FulfillmentPage from '@/modules/fulfillment/pages/FulfillmentPage';
import ReportsPage from '@/modules/reports/pages/ReportsPage';
import UsersPage from '@/modules/users/pages/UsersPage';
import NotificationsPage from '@/modules/notifications/pages/NotificationsPage';
import RolesListPage from '@/modules/roles/pages/RolesListPage';
import CreateRolePage from '@/modules/roles/pages/CreateRolePage';
import RoleDetailPage from '@/modules/roles/pages/RoleDetailPage';
import EditRolePage from '@/modules/roles/pages/EditRolePage';
import SuppliersPage from '@/modules/suppliers/pages/SuppliersPage';
import RegisterSupplierPage from '@/modules/suppliers/pages/RegisterSupplierPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        path: '',
        element: <Navigate to="/dashboard" replace />,
      },
      {
        path: 'dashboard',
        element: <DashboardPage />,
      },
      {
        path: 'inventory',
        element: <InventoryPage />,
      },
      {
        path: 'inventory/catalogue',
        element: <CataloguePage />,
      },
      {
        path: 'inventory/register',
        element: <RegisterInventoryPage />,
      },
      {
        path: 'inventory/edit/:id',
        element: <EditInventoryPage />,
      },
      {
        path: 'inventory/stock',
        element: <StockPage />,
      },
      {
        path: 'inventory/stock-locations',
        element: <StockLocationsPage />,
      },
      {
        path: 'inventory/stock-locations/register',
        element: <RegisterStockLocationPage />,
      },
      {
        path: 'inventory/stock-locations/:id',
        element: <StockLocationDetailPage />,
      },
      {
        path: 'inventory/stock-locations/:id/edit',
        element: <EditStockLocationPage />,
      },
      {
        path: 'production',
        element: <ProductionPage />,
      },

      {
        path: 'orders',
        element: <OrdersPage />,
      },
      {
        path: 'payments',
        element: <PaymentsPage />,
      },
      {
        path: 'fulfillment',
        element: <FulfillmentPage />,
      },
      {
        path: 'reports',
        element: <ReportsPage />,
      },
      {
        path: 'users',
        element: <UsersPage />,
      },
      {
        path: 'notifications',
        element: <NotificationsPage />,
      },
      {
        path: 'iam/roles',
        element: <RolesListPage />,
      },
      {
        path: 'iam/roles/new',
        element: <CreateRolePage />,
      },
      {
        path: 'iam/roles/:id',
        element: <RoleDetailPage />,
      },
      {
        path: 'iam/roles/:id/edit',
        element: <EditRolePage />,
      },
      {
        path: 'suppliers',
        element: <SuppliersPage />,
      },
      {
        path: 'suppliers/register',
        element: <RegisterSupplierPage />,
      },
    ],
  },
]);
