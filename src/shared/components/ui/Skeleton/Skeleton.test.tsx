import React from 'react';
import { render } from '@testing-library/react';
import { Skeleton } from './Skeleton';

describe('Skeleton', () => {
  it('uses the text variant class by default and is aria-hidden', () => {
    const { container } = render(<Skeleton />);
    const el = container.firstChild as HTMLDivElement;
    expect(el).toHaveAttribute('aria-hidden');
    expect(el.className).toContain('animate-pulse');
    expect(el.className).toContain('h-3.5');
    expect(el.className).toContain('rounded');
  });

  it.each([
    ['pill', 'h-7'],
    ['circle', 'rounded-md'],
    ['block', 'rounded'],
  ] as const)('renders the %s variant with class %s', (variant, fragment) => {
    const { container } = render(<Skeleton variant={variant} />);
    expect((container.firstChild as HTMLDivElement).className).toContain(fragment);
  });

  it('merges extra className and forwards arbitrary props', () => {
    const { container } = render(
      <Skeleton className="w-32" data-testid="skel" />
    );
    const el = container.firstChild as HTMLDivElement;
    expect(el).toHaveAttribute('data-testid', 'skel');
    expect(el.className).toContain('w-32');
  });
});
