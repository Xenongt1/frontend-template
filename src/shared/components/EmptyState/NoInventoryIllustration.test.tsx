import React from 'react';
import { render } from '@testing-library/react';
import NoInventoryIllustration from './NoInventoryIllustration';

describe('NoInventoryIllustration', () => {
  it('renders an svg element', () => {
    const { container } = render(<NoInventoryIllustration />);
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute('viewBox', '0 0 300 221');
  });

  it('forwards arbitrary props such as aria-label and role to the svg', () => {
    const { container } = render(
      <NoInventoryIllustration aria-label="custom" role="img" />
    );
    const svg = container.querySelector('svg')!;
    expect(svg).toHaveAttribute('aria-label', 'custom');
    expect(svg).toHaveAttribute('role', 'img');
  });
});
