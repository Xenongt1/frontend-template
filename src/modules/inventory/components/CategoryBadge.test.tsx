import React from 'react';
import { render, screen } from '@testing-library/react';
import CategoryBadge from './CategoryBadge';

describe('CategoryBadge', () => {
  it('replaces underscores with spaces and applies the matching color class', () => {
    render(<CategoryBadge category="RAW_MATERIAL" />);
    const badge = screen.getByText('RAW MATERIAL');
    expect(badge).toBeInTheDocument();
    expect(badge.className).toContain('bg-[#DEF7EC]');
  });

  it.each([
    ['CONSUMABLES', 'CONSUMABLES', 'bg-[#FFF9E6]'],
    ['FOOD', 'FOOD', 'bg-[#FFF9E6]'],
    ['FINISHED_GOODS', 'FINISHED GOODS', 'bg-[#F3FAF7]'],
    ['CONSTRUCTION', 'CONSTRUCTION', 'bg-[#DEF7EC]'],
    ['VEHICLES', 'VEHICLES', 'bg-[#EDF2FF]'],
    ['ELECTRONICS', 'ELECTRONICS', 'bg-[#EDF2FF]'],
  ])('renders %s as "%s" with class %s', (category, label, cls) => {
    render(<CategoryBadge category={category} />);
    const badge = screen.getByText(label);
    expect(badge.className).toContain(cls);
  });

  it('falls back to the default blue class for unknown categories', () => {
    render(<CategoryBadge category="UNKNOWN_THING" />);
    const badge = screen.getByText('UNKNOWN THING');
    expect(badge.className).toContain('bg-[#EDF2FF]');
  });
});
