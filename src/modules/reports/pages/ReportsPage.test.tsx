import React from 'react';
import { render, screen } from '@testing-library/react';
import ReportsPage from './ReportsPage';

describe('ReportsPage', () => {
  it('renders the heading and description', () => {
    render(<ReportsPage />);
    expect(screen.getByRole('heading', { name: /reports/i })).toBeInTheDocument();
    expect(screen.getByText(/manage your reports/i)).toBeInTheDocument();
  });
});
