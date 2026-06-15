import { createFileRoute } from '@tanstack/react-router'
import EditStockLocationPage from '@/modules/inventory/pages/EditStockLocationPage'

export const Route = createFileRoute('/inventory/stock-locations/$id_/edit')({
  component: EditStockLocationPage,
})
