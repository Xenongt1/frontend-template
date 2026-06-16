// Mock the API client wrapper so Jest doesn't try to parse `import.meta.env`
// from the real client.ts.
jest.mock('@/core/api/client', () => ({
  apiRequest: jest.fn(),
}));

// Mock the rolesApi module so the test controls what the page receives.
jest.mock('../api/rolesApi', () => ({
  listRoles: jest.fn(),
  getRoleById: jest.fn(),
  createRole: jest.fn(),
  updateRole: jest.fn(),
}));

import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import RolesListPage from './RolesListPage';
import { listRoles } from '../api/rolesApi';
import type { RoleListQuery, RoleListResponse } from '../types';

const mockedListRoles = listRoles as jest.MockedFunction<typeof listRoles>;

const SEED = [
  { id: 'r1', name: 'Admin',              description: 'Full system access',     memberCount: 4, permissionCount: 32 },
  { id: 'r2', name: 'Warehouse Operator', description: 'Inventory floor access', memberCount: 7, permissionCount: 9 },
  { id: 'r3', name: 'Auditor',            description: 'Read-only access',       memberCount: 2, permissionCount: 5 },
];

function buildResponse(rows: typeof SEED): RoleListResponse {
  return {
    data: rows,
    pagination: { page: 1, limit: 20, totalItems: rows.length, totalPages: 1 },
  };
}

beforeEach(() => {
  mockedListRoles.mockReset();
  // Default: every call returns the full seed unless the test overrides.
  // We respect the search filter so the search-input tests can flow naturally.
  mockedListRoles.mockImplementation((query: RoleListQuery = {}) => {
    const term = query.search?.trim().toLowerCase() ?? '';
    const filtered = term
      ? SEED.filter((r) => r.name.toLowerCase().includes(term))
      : SEED;
    return Promise.resolve(buildResponse(filtered));
  });
});

function renderPage() {
  return render(
    <MemoryRouter initialEntries={['/iam/roles']}>
      <RolesListPage />
    </MemoryRouter>
  );
}

describe('RolesListPage', () => {
  it('renders the page header and the roles returned by the API', async () => {
    renderPage();
    expect(screen.getByRole('heading', { name: /role management/i })).toBeInTheDocument();
    expect(await screen.findByText('Admin')).toBeInTheDocument();
    expect(await screen.findByText('Warehouse Operator')).toBeInTheDocument();
    expect(await screen.findByText('Auditor')).toBeInTheDocument();
  });

  it('filters the table when the user types in the search box', async () => {
    renderPage();
    await screen.findByText('Admin');

    const search = screen.getByLabelText(/search role/i);
    fireEvent.change(search, { target: { value: 'Auditor' } });

    await waitFor(() => {
      expect(screen.queryByText('Admin')).not.toBeInTheDocument();
      expect(screen.getByText('Auditor')).toBeInTheDocument();
    });
    expect(screen.queryByText('Warehouse Operator')).not.toBeInTheDocument();
  });

  it('clears the search when the X button is clicked', async () => {
    renderPage();
    await screen.findByText('Admin');

    const search = screen.getByLabelText(/search role/i) as HTMLInputElement;
    fireEvent.change(search, { target: { value: 'Auditor' } });
    await waitFor(() => expect(screen.queryByText('Admin')).not.toBeInTheDocument());

    fireEvent.click(screen.getByRole('button', { name: /clear search/i }));
    expect(search.value).toBe('');
    await screen.findByText('Admin');
    expect(screen.getByText('Warehouse Operator')).toBeInTheDocument();
  });
});
