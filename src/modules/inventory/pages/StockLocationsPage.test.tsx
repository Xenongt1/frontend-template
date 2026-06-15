import { render, screen } from '@testing-library/react';

jest.mock('@/assert/Empty-state-illustration.svg', () => 'empty-state-illustration');
jest.mock('@/core/api', () => ({
  storageLocationApi: {
    getStorageLocations: jest.fn().mockResolvedValue({
      success: true,
      data: [],
      pagination: { page: 1, limit: 10, totalItems: 0, totalPages: 0 },
    }),
  },
}));

import { MemoryRouter } from 'react-router-dom';
import StockLocationsPage from './StockLocationsPage';

function renderPage() {
  return render(
    <MemoryRouter>
      <StockLocationsPage />
    </MemoryRouter>
  );
}

describe('StockLocationsPage', () => {
  it('renders the Stock Locations title', () => {
    renderPage();
    expect(screen.getByText('Stock Locations')).toBeInTheDocument();
  });
});
