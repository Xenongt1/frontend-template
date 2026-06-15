import { createFileRoute } from '@tanstack/react-router'
import RegisterInventoryPage from '@/modules/inventory/pages/RegisterInventoryPage'

export const Route = createFileRoute('/inventory/register')({
  component: RegisterInventoryPage,
})
