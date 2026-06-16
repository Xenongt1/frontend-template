import React from 'react';
import { render, screen } from '@testing-library/react';
import PaymentsPage from './PaymentsPage';

describe('PaymentsPage', () => {
  it('renders the heading and description', () => {
    render(<PaymentsPage />);
    expect(screen.getByRole('heading', { name: /payments/i })).toBeInTheDocument();
    expect(screen.getByText(/manage your payments/i)).toBeInTheDocument();
  });
});
