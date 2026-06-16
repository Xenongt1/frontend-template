import { createFileRoute } from '@tanstack/react-router'
import RolesListPage from '@/modules/roles/pages/RolesListPage'

export const Route = createFileRoute('/iam/roles/')({
  component: RolesListPage,
})
