import { createFileRoute } from '@tanstack/react-router';
import EditSupplierPage from '@/modules/suppliers/pages/EditSupplierPage';

export const Route = createFileRoute('/suppliers/$id_/edit')({
  component: EditSupplierPage,
});
