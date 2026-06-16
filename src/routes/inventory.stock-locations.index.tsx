import { createFileRoute } from '@tanstack/react-router'
import StockLocationsPage from '@/modules/inventory/pages/StockLocationsPage'

export const Route = createFileRoute('/inventory/stock-locations/')({
  component: StockLocationsPage,
})
