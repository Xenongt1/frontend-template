import { createFileRoute } from '@tanstack/react-router'
import StockLocationDetailPage from '@/modules/inventory/pages/StockLocationDetailPage'

export const Route = createFileRoute('/inventory/stock-locations/$id')({
  component: StockLocationDetailPage,
})
