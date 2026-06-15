import { createFileRoute } from '@tanstack/react-router'
import RegisterSupplierPage from '@/modules/suppliers/pages/RegisterSupplierPage'

export const Route = createFileRoute('/suppliers/register')({
  component: RegisterSupplierPage,
})
