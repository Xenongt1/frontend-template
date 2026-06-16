import { createFileRoute } from '@tanstack/react-router'
import EditRolePage from '@/modules/roles/pages/EditRolePage'

export const Route = createFileRoute('/iam/roles/$id_/edit')({
  component: EditRolePage,
})
