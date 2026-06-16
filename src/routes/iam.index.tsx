import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/iam/')({
  beforeLoad: () => { throw redirect({ to: '/iam/roles' }) },
})
