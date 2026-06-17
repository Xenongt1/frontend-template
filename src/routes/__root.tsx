import { createRootRoute, Outlet, redirect, useLocation } from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { TanStackDevtools } from '@tanstack/react-devtools'
import { Toaster } from 'sonner'

import '../styles.css'
import AppLayout from '../shared/layout/AppLayout'
import NotFoundPage from '../shared/components/NotFoundPage'

// Public routes that do not require an access token. They also render outside
// the AppLayout (no sidebar / topbar).
const PUBLIC_PATHS = ['/sign-in', '/accept-invite', '/complete-profile']

function isPublic(pathname: string): boolean {
  return PUBLIC_PATHS.some(p => pathname === p || pathname.startsWith(`${p}/`))
}

export const Route = createRootRoute({
  beforeLoad: ({ location }) => {
    const hasToken =
      typeof localStorage !== 'undefined' &&
      !!localStorage.getItem('chainpilot_access_token')

    if (!hasToken && !isPublic(location.pathname)) {
      throw redirect({ to: '/sign-in' })
    }
  },
  component: RootComponent,
  notFoundComponent: NotFoundPage,
})

function RootComponent() {
  const { pathname } = useLocation()
  const onAuthRoute = isPublic(pathname)

  return (
    <>
      {onAuthRoute ? (
        <Outlet />
      ) : (
        <AppLayout>
          <Outlet />
        </AppLayout>
      )}
      <Toaster richColors position="top-right" />
      <TanStackDevtools
        config={{
          position: 'bottom-right',
        }}
        plugins={[
          {
            name: 'TanStack Router',
            render: <TanStackRouterDevtoolsPanel />,
          },
        ]}
      />
    </>
  )
}
