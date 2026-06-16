import React from 'react';
import { render, screen } from '@testing-library/react';
import OrdersPage from './OrdersPage';

describe('OrdersPage', () => {
  it('renders the heading and description', () => {
    render(<OrdersPage />);
    expect(screen.getByRole('heading', { name: /orders/i })).toBeInTheDocument();
    expect(screen.getByText(/manage your orders/i)).toBeInTheDocument();
  });
});
