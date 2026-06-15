import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';

/* ─── Mocks ────────────────────────────────────────────────────────────────── */

const mockFetchInventoryItem = jest.fn();
const mockSuspendItem = jest.fn();
const mockActivateItem = jest.fn();

jest.mock('../api/inventoryApi', () => ({
  __esModule: true,
  inventoryApi: {
    getItem: (...args: unknown[]) => mockFetchInventoryItem(...args),
    suspendItem: (...args: unknown[]) => mockSuspendItem(...args),
    activateItem: (...args: unknown[]) => mockActivateItem(...args),
  },
  fetchInventoryItems: jest.fn(),
  fetchCatalogueCategories: jest.fn(),
  fetchInventoryStatuses: jest.fn(),
}));

const mockReload = jest.fn();
const useInventoryReturn = {
  items: [] as Array<Record<string, unknown>>,
  loading: false,
  error: null as string | null,
  filters: { search: '', category: 'All', status: 'All' },
  pagination: { page: 1, pageSize: 10, total: 0 },
  totalPages: 1,
  pageSizeOptions: [10, 20, 50],
  updateSearch: jest.fn(),
  updateCategory: jest.fn(),
  updateStatus: jest.fn(),
  goToPage: jest.fn(),
  changePageSize: jest.fn(),
  reload: mockReload,
};

jest.mock('../hooks/useInventory', () => ({
  __esModule: true,
  useInventory: () => useInventoryReturn,
}));

jest.mock('react-router-dom', () => ({
  useNavigate: () => jest.fn(),
}));

import CataloguePage from './CataloguePage';

/* ─── Fixtures ─────────────────────────────────────────────────────────────── */

const activeItem = {
  id: 'item-1',
  sku: 'A-1',
  displayName: '9mm MDF Board',
  category: 'CONSTRUCTION',
  baseUnitOfMeasure: 'SHEET',
  status: 'ACTIVE',
  grades: [],
  attributes: [],
  batchFields: [],
  tags: [],
  expiryNotificationSchedule: [],
};

const suspendedItem = {
  ...activeItem,
  id: 'item-2',
  sku: 'A-2',
  displayName: 'Industrial Wood Glue',
  status: 'INTAKE_SUSPENDED',
};

beforeEach(() => {
  jest.clearAllMocks();
  jest.useRealTimers();
  useInventoryReturn.items = [activeItem, suspendedItem];
  useInventoryReturn.pagination = { page: 1, pageSize: 10, total: 2 };
});

/* ─── Helpers ──────────────────────────────────────────────────────────────── */

function openKebab(itemRowIndex: number) {
  // The Actions buttons in the table are all labelled "Actions" — pick by index.
  const actionsButtons = screen.getAllByRole('button', { name: /^actions$/i });
  fireEvent.click(actionsButtons[itemRowIndex]);
}

/* ─── Tests ────────────────────────────────────────────────────────────────── */

describe('CataloguePage suspend / activate flow', () => {
  it('shows "Suspend Intake" in the kebab for ACTIVE items', () => {
    render(<CataloguePage />);
    openKebab(0); // active item
    expect(screen.getByRole('menuitem', { name: 'Suspend Intake' })).toBeInTheDocument();
  });

  it('shows "Activate Item" in the kebab for INTAKE_SUSPENDED items', () => {
    render(<CataloguePage />);
    openKebab(1); // suspended item
    expect(screen.getByRole('menuitem', { name: 'Activate Item' })).toBeInTheDocument();
  });

  it('opens the confirm dialog when kebab "Suspend Intake" is clicked, and Cancel closes it without calling the API', () => {
    render(<CataloguePage />);
    openKebab(0);
    fireEvent.click(screen.getByRole('menuitem', { name: 'Suspend Intake' }));

    // Confirm dialog title appears as h2
    expect(screen.getByRole('heading', { name: 'Suspend Intake' })).toBeInTheDocument();
    expect(
      screen.getByText(/prevent it from appearing in the item intake form/i)
    ).toBeInTheDocument();

    // Click Cancel (footer button, not the backdrop)
    const cancelBtns = screen.getAllByRole('button', { name: 'Cancel' });
    fireEvent.click(cancelBtns[cancelBtns.length - 1]);

    expect(screen.queryByRole('heading', { name: 'Suspend Intake' })).not.toBeInTheDocument();
    expect(mockSuspendItem).not.toHaveBeenCalled();
  });

  it('does NOT open the detail panel when "Suspend Intake" is clicked from the kebab (row click should not bubble)', () => {
    render(<CataloguePage />);
    openKebab(0);
    fireEvent.click(screen.getByRole('menuitem', { name: 'Suspend Intake' }));

    // ItemDetailModal stays closed — its "Material Profile" heading must not appear.
    expect(
      screen.queryByRole('heading', { name: /material profile/i })
    ).not.toBeInTheDocument();
    expect(mockFetchInventoryItem).not.toHaveBeenCalled();
  });

  it('calls suspendItem on confirm, shows a success toast, and reloads the list', async () => {
    mockSuspendItem.mockResolvedValue({ ...activeItem, status: 'INTAKE_SUSPENDED' });
    render(<CataloguePage />);

    openKebab(0);
    fireEvent.click(screen.getByRole('menuitem', { name: 'Suspend Intake' }));
    fireEvent.click(screen.getByRole('button', { name: 'Suspend' }));

    await waitFor(() => expect(mockSuspendItem).toHaveBeenCalledWith('item-1'));
    expect(mockReload).toHaveBeenCalledTimes(1);
    expect(
      await screen.findByText(/intake suspended for 9mm mdf board/i)
    ).toBeInTheDocument();
  });

  it('calls activateItem on confirm for a suspended item and shows the reactivated toast', async () => {
    mockActivateItem.mockResolvedValue({ ...suspendedItem, status: 'ACTIVE' });
    render(<CataloguePage />);

    openKebab(1);
    fireEvent.click(screen.getByRole('menuitem', { name: 'Activate Item' }));

    // The dialog confirm button is labelled "Activate" (not "Suspend")
    fireEvent.click(screen.getByRole('button', { name: 'Activate' }));

    await waitFor(() => expect(mockActivateItem).toHaveBeenCalledWith('item-2'));
    expect(mockReload).toHaveBeenCalledTimes(1);
    expect(
      await screen.findByText(/industrial wood glue reactivated/i)
    ).toBeInTheDocument();
  });

  it('shows an error toast and keeps the dialog open when the API rejects', async () => {
    mockSuspendItem.mockRejectedValue(new Error('Backend exploded'));
    render(<CataloguePage />);

    openKebab(0);
    fireEvent.click(screen.getByRole('menuitem', { name: 'Suspend Intake' }));
    fireEvent.click(screen.getByRole('button', { name: 'Suspend' }));

    expect(await screen.findByText('Backend exploded')).toBeInTheDocument();
    // Dialog stays open
    expect(screen.getByRole('heading', { name: 'Suspend Intake' })).toBeInTheDocument();
    expect(mockReload).not.toHaveBeenCalled();
  });

  it('auto-dismisses the toast after 4 seconds', async () => {
    jest.useFakeTimers();
    mockSuspendItem.mockResolvedValue({ ...activeItem, status: 'INTAKE_SUSPENDED' });
    render(<CataloguePage />);

    openKebab(0);
    fireEvent.click(screen.getByRole('menuitem', { name: 'Suspend Intake' }));
    fireEvent.click(screen.getByRole('button', { name: 'Suspend' }));

    await waitFor(() => expect(mockSuspendItem).toHaveBeenCalled());
    expect(
      await screen.findByText(/intake suspended for 9mm mdf board/i)
    ).toBeInTheDocument();

    act(() => {
      jest.advanceTimersByTime(4000);
    });

    expect(screen.queryByText(/intake suspended for/i)).not.toBeInTheDocument();
  });
});
