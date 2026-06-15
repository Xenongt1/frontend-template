import React from 'react';
import { render, screen } from '@testing-library/react';
import { ReviewStep } from './ReviewStep';
import type { AttributeItem, BasicInfoValues, IntakeField } from './types';

const baseBasicInfo: BasicInfoValues = {
  name: '',
  category: '',
  uom: '',
  stockUnit: '',
  description: '',
};

const baseProps: React.ComponentProps<typeof ReviewStep> = {
  basicInfo: baseBasicInfo,
  categoryOptions: [],
  uomOptions: [],
  attributes: [],
  intakeFields: [],
  tags: [],
  enableExpiryAlert: false,
  expiryDays: '',
  enableReorderAlert: false,
  reorderLevel: '',
  enableMinStockAlert: false,
  minStockLevel: '',
};

function renderReview(overrides: Partial<React.ComponentProps<typeof ReviewStep>> = {}) {
  return render(<ReviewStep {...baseProps} {...overrides} />);
}

describe('ReviewStep', () => {
  it('renders dash placeholders for an empty basic-info form', () => {
    renderReview();
    const dashes = screen.getAllByText('—');
    expect(dashes.length).toBeGreaterThanOrEqual(3);
    expect(screen.getByText('No intake fields defined.')).toBeInTheDocument();
  });

  it('shows resolved category + uom labels', () => {
    renderReview({
      basicInfo: {
        ...baseBasicInfo,
        name: 'Sheet Metal',
        category: 'raw-materials',
        uom: 'kg',
        description: 'Long description',
      },
      categoryOptions: [{ label: 'Raw Materials', value: 'raw-materials' }],
      uomOptions: [{ label: 'kg', value: 'kg' }],
    });
    expect(screen.getByText('Sheet Metal')).toBeInTheDocument();
    expect(screen.getByText('Raw Materials')).toBeInTheDocument();
    expect(screen.getByText('Long description')).toBeInTheDocument();
  });

  it('renders attribute badges', () => {
    const attributes: AttributeItem[] = [
      { id: 'a1', label: 'Thickness', value: '0.9mm', type: 'text' },
    ];
    renderReview({ attributes });
    expect(screen.getByText('Thickness: 0.9mm')).toBeInTheDocument();
  });

  it('shows expiry days when alert is enabled and days set', () => {
    renderReview({ enableExpiryAlert: true, expiryDays: '7' });
    expect(screen.getByText('7 days')).toBeInTheDocument();
  });

  it('shows expiry value even when alert is disabled', () => {
    renderReview({ enableExpiryAlert: false, expiryDays: '7' });
    expect(screen.getByText('7 days')).toBeInTheDocument();
  });

  it('lists intake fields with type and requirement badges', () => {
    const intakeFields: IntakeField[] = [
      { id: 'f1', label: 'Driver', type: 'text', required: true },
      { id: 'f2', label: '', type: 'text', required: false },
      { id: 'f3', label: 'Notes', type: 'number', required: false },
    ];
    renderReview({ intakeFields });
    expect(screen.getByText('Driver')).toBeInTheDocument();
    expect(screen.getByText('Notes')).toBeInTheDocument();
    expect(screen.getByText('Required')).toBeInTheDocument();
    expect(screen.getByText('Optional')).toBeInTheDocument();
    expect(screen.queryByText('No intake fields defined.')).not.toBeInTheDocument();
  });

  it('renders tags when provided', () => {
    renderReview({ tags: ['imported', 'hazardous'] });
    expect(screen.getByText('imported')).toBeInTheDocument();
    expect(screen.getByText('hazardous')).toBeInTheDocument();
  });

  it('shows reorder level when alert is enabled', () => {
    renderReview({ enableReorderAlert: true, reorderLevel: '50' });
    expect(screen.getByText('50')).toBeInTheDocument();
  });
});
