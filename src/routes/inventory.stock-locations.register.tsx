import { createFileRoute } from '@tanstack/react-router'
import RegisterStockLocationPage from '@/modules/inventory/pages/RegisterStockLocationPage'

export const Route = createFileRoute('/inventory/stock-locations/register')({
  component: RegisterStockLocationPage,
})
