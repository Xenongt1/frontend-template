import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';

// ─── Mocks (must be declared before the lazy imports below) ──────────────────

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
  useParams: () => ({ id: 'item-123' }),
}));

class MockApiError extends Error {
  status: number;
  errors?: Record<string, string>;
  constructor(message: string, status: number, errors?: Record<string, string>) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.errors = errors;
  }
}

const getCategories     = jest.fn();
const getUnitsOfMeasure = jest.fn();
const getItem           = jest.fn();
const updateItem        = jest.fn();

jest.mock('@/core/api', () => ({
  ApiError: MockApiError,
  inventoryApi: {
    getCategories:      (...args: unknown[]) => getCategories(...args),
    getUnitsOfMeasure:  (...args: unknown[]) => getUnitsOfMeasure(...args),
    getItem:            (...args: unknown[]) => getItem(...args),
    updateItem:         (...args: unknown[]) => updateItem(...args),
  },
}));

import EditInventoryPage from './EditInventoryPage';

// ─── Helpers ─────────────────────────────────────────────────────────────────

const okResponse = <T,>(data: T) => ({ success: true, data });

const mockItem = {
  id: 'item-123',
  sku: 'STL-001',
  displayName: 'Sheet Steel',
  category: 'Raw Materials',
  baseUnitOfMeasure: 'Kilogram',
  description: 'Steel sheets',
  reorderThreshold: 50,
  expiryNotificationDays: null,
  status: 'ACTIVE' as const,
  stockUnit: 1,
  attributes: [],
  grades: [],
  batchFields: [],
  properties: [],
  stockIntakeProperties: [],
  expiryNotificationSchedule: [],
  tags: [],
};

async function flushLoad() {
  await waitFor(() => {
    expect(getItem).toHaveBeenCalled();
    expect(getCategories).toHaveBeenCalled();
    expect(getUnitsOfMeasure).toHaveBeenCalled();
  });
}

// ─── Setup ────────────────────────────────────────────────────────────────────

beforeEach(() => {
  jest.useRealTimers();
  mockNavigate.mockReset();
  getCategories.mockReset();
  getUnitsOfMeasure.mockReset();
  getItem.mockReset();
  updateItem.mockReset();

  // getCategories returns FilterOption[] directly (not wrapped in ApiResponse)
  getCategories.mockResolvedValue([
    { value: 'cat-1', label: 'Raw Materials' },
  ]);
  getUnitsOfMeasure.mockResolvedValue(
    okResponse([{ id: 'uom-kg', name: 'Kilogram' }]),
  );
  getItem.mockResolvedValue(mockItem);
});

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('EditInventoryPage', () => {
  // ── Loading state ──────────────────────────────────────────────────────────

  it('shows a skeleton loading state before the item resolves', () => {
    // Hold the promise so the component stays in loading state
    getItem.mockReturnValue(new Promise(() => {}));
    render(<EditInventoryPage />);

    // The back button should be visible immediately
    expect(screen.getByRole('button', { name: /back to inventory/i })).toBeInTheDocument();
    // The form fields should not yet be visible
    expect(screen.queryByLabelText(/^name/i)).not.toBeInTheDocument();
  });

  // ── Load error ─────────────────────────────────────────────────────────────

  it('shows an error message when the item fails to load', async () => {
    getItem.mockRejectedValue(new Error('Server error'));
    render(<EditInventoryPage />);

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Server error');
    });
  });

  // ── Pre-population ─────────────────────────────────────────────────────────

  it('pre-populates the form fields with the loaded item data', async () => {
    render(<EditInventoryPage />);
    await flushLoad();

    // Step 0 — name and description
    expect((await screen.findByLabelText(/^name/i) as HTMLInputElement).value)
      .toBe('Sheet Steel');
    expect((screen.getByLabelText(/description/i) as HTMLTextAreaElement).value)
      .toBe('Steel sheets');

    // Navigate to notifications step (step 0 → 1 → 2) to check reorder level
    fireEvent.click(screen.getByRole('button', { name: /next/i }));
    await waitFor(() => screen.getByRole('button', { name: /next/i }));
    fireEvent.click(screen.getByRole('button', { name: /next/i }));
    await screen.findByLabelText(/minimum reorder level/i);
    expect((screen.getByLabelText(/minimum reorder level/i) as HTMLInputElement).value)
      .toBe('50');
  });

  // ── Step validation ────────────────────────────────────────────────────────

  it('blocks Next when name is cleared', async () => {
    render(<EditInventoryPage />);
    await flushLoad();
    await screen.findByLabelText(/^name/i);

    fireEvent.change(screen.getByLabelText(/^name/i), { target: { value: '' } });
    fireEvent.click(screen.getByRole('button', { name: /next/i }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });
    // Step 1 (Properties heading) should not be visible — we didn't advance
    expect(screen.queryByRole('heading', { name: /inventory item properties/i })).not.toBeInTheDocument();
  });

  // ── Successful submit ──────────────────────────────────────────────────────

  it('calls updateItem with the correct id and payload on submit', async () => {
    updateItem.mockResolvedValue(okResponse(mockItem));
    render(<EditInventoryPage />);
    await flushLoad();
    await screen.findByLabelText(/^name/i);

    // Step 0 — already filled; advance
    fireEvent.click(screen.getByRole('button', { name: /next/i }));
    // Step 1 — advance
    await waitFor(() => screen.getByRole('button', { name: /next/i }));
    fireEvent.click(screen.getByRole('button', { name: /next/i }));
    // Step 2 — advance
    await waitFor(() => screen.getByRole('button', { name: /next/i }));
    fireEvent.click(screen.getByRole('button', { name: /next/i }));

    // Step 3 (Review) — save
    await waitFor(() => screen.getByRole('button', { name: /save changes/i }));
    fireEvent.click(screen.getByRole('button', { name: /save changes/i }));

    await waitFor(() => expect(updateItem).toHaveBeenCalledTimes(1));

    const [id, payload] = updateItem.mock.calls[0];
    expect(id).toBe('item-123');
    expect(payload).toMatchObject({ name: 'Sheet Steel' });
  });

  it('shows success toast and navigates to catalogue after save', async () => {
    jest.useFakeTimers();
    updateItem.mockResolvedValue(okResponse(mockItem));
    render(<EditInventoryPage />);
    await flushLoad();
    await screen.findByLabelText(/^name/i);

    // Navigate through all steps
    fireEvent.click(screen.getByRole('button', { name: /next/i }));
    await waitFor(() => screen.getByRole('button', { name: /next/i }));
    fireEvent.click(screen.getByRole('button', { name: /next/i }));
    await waitFor(() => screen.getByRole('button', { name: /next/i }));
    fireEvent.click(screen.getByRole('button', { name: /next/i }));
    await waitFor(() => screen.getByRole('button', { name: /save changes/i }));
    fireEvent.click(screen.getByRole('button', { name: /save changes/i }));

    expect(await screen.findByText(/item updated successfully/i)).toBeInTheDocument();

    act(() => { jest.advanceTimersByTime(1200); });
    expect(mockNavigate).toHaveBeenCalledWith('/inventory/catalogue');

    jest.useRealTimers();
  });

  // ── Submit error ───────────────────────────────────────────────────────────

  it('shows a submit error when updateItem rejects', async () => {
    updateItem.mockRejectedValue(new Error('Server unavailable'));
    render(<EditInventoryPage />);
    await flushLoad();
    await screen.findByLabelText(/^name/i);

    fireEvent.click(screen.getByRole('button', { name: /next/i }));
    await waitFor(() => screen.getByRole('button', { name: /next/i }));
    fireEvent.click(screen.getByRole('button', { name: /next/i }));
    await waitFor(() => screen.getByRole('button', { name: /next/i }));
    fireEvent.click(screen.getByRole('button', { name: /next/i }));
    await waitFor(() => screen.getByRole('button', { name: /save changes/i }));
    fireEvent.click(screen.getByRole('button', { name: /save changes/i }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Server unavailable');
    });
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  // ── Cancel navigation ──────────────────────────────────────────────────────

  it('navigates to catalogue when Cancel is clicked on step 0', async () => {
    render(<EditInventoryPage />);
    await flushLoad();
    await screen.findByLabelText(/^name/i);

    fireEvent.click(screen.getByRole('button', { name: /cancel/i }));
    expect(mockNavigate).toHaveBeenCalledWith('/inventory/catalogue');
  });
});
