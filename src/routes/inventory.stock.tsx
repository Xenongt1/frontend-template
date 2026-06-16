import { createFileRoute } from '@tanstack/react-router'
import StockPage from '@/modules/inventory/pages/StockPage'

export const Route = createFileRoute('/inventory/stock')({
  component: StockPage,
})
