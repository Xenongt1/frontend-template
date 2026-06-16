import React from 'react';
import { render, screen } from '@testing-library/react';
import DashboardPage from './DashboardPage';

describe('DashboardPage', () => {
  it('renders the heading and welcome copy', () => {
    render(<DashboardPage />);
    expect(screen.getByRole('heading', { name: /dashboard/i })).toBeInTheDocument();
    expect(screen.getByText(/welcome to chainpilot dashboard/i)).toBeInTheDocument();
  });
});
