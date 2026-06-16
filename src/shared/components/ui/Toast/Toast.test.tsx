import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Toast } from './Toast';

describe('Toast', () => {
  it('renders nothing when open is false', () => {
    const { container } = render(
      <Toast open={false} message="hi" onDismiss={() => {}} />
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('renders a success toast with status role by default', () => {
    render(<Toast open message="Item registered" onDismiss={() => {}} />);
    const status = screen.getByRole('status');
    expect(status).toHaveTextContent('Item registered');
    expect(status).toHaveAttribute('aria-live', 'polite');
  });

  it('renders an error toast with alert role when variant="error"', () => {
    render(
      <Toast open message="Something broke" variant="error" onDismiss={() => {}} />
    );
    const alert = screen.getByRole('alert');
    expect(alert).toHaveTextContent('Something broke');
    expect(alert).toHaveAttribute('aria-live', 'assertive');
  });

  it('fires onDismiss when the dismiss button is clicked', () => {
    const onDismiss = jest.fn();
    render(<Toast open message="x" onDismiss={onDismiss} />);
    fireEvent.click(screen.getByRole('button', { name: /dismiss notification/i }));
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });
});
