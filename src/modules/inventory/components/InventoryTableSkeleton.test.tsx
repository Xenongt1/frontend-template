import React from 'react';
import { render } from '@testing-library/react';
import InventoryTableSkeleton from './InventoryTableSkeleton';

function renderInTable(node: React.ReactElement) {
  return render(
    <table>
      <tbody>{node}</tbody>
    </table>
  );
}

describe('InventoryTableSkeleton', () => {
  it('renders 10 rows by default', () => {
    const { container } = renderInTable(<InventoryTableSkeleton />);
    expect(container.querySelectorAll('tr')).toHaveLength(10);
  });

  it('renders the requested rowCount', () => {
    const { container } = renderInTable(<InventoryTableSkeleton rowCount={3} />);
    expect(container.querySelectorAll('tr')).toHaveLength(3);
  });

  it('renders six skeleton cells per row', () => {
    const { container } = renderInTable(<InventoryTableSkeleton rowCount={1} />);
    expect(container.querySelectorAll('td')).toHaveLength(6);
  });
});
