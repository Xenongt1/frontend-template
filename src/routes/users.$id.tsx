import { createFileRoute } from '@tanstack/react-router'
import UserDetailsPage from '@/modules/users/pages/UserDetailsPage'

export const Route = createFileRoute('/users/$id')({
  component: UserDetailsPage,
})
