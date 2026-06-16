import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import UsersPage from './UsersPage';

vi.mock('@tanstack/react-router', () => ({
  useNavigate: () => vi.fn(),
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'users.list.title': 'Users',
        'users.list.subtitle': 'Manage users and roles',
        'users.list.searchPlaceholder': 'Search users',
        'users.list.allRoles': 'All roles',
        'users.list.allStatus': 'All status',
        'users.list.export': 'Export',
        'users.list.inviteButton': 'Invite user',
        'users.list.filterLabel': 'Filters',
        'users.members.status.active': 'Active',
        'users.members.status.invited': 'Invited',
        'users.members.status.suspended': 'Suspended',
        'users.list.pagination.showing': 'Showing {{start}}-{{end}} of {{total}}',
        'users.list.pagination.rowsPerPage': 'Rows per page',
        'users.list.pagination.previousPage': 'Previous page',
        'users.list.pagination.nextPage': 'Next page',
      };
      return translations[key] ?? key;
    },
    i18n: {
      exists: () => false,
    },
  }),
  Trans: ({ i18nKey }: { i18nKey: string }) => <>{i18nKey}</>,
}));

vi.mock('../api/usersApi', () => ({
  useGetMembersQuery: () => ({
    data: {
      page: 0,
      pageSize: 20,
      totalItems: 1,
      totalPages: 1,
      data: [
        {
          id: 'member-1',
          fullName: 'Amina Mensah',
          email: 'amina@example.com',
          imageUrl: null,
          status: 'ACTIVE',
          roles: ['Admin'],
          invitedAt: '2026-01-01T00:00:00.000Z',
          lastSignInAt: null,
        },
      ],
    },
    isLoading: false,
    isFetching: false,
  }),
  useGetRolesQuery: () => ({
    data: [{ id: 'role-1', name: 'Admin', description: 'Administrator' }],
  }),
  useSuspendMemberMutationCompat: () => [vi.fn(() => ({ unwrap: vi.fn() })), { isLoading: false }],
  useActivateMemberMutationCompat: () => [vi.fn(() => ({ unwrap: vi.fn() })), { isLoading: false }],
}));

describe('UsersPage', () => {
  it('renders the ported users management shell', () => {
    render(<UsersPage />);

    expect(screen.getByRole('heading', { name: 'Users' })).toBeInTheDocument();
    expect(screen.getByText('Manage users and roles')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /invite user/i })).toBeInTheDocument();
    expect(screen.getByText('Amina Mensah')).toBeInTheDocument();
  });
});
