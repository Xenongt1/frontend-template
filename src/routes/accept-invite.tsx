import { createFileRoute } from '@tanstack/react-router'
import AcceptInvitePage from '@/modules/auth/pages/AcceptInvitePage'

export const Route = createFileRoute('/accept-invite')({
  component: AcceptInvitePage,
})
