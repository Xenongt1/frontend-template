import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import CataloguePage from '@/modules/inventory/pages/CataloguePage'

export const catalogueSearchSchema = z.object({
  q: z.string().optional(),
  category: z.string().optional(),
  status: z.string().optional(),
  page: z.coerce.number().min(1).optional().default(1),
  pageSize: z.coerce.number().min(1).optional().default(10),
})

export const Route = createFileRoute('/inventory/catalogue')({
  validateSearch: catalogueSearchSchema,
  component: CataloguePage,
})
