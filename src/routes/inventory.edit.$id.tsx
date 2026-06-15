import { createFileRoute } from '@tanstack/react-router'
import EditInventoryPage from '@/modules/inventory/pages/EditInventoryPage'

export const Route = createFileRoute('/inventory/edit/$id')({
  component: EditInventoryPage,
})
