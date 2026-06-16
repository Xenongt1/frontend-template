import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import SuppliersPage from '@/modules/suppliers/pages/SuppliersPage'

export const suppliersSearchSchema = z.object({
  q:        z.string().optional(),
  status:   z.enum(['ACTIVE', 'SUSPENDED']).optional(),
  materials: z.string().optional(),  // comma-separated inventory item IDs
  page:     z.coerce.number().min(1).optional().default(1),
  pageSize: z.coerce.number().min(1).optional().default(10),
})

export const Route = createFileRoute('/suppliers/')({
  validateSearch: suppliersSearchSchema,
  component: SuppliersPage,
})
