import { createFileRoute } from '@tanstack/react-router'
import RoleDetailPage from '@/modules/roles/pages/RoleDetailPage'

export const Route = createFileRoute('/iam/roles/$id')({
  component: RoleDetailPage,
})
