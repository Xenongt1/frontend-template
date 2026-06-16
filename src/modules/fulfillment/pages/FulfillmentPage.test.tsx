import React from 'react';
import { render, screen } from '@testing-library/react';
import FulfillmentPage from './FulfillmentPage';

describe('FulfillmentPage', () => {
  it('renders the heading and description', () => {
    render(<FulfillmentPage />);
    expect(screen.getByRole('heading', { name: /fulfillment/i })).toBeInTheDocument();
    expect(screen.getByText(/manage your fulfillment/i)).toBeInTheDocument();
  });
});
