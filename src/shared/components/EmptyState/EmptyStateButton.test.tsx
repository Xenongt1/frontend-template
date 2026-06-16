import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import EmptyStateButton from './EmptyStateButton';

describe('EmptyStateButton', () => {
  it('renders the label and calls onClick', () => {
    const onClick = jest.fn();
    render(<EmptyStateButton label="Add Inventory" onClick={onClick} />);

    const btn = screen.getByRole('button', { name: /add inventory/i });
    fireEvent.click(btn);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('updates inline styles on hover (mouse enter / leave)', () => {
    render(<EmptyStateButton label="Add" onClick={() => {}} />);
    const btn = screen.getByRole('button', { name: /add/i }) as HTMLButtonElement;
    const initialTransform = btn.style.transform;

    fireEvent.mouseEnter(btn);
    expect(btn.style.transform).not.toBe(initialTransform);

    fireEvent.mouseLeave(btn);
    expect(btn.style.transform).toBe(initialTransform);
  });
});
