import React from 'react';
import { render, screen } from '@testing-library/react';
import UsersPage from './UsersPage';

describe('UsersPage', () => {
  it('renders the heading and description', () => {
    render(<UsersPage />);
    expect(screen.getByRole('heading', { name: /users/i })).toBeInTheDocument();
    expect(screen.getByText(/manage your users/i)).toBeInTheDocument();
  });
});
