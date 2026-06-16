import { render, screen, fireEvent } from '@testing-library/react';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, opts?: { count?: number }) =>
      opts?.count !== undefined ? `${key}:${opts.count}` : key,
  }),
}));

import AssignedMembersSidebar from './AssignedMembersSidebar';

const members = [
  { id: 'm1', name: 'Alice Wong', email: 'alice@x.com', avatarUrl: 'http://a', assignedAt: '' },
  { id: 'm2', name: 'Bob Lee', email: 'bob@x.com', assignedAt: '' },
];

describe('AssignedMembersSidebar', () => {
  it('renders all members and the search input when non-empty', () => {
    render(<AssignedMembersSidebar members={members} />);
    expect(screen.getByText('Alice Wong')).toBeInTheDocument();
    expect(screen.getByText('Bob Lee')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('roles.form.searchMembers')).toBeEnabled();
  });

  it('renders initials fallback when avatarUrl is missing', () => {
    render(<AssignedMembersSidebar members={members} />);
    // Bob Lee has no avatarUrl → initials "BL"
    expect(screen.getByText('BL')).toBeInTheDocument();
  });

  it('filters the list by name as the user types', () => {
    render(<AssignedMembersSidebar members={members} />);
    fireEvent.change(screen.getByPlaceholderText('roles.form.searchMembers'), {
      target: { value: 'alice' },
    });
    expect(screen.getByText('Alice Wong')).toBeInTheDocument();
    expect(screen.queryByText('Bob Lee')).not.toBeInTheDocument();
  });

  it('shows "no matches" when search excludes everyone', () => {
    render(<AssignedMembersSidebar members={members} />);
    fireEvent.change(screen.getByPlaceholderText('roles.form.searchMembers'), {
      target: { value: 'zzz' },
    });
    expect(screen.getByText('roles.form.noMembersMatch')).toBeInTheDocument();
  });

  it('shows the "no members yet" state when the list is empty', () => {
    render(<AssignedMembersSidebar members={[]} />);
    expect(screen.getByText('roles.form.noMembersYet')).toBeInTheDocument();
  });

  it('hides the search input when empty and hideSearchWhenEmpty is true', () => {
    render(<AssignedMembersSidebar members={[]} hideSearchWhenEmpty />);
    expect(screen.queryByPlaceholderText('roles.form.searchMembers')).not.toBeInTheDocument();
  });
});
