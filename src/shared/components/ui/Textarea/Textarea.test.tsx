import React, { createRef } from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Textarea } from './Textarea';

describe('Textarea', () => {
  it('renders, forwards ref and merges style overrides', () => {
    const ref = createRef<HTMLTextAreaElement>();
    render(
      <Textarea
        ref={ref}
        data-testid="ta"
        placeholder="Notes"
        style={{ minHeight: '200px' }}
      />
    );
    const ta = screen.getByTestId('ta') as HTMLTextAreaElement;
    expect(ta).toBe(ref.current);
    expect(ta.placeholder).toBe('Notes');
    expect(ta.style.minHeight).toBe('200px');
  });

  it('toggles focus border + boxShadow and calls user handlers', () => {
    const onFocus = jest.fn();
    const onBlur = jest.fn();
    render(<Textarea data-testid="ta" onFocus={onFocus} onBlur={onBlur} />);

    const ta = screen.getByTestId('ta') as HTMLTextAreaElement;
    const initialShadow = ta.style.boxShadow;

    fireEvent.focus(ta);
    expect(onFocus).toHaveBeenCalledTimes(1);
    expect(ta.style.boxShadow).not.toBe(initialShadow);

    fireEvent.blur(ta);
    expect(onBlur).toHaveBeenCalledTimes(1);
    expect(ta.style.boxShadow).toBe('none');
  });

  it('emits onChange', () => {
    const onChange = jest.fn();
    render(<Textarea data-testid="ta" onChange={onChange} />);
    fireEvent.change(screen.getByTestId('ta'), { target: { value: 'x' } });
    expect(onChange).toHaveBeenCalledTimes(1);
  });
});
