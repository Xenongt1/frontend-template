import { createFileRoute } from '@tanstack/react-router'
import CompleteProfilePage from '@/modules/auth/pages/CompleteProfilePage'

export const Route = createFileRoute('/complete-profile')({
  component: CompleteProfilePage,
})
