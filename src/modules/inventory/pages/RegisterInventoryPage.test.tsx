import React from 'react';
import { render, screen, fireEvent, waitFor, act, within } from '@testing-library/react';

/* ─── Mocks ────────────────────────────────────────────────────────────────── */

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}));

class MockApiError extends Error {
  status: number;
  errors?: string[];
  constructor(message: string, status: number, errors?: string[]) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.errors = errors;
  }
}

const getCategories = jest.fn();
const getUnitsOfMeasure = jest.fn();
const createItem = jest.fn();

jest.mock('@/core/api', () => ({
  ApiError: MockApiError,
}));

jest.mock('../api/inventoryApi', () => ({
  inventoryApi: {
    getCategories:    (...args: unknown[]) => getCategories(...args),
    getUnitsOfMeasure: (...args: unknown[]) => getUnitsOfMeasure(...args),
    createItem:       (...args: unknown[]) => createItem(...args),
  },
  fetchInventoryItems: jest.fn().mockResolvedValue({
    items: [], total: 0, page: 0, pageSize: 10,
  }),
}));

import RegisterInventoryPage from './RegisterInventoryPage';

const okResponse = <T,>(data: T) => ({ success: true, data });

beforeEach(() => {
  jest.useRealTimers();
  mockNavigate.mockReset();
  getCategories.mockReset();
  getUnitsOfMeasure.mockReset();
  createItem.mockReset();

  // getCategories returns FilterOption[] directly (not wrapped in ApiResponse)
  getCategories.mockResolvedValue([
    { value: 'cat-1', label: 'Raw Materials' },
  ]);
  getUnitsOfMeasure.mockResolvedValue(
    okResponse([{ id: 'kg', name: 'kg' }, { id: 'pcs', name: 'pcs' }])
  );
});

async function flushLookups() {
  await waitFor(() => {
    expect(getCategories).toHaveBeenCalled();
    expect(getUnitsOfMeasure).toHaveBeenCalled();
  });
}

// Fill required fields on step 0 (BasicInfoStep).
function fillRequiredBasicInfo() {
  fireEvent.change(screen.getByLabelText(/^name/i), { target: { value: 'Test Item' } });
  fireEvent.change(screen.getByLabelText(/stock units/i), { target: { value: '1' } });

  fireEvent.click(screen.getByLabelText(/^category/i));
  fireEvent.click(screen.getByRole('option', { name: 'Raw Materials' }));

  fireEvent.click(screen.getByLabelText(/unit of measure/i));
  fireEvent.click(screen.getByRole('option', { name: 'kg' }));
}

/* ─── Tests ────────────────────────────────────────────────────────────────── */

describe('RegisterInventoryPage', () => {
  it('renders the stepper with all step labels and Cancel navigates back', async () => {
    render(<RegisterInventoryPage />);
    await flushLookups();

    // RegistrationStepper nav has aria-label "Registration steps"
    const stepperNav = screen.getByRole('navigation', { name: /registration steps/i });
    expect(within(stepperNav).getByText('Basic Information')).toBeInTheDocument();
    expect(within(stepperNav).getByText('Properties')).toBeInTheDocument();
    expect(within(stepperNav).getByText('Notifications')).toBeInTheDocument();
    expect(within(stepperNav).getByText('Review')).toBeInTheDocument();

    // Step 0 form field is visible
    expect(screen.getByLabelText(/^name/i)).toBeInTheDocument();

    // Cancel button on step 0 navigates away
    fireEvent.click(screen.getByRole('button', { name: /^cancel$/i }));
    expect(mockNavigate).toHaveBeenCalledWith('/inventory/catalogue');

    // Back to Inventory button also navigates away
    fireEvent.click(screen.getByRole('button', { name: /back to inventory/i }));
    expect(mockNavigate).toHaveBeenCalledWith('/inventory/catalogue');
  });

  it('falls back gracefully when lookup APIs reject', async () => {
    getCategories.mockRejectedValueOnce(new Error('boom'));
    getUnitsOfMeasure.mockRejectedValueOnce(new Error('boom'));
    render(<RegisterInventoryPage />);
    await flushLookups();
    // No throw — page still renders the first step
    expect(screen.getByLabelText(/^name/i)).toBeInTheDocument();
  });

  it('navigates between steps using Next / Previous', async () => {
    render(<RegisterInventoryPage />);
    await flushLookups();
    fillRequiredBasicInfo();

    fireEvent.click(screen.getByRole('button', { name: /^next$/i }));
    // Step 1 (PropertiesStep) — "Add Property" header button is visible
    expect(
      await screen.findByRole('button', { name: /add property/i })
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /^previous$/i }));
    // Back to step 0 — name field visible again
    expect(await screen.findByLabelText(/^name/i)).toBeInTheDocument();
  });

  it('supports adding and removing attributes through the Properties step', async () => {
    render(<RegisterInventoryPage />);
    await flushLookups();

    // Navigate to Properties step
    fillRequiredBasicInfo();
    fireEvent.click(screen.getByRole('button', { name: /^next$/i }));
    await screen.findByRole('button', { name: /add property/i });

    // Open inline attribute form
    const attrSection = screen.getByRole('region', { name: /inventory item properties/i });
    fireEvent.click(within(attrSection).getByRole('button', { name: /add property/i }));

    // Fill in attribute name and value
    fireEvent.change(screen.getByLabelText(/attribute name/i), {
      target: { value: 'Color' },
    });
    fireEvent.change(screen.getByLabelText(/value/i), {
      target: { value: 'Red' },
    });
    fireEvent.click(within(attrSection).getByRole('button', { name: /^add$/i }));

    // Chip appears
    expect(screen.getByText('Color: Red')).toBeInTheDocument();

    // Remove chip
    fireEvent.click(screen.getByRole('button', { name: /remove color red/i }));
    expect(screen.queryByText('Color: Red')).not.toBeInTheDocument();
  });

  it('ignores empty attribute draft on Add', async () => {
    render(<RegisterInventoryPage />);
    await flushLookups();

    fillRequiredBasicInfo();
    fireEvent.click(screen.getByRole('button', { name: /^next$/i }));
    const attrSection = await screen.findByRole('region', { name: /inventory item properties/i });

    fireEvent.click(within(attrSection).getByRole('button', { name: /add property/i }));
    // Click Add with no name/value filled in
    fireEvent.click(within(attrSection).getByRole('button', { name: /^add$/i }));
    // No chip should be created
    expect(screen.queryByRole('button', { name: /^remove /i })).not.toBeInTheDocument();
  });

  it('ignores empty intake field draft on Add', async () => {
    render(<RegisterInventoryPage />);
    await flushLookups();

    fillRequiredBasicInfo();
    fireEvent.click(screen.getByRole('button', { name: /^next$/i }));
    const stockSection = await screen.findByRole('region', { name: /stock level properties/i });

    // Open inline intake field form
    fireEvent.click(within(stockSection).getByRole('button', { name: /add stock property/i }));
    // Click Add with no label filled in
    fireEvent.click(within(stockSection).getByRole('button', { name: /^add$/i }));
    // No row should appear (no remove button visible)
    expect(
      screen.queryByRole('button', { name: /remove field/i })
    ).not.toBeInTheDocument();
  });

  it('builds the payload with trimmed values and submits successfully, showing the toast and redirecting', async () => {
    jest.useFakeTimers();
    createItem.mockResolvedValue(okResponse({ id: 'inv-1' }));
    render(<RegisterInventoryPage />);
    await flushLookups();

    // Step 0 — fill basic info
    fireEvent.change(screen.getByLabelText(/^name/i), {
      target: { value: '  Sheet  ' },
    });
    fireEvent.change(screen.getByLabelText(/stock units/i), {
      target: { value: '1' },
    });
    fireEvent.click(screen.getByLabelText(/^category/i));
    fireEvent.click(screen.getByRole('option', { name: 'Raw Materials' }));
    fireEvent.click(screen.getByLabelText(/unit of measure/i));
    fireEvent.click(screen.getByRole('option', { name: 'kg' }));
    fireEvent.change(screen.getByLabelText(/description/i), {
      target: { value: 'desc' },
    });

    // Step 1 — Properties: add an intake field
    fireEvent.click(screen.getByRole('button', { name: /^next$/i }));
    const stockSection = await screen.findByRole('region', { name: /stock level properties/i });
    fireEvent.click(within(stockSection).getByRole('button', { name: /add stock property/i }));
    fireEvent.change(screen.getByLabelText(/field name/i), {
      target: { value: 'Driver' },
    });
    fireEvent.click(within(stockSection).getByRole('button', { name: /^add$/i }));

    // Step 2 — Notifications: set reorder level and expiry duration
    fireEvent.click(screen.getByRole('button', { name: /^next$/i }));
    await screen.findByLabelText(/minimum reorder level/i);
    fireEvent.change(screen.getByLabelText(/minimum reorder level/i), {
      target: { value: '5' },
    });
    fireEvent.change(screen.getByLabelText(/duration/i), {
      target: { value: '12' },
    });

    // Step 3 — Review: submit
    fireEvent.click(screen.getByRole('button', { name: /^next$/i }));
    fireEvent.click(await screen.findByRole('button', { name: /register inventory item/i }));

    await waitFor(() => {
      expect(createItem).toHaveBeenCalledTimes(1);
    });

    const payload = createItem.mock.calls[0][0];
    expect(payload).toMatchObject({
      name: 'Sheet',
      description: 'desc',
      minStockReorderLevel: 5,
      daysBeforeExpiryNotification: 12,
      stockIntakeProperties: [{ label: 'Driver', required: true, type: 'STRING' }],
    });

    expect(await screen.findByText(/item registered successfully/i)).toBeInTheDocument();

    // Drive the 1200ms redirect timer.
    act(() => {
      jest.advanceTimersByTime(1200);
    });
    expect(mockNavigate).toHaveBeenCalledWith('/inventory/catalogue');
  });

  it('renders backend validation errors when submission fails with ApiError', async () => {
    createItem.mockRejectedValue(
      new MockApiError('Validation failed', 400, [
        'SKU is required',
        'Name is required',
      ])
    );
    render(<RegisterInventoryPage />);
    await flushLookups();
    fillRequiredBasicInfo();

    // Navigate through all 4 steps
    fireEvent.click(screen.getByRole('button', { name: /^next$/i }));
    await screen.findByRole('region', { name: /inventory item properties/i });
    fireEvent.click(screen.getByRole('button', { name: /^next$/i }));
    await screen.findByLabelText(/minimum reorder level/i);
    fireEvent.click(screen.getByRole('button', { name: /^next$/i }));
    fireEvent.click(await screen.findByRole('button', { name: /register inventory item/i }));

    const alert = await screen.findByRole('alert');
    expect(alert.textContent).toContain('SKU is required');
    expect(alert.textContent).toContain('Name is required');
  });

  it('falls back to error.message for non-ApiError failures', async () => {
    createItem.mockRejectedValue(new Error('Network down'));
    render(<RegisterInventoryPage />);
    await flushLookups();
    fillRequiredBasicInfo();

    fireEvent.click(screen.getByRole('button', { name: /^next$/i }));
    await screen.findByRole('region', { name: /inventory item properties/i });
    fireEvent.click(screen.getByRole('button', { name: /^next$/i }));
    await screen.findByLabelText(/minimum reorder level/i);
    fireEvent.click(screen.getByRole('button', { name: /^next$/i }));
    fireEvent.click(await screen.findByRole('button', { name: /register inventory item/i }));

    const alert = await screen.findByRole('alert');
    expect(alert.textContent).toContain('Network down');
  });

  it('dismisses the success toast and cancels the redirect timer when the X is clicked', async () => {
    jest.useFakeTimers();
    createItem.mockResolvedValue(okResponse({ id: 'x' }));
    render(<RegisterInventoryPage />);
    await flushLookups();
    fillRequiredBasicInfo();

    fireEvent.click(screen.getByRole('button', { name: /^next$/i }));
    await screen.findByRole('region', { name: /inventory item properties/i });
    fireEvent.click(screen.getByRole('button', { name: /^next$/i }));
    await screen.findByLabelText(/minimum reorder level/i);
    fireEvent.click(screen.getByRole('button', { name: /^next$/i }));
    fireEvent.click(await screen.findByRole('button', { name: /register inventory item/i }));

    await screen.findByText(/item registered successfully/i);

    fireEvent.click(screen.getByRole('button', { name: /dismiss notification/i }));
    expect(screen.queryByText(/item registered successfully/i)).not.toBeInTheDocument();

    // The cancelled timer should not redirect even after time advances.
    act(() => {
      jest.advanceTimersByTime(5000);
    });
    expect(mockNavigate).not.toHaveBeenCalledWith('/inventory/catalogue');
  });
});
