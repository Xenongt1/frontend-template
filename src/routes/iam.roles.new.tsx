import { createFileRoute } from '@tanstack/react-router'
import CreateRolePage from '@/modules/roles/pages/CreateRolePage'

export const Route = createFileRoute('/iam/roles/new')({
  component: CreateRolePage,
})
