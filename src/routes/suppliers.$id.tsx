import { createFileRoute } from '@tanstack/react-router';
import SupplierDetailPage from '@/modules/suppliers/pages/SupplierDetailPage';

export const Route = createFileRoute('/suppliers/$id')({
  component: SupplierDetailPage,
});
