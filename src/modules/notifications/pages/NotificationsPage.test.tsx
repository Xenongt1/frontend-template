import React from 'react';
import { render, screen } from '@testing-library/react';
import NotificationsPage from './NotificationsPage';

describe('NotificationsPage', () => {
  it('renders the heading and description', () => {
    render(<NotificationsPage />);
    expect(screen.getByRole('heading', { name: /notifications/i })).toBeInTheDocument();
    expect(screen.getByText(/manage your notifications/i)).toBeInTheDocument();
  });
});
