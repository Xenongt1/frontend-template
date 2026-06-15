import { createFileRoute } from '@tanstack/react-router'
import SuppliersPage from '@/modules/suppliers/pages/SuppliersPage'

export const Route = createFileRoute('/suppliers/')({
  component: SuppliersPage,
})
