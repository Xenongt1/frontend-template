jest.mock('@/core/api/client', () => ({
  apiRequest: jest.fn(),
}));

import { apiRequest } from '@/core/api/client';
import {
  listRoles,
  getRoleById,
  createRole,
  updateRole,
} from './rolesApi';

const mockedApiRequest = apiRequest as jest.MockedFunction<typeof apiRequest>;

beforeEach(() => {
  mockedApiRequest.mockReset();
});

/* ─── listRoles ───────────────────────────────────────────────────────────── */

describe('listRoles', () => {
  const baseRole = {
    id: 'r1',
    name: 'Admin',
    description: 'Top tier',
    members: [
      {
        id: 'm1',
        fullName: 'Alice',
        email: 'a@x.com',
        imageUrl: 'http://a',
        assignedAt: '2026-01-01',
      },
    ],
    memberCount: 5,
    permissions: [
      { id: 'p1', code: 'roles.read', label: 'Read', description: '', module: 'iam', action: 'read' },
    ],
    isSystem: true,
    createdAt: '2026-01-01',
    updatedAt: '2026-01-02',
  };

  it('hits /api/roles without query string when no params given', async () => {
    mockedApiRequest.mockResolvedValueOnce({ data: [] });
    await listRoles();
    expect(mockedApiRequest).toHaveBeenCalledWith('/api/roles');
  });

  it('appends search, 0-indexed page, and size to the query string', async () => {
    mockedApiRequest.mockResolvedValueOnce({ data: [] });
    await listRoles({ search: 'admin', page: 3, pageSize: 25 });
    const url = mockedApiRequest.mock.calls[0][0] as string;
    expect(url).toContain('search=admin');
    expect(url).toContain('page=2'); // 3 - 1
    expect(url).toContain('size=25');
  });

  it('maps a fully-populated backend role into a summary', async () => {
    mockedApiRequest.mockResolvedValueOnce({
      data: [baseRole],
      page: 0,
      pageSize: 10,
      totalItems: 1,
      totalPages: 1,
    });

    const res = await listRoles({ page: 1, pageSize: 10 });
    expect(res.data).toEqual([
      {
        id: 'r1',
        name: 'Admin',
        description: 'Top tier',
        memberCount: 5, // from BE explicit memberCount
        previewMembers: [
          {
            id: 'm1',
            name: 'Alice',
            email: 'a@x.com',
            avatarUrl: 'http://a',
            assignedAt: '2026-01-01',
          },
        ],
        permissionCount: 1,
        isSystem: true,
      },
    ]);
    expect(res.pagination).toEqual({
      page: 1, // 0 + 1
      limit: 10,
      totalItems: 1,
      totalPages: 1,
    });
  });

  it('falls back through the null/undefined coalescing chains', async () => {
    mockedApiRequest.mockResolvedValueOnce({
      data: [
        {
          id: 'r2',
          name: 'Guest',
          description: null,
          members: null,
          permissions: null,
          system: false, // covers role.system fallback (no isSystem)
        },
      ],
    });

    const res = await listRoles();
    expect(res.data[0]).toMatchObject({
      id: 'r2',
      description: '',
      memberCount: 0,
      previewMembers: [],
      permissionCount: 0,
      isSystem: false,
    });
    // Pagination uses request fallbacks when BE omits them.
    expect(res.pagination.page).toBe(1);
    expect(res.pagination.limit).toBeGreaterThan(0);
  });

  it('defaults isSystem to false when both isSystem and system are missing', async () => {
    mockedApiRequest.mockResolvedValueOnce({
      data: [
        {
          id: 'r3',
          name: 'Other',
          description: 'd',
          members: [],
          permissions: [],
        },
      ],
    });
    const res = await listRoles();
    expect(res.data[0].isSystem).toBe(false);
  });

  it('falls back to memberObjects.length when memberCount is missing', async () => {
    mockedApiRequest.mockResolvedValueOnce({
      data: [
        {
          id: 'r4',
          name: 'Lead',
          description: '',
          members: [
            { id: 'm1', name: 'Bob' },
            { id: 'm2', name: 'Carol' },
          ],
          permissions: [],
        },
      ],
    });
    const res = await listRoles();
    expect(res.data[0].memberCount).toBe(2);
  });

  it('computes totalPages from totalItems when BE omits it', async () => {
    mockedApiRequest.mockResolvedValueOnce({
      data: [],
      totalItems: 25,
    });
    const res = await listRoles({ page: 1, pageSize: 10 });
    expect(res.pagination.totalPages).toBe(Math.ceil(25 / 10));
  });
});

/* ─── getRoleById ─────────────────────────────────────────────────────────── */

describe('getRoleById', () => {
  it('returns a detail with mapped members and permission codes', async () => {
    mockedApiRequest.mockResolvedValueOnce({
      id: 'r1',
      name: 'Admin',
      description: 'd',
      members: [
        { id: 'm1', name: 'Bob', email: 'b@x', avatarUrl: 'http://b', assignedAt: '2026-02-01' },
      ],
      permissions: [
        { id: 'p1', code: 'roles.read', label: '', description: '', module: '', action: '' },
        { id: 'p2', code: 'roles.write', label: '', description: '', module: '', action: '' },
      ],
    });

    const detail = await getRoleById('r1');
    expect(detail).toEqual({
      id: 'r1',
      name: 'Admin',
      description: 'd',
      grantedPermissions: ['roles.read', 'roles.write'],
      members: [
        {
          id: 'm1',
          name: 'Bob',
          email: 'b@x',
          avatarUrl: 'http://b',
          assignedAt: '2026-02-01',
        },
      ],
    });
  });

  it('coalesces description/members/permissions when BE returns null', async () => {
    mockedApiRequest.mockResolvedValueOnce({
      id: 'r5',
      name: 'Empty',
      description: null,
      members: null,
      permissions: null,
    });
    const detail = await getRoleById('r5');
    expect(detail.description).toBe('');
    expect(detail.members).toEqual([]);
    expect(detail.grantedPermissions).toEqual([]);
  });

  it('falls back to member.name when fullName is missing', async () => {
    mockedApiRequest.mockResolvedValueOnce({
      id: 'r6',
      name: 'X',
      description: '',
      members: [{ id: 'm1', name: 'Fallback Name' }],
      permissions: [],
    });
    const detail = await getRoleById('r6');
    expect(detail.members[0].name).toBe('Fallback Name');
    expect(detail.members[0].email).toBe('');
    expect(detail.members[0].avatarUrl).toBeUndefined();
    expect(detail.members[0].assignedAt).toBe('');
  });

  it('prefers imageUrl over avatarUrl when both are present', async () => {
    mockedApiRequest.mockResolvedValueOnce({
      id: 'r7',
      name: 'X',
      description: '',
      members: [
        { id: 'm1', fullName: 'A', imageUrl: 'http://image', avatarUrl: 'http://avatar' },
      ],
      permissions: [],
    });
    const detail = await getRoleById('r7');
    expect(detail.members[0].avatarUrl).toBe('http://image');
  });

  it('falls back to avatarUrl when imageUrl is null', async () => {
    mockedApiRequest.mockResolvedValueOnce({
      id: 'r8',
      name: 'X',
      description: '',
      members: [
        { id: 'm1', fullName: 'A', imageUrl: null, avatarUrl: 'http://only-avatar' },
      ],
      permissions: [],
    });
    const detail = await getRoleById('r8');
    expect(detail.members[0].avatarUrl).toBe('http://only-avatar');
  });
});

/* ─── createRole / updateRole ─────────────────────────────────────────────── */

describe('createRole', () => {
  it('POSTs trimmed name/description with permission codes', async () => {
    mockedApiRequest.mockResolvedValueOnce({
      id: 'r9',
      name: 'New Role',
      description: 'desc',
      members: [],
      permissions: [{ id: 'p1', code: 'roles.read', label: '', description: '', module: '', action: '' }],
    });

    const detail = await createRole({
      name: '  New Role  ',
      description: '  desc  ',
      grantedPermissions: ['roles.read'],
    });

    expect(mockedApiRequest).toHaveBeenCalledWith('/api/roles', {
      method: 'POST',
      body: JSON.stringify({
        name: 'New Role',
        description: 'desc',
        permissions: ['roles.read'],
      }),
    });
    expect(detail.grantedPermissions).toEqual(['roles.read']);
  });
});

describe('updateRole', () => {
  it('PATCHes /api/roles/:id with trimmed name/description', async () => {
    mockedApiRequest.mockResolvedValueOnce({
      id: 'r9',
      name: 'Renamed',
      description: 'new desc',
      members: [],
      permissions: [],
    });

    const detail = await updateRole('r9', {
      name: ' Renamed ',
      description: ' new desc ',
      grantedPermissions: [],
    });

    expect(mockedApiRequest).toHaveBeenCalledWith('/api/roles/r9', {
      method: 'PATCH',
      body: JSON.stringify({
        name: 'Renamed',
        description: 'new desc',
        permissions: [],
      }),
    });
    expect(detail.name).toBe('Renamed');
  });
});
