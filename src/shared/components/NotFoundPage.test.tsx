import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}));

import NotFoundPage from './NotFoundPage';

describe('NotFoundPage', () => {
  beforeEach(() => mockNavigate.mockReset());

  it('renders the 404 copy and both action buttons', () => {
    render(<NotFoundPage />);
    expect(screen.getByText('404')).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: /page not found/i })
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /go back/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /go to dashboard/i })).toBeInTheDocument();
  });

  it('navigates back (-1) when "Go back" is clicked', () => {
    render(<NotFoundPage />);
    fireEvent.click(screen.getByRole('button', { name: /go back/i }));
    expect(mockNavigate).toHaveBeenCalledWith(-1);
  });

  it('replaces the route to /dashboard when "Go to Dashboard" is clicked', () => {
    render(<NotFoundPage />);
    fireEvent.click(screen.getByRole('button', { name: /go to dashboard/i }));
    expect(mockNavigate).toHaveBeenCalledWith('/dashboard', { replace: true });
  });
});
