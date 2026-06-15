import React from 'react';
import { render, screen, fireEvent, within } from '@testing-library/react';
import Pagination from './Pagination';

function makeProps(overrides: Partial<React.ComponentProps<typeof Pagination>> = {}) {
  return {
    page: 1,
    pageSize: 10,
    total: 100,
    totalPages: 10,
    pageSizeOptions: [10, 20, 50],
    onPageChange: jest.fn(),
    onPageSizeChange: jest.fn(),
    ...overrides,
  };
}

describe('Pagination', () => {
  it('renders all page numbers and no ellipsis when totalPages ≤ 7', () => {
    render(<Pagination {...makeProps({ totalPages: 5, total: 50 })} />);
    for (const n of [1, 2, 3, 4, 5]) {
      expect(screen.getByRole('button', { name: String(n) })).toBeInTheDocument();
    }
    expect(screen.queryByText('…')).not.toBeInTheDocument();
  });

  it('renders a leading ellipsis when the current page is near the end', () => {
    render(<Pagination {...makeProps({ page: 9, totalPages: 10 })} />);
    expect(screen.getAllByText('…')).toHaveLength(1);
    expect(screen.getByRole('button', { name: '10' })).toBeInTheDocument();
  });

  it('renders trailing ellipsis when the current page is near the start', () => {
    render(<Pagination {...makeProps({ page: 1, totalPages: 10 })} />);
    expect(screen.getAllByText('…')).toHaveLength(1);
    expect(screen.getByRole('button', { name: '1' })).toBeInTheDocument();
  });

  it('renders both ellipses in the middle of a large range', () => {
    render(<Pagination {...makeProps({ page: 5, totalPages: 10 })} />);
    expect(screen.getAllByText('…')).toHaveLength(2);
  });

  it('disables prev on page 1 and next on the last page', () => {
    const { rerender } = render(<Pagination {...makeProps({ page: 1, totalPages: 10 })} />);
    expect(screen.getByRole('button', { name: /previous page/i })).toBeDisabled();
    expect(screen.getByRole('button', { name: /next page/i })).not.toBeDisabled();

    rerender(<Pagination {...makeProps({ page: 10, totalPages: 10 })} />);
    expect(screen.getByRole('button', { name: /previous page/i })).not.toBeDisabled();
    expect(screen.getByRole('button', { name: /next page/i })).toBeDisabled();
  });

  it('calls onPageChange when prev / next / page number is clicked', () => {
    const onPageChange = jest.fn();
    render(<Pagination {...makeProps({ page: 5, onPageChange })} />);

    fireEvent.click(screen.getByRole('button', { name: /previous page/i }));
    expect(onPageChange).toHaveBeenLastCalledWith(4);

    fireEvent.click(screen.getByRole('button', { name: /next page/i }));
    expect(onPageChange).toHaveBeenLastCalledWith(6);

    fireEvent.click(screen.getByRole('button', { name: '4' }));
    expect(onPageChange).toHaveBeenLastCalledWith(4);
  });

  it('calls onPageSizeChange when the select changes', () => {
    const onPageSizeChange = jest.fn();
    render(<Pagination {...makeProps({ onPageSizeChange })} />);
    fireEvent.change(screen.getByRole('combobox'), { target: { value: '20' } });
    expect(onPageSizeChange).toHaveBeenCalledWith(20);
  });

  it('disables every interactive control when disabled is true', () => {
    render(<Pagination {...makeProps({ disabled: true })} />);
    expect(screen.getByRole('combobox')).toBeDisabled();
    expect(screen.getByRole('button', { name: /previous page/i })).toBeDisabled();
    expect(screen.getByRole('button', { name: /next page/i })).toBeDisabled();
    expect(screen.getByRole('button', { name: '1' })).toBeDisabled();
  });

  it('highlights the active page button', () => {
    render(<Pagination {...makeProps({ page: 3, totalPages: 5 })} />);
    const active = screen.getByRole('button', { name: '3' });
    expect(active.className).toContain('bg-navy-300');
  });

  it('shows the total item count', () => {
    render(<Pagination {...makeProps({ total: 42 })} />);
    expect(screen.getByText('of 42 items')).toBeInTheDocument();
  });

  it('exposes the configured page-size options', () => {
    render(<Pagination {...makeProps({ pageSizeOptions: [5, 25, 100] })} />);
    const select = screen.getByRole('combobox');
    const options = within(select).getAllByRole('option');
    expect(options.map((o) => (o as HTMLOptionElement).value)).toEqual(['5', '25', '100']);
  });
});
