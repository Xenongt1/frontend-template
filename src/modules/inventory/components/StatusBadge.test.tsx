import React from 'react';
import { render, screen } from '@testing-library/react';
import StatusBadge from './StatusBadge';

describe('StatusBadge', () => {
  it.each([
    ['ACTIVE', 'Active', 'bg-[#F3FAF7]'],
    ['INACTIVE', 'Inactive', 'bg-[#FDF2F2]'],
    ['INTAKE_SUSPENDED', 'Intake Suspended', 'bg-[#FDF2F2]'],
  ] as const)('renders status %s with label "%s" and class %s', (status, label, cls) => {
    render(<StatusBadge status={status} />);
    const badge = screen.getByText(label);
    expect(badge).toBeInTheDocument();
    expect(badge.className).toContain(cls);
  });
});
