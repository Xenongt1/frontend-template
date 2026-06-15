import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ExpiryNotificationSection } from './ExpiryNotificationSection';

describe('ExpiryNotificationSection', () => {
  it('renders heading + duration input', () => {
    render(<ExpiryNotificationSection />);
    expect(screen.getByText(/Expiry Notification/i)).toBeInTheDocument();
    const input = screen.getByLabelText(/duration/i) as HTMLInputElement;
    expect(input).toBeInTheDocument();
    expect(input.type).toBe('number');
  });

  it('reflects the value prop and emits onChange with the raw value', () => {
    const onChange = jest.fn();
    render(<ExpiryNotificationSection value="12" onChange={onChange} />);
    const input = screen.getByLabelText(/duration/i) as HTMLInputElement;
    expect(input.value).toBe('12');

    fireEvent.change(input, { target: { value: '7' } });
    expect(onChange).toHaveBeenCalledWith('7');
  });
});
