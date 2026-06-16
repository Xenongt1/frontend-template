import React, { createRef } from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Input } from './Input';

describe('Input', () => {
  it('renders an input and forwards ref + arbitrary props', () => {
    const ref = createRef<HTMLInputElement>();
    render(
      <Input
        ref={ref}
        placeholder="Type here"
        data-testid="my-input"
        defaultValue="hi"
      />
    );

    const input = screen.getByTestId('my-input') as HTMLInputElement;
    expect(input).toBeInTheDocument();
    expect(input).toBe(ref.current);
    expect(input.placeholder).toBe('Type here');
    expect(input.value).toBe('hi');
  });

  it('toggles focused styles on focus and blur and calls user handlers', () => {
    const onFocus = jest.fn();
    const onBlur = jest.fn();
    render(
      <Input
        data-testid="focus-input"
        onFocus={onFocus}
        onBlur={onBlur}
      />
    );

    const input = screen.getByTestId('focus-input');
    const unfocusedBorder = (input as HTMLInputElement).style.border;

    fireEvent.focus(input);
    expect(onFocus).toHaveBeenCalledTimes(1);
    expect((input as HTMLInputElement).style.border).not.toBe(unfocusedBorder);
    expect((input as HTMLInputElement).style.boxShadow).not.toBe('none');

    fireEvent.blur(input);
    expect(onBlur).toHaveBeenCalledTimes(1);
    expect((input as HTMLInputElement).style.border).toBe(unfocusedBorder);
  });

  it('merges caller style overrides on top of defaults', () => {
    render(
      <Input
        data-testid="styled-input"
        style={{ background: 'rgb(255, 0, 0)', padding: '99px' }}
      />
    );
    const input = screen.getByTestId('styled-input') as HTMLInputElement;
    expect(input.style.background).toBe('rgb(255, 0, 0)');
    expect(input.style.padding).toBe('99px');
  });

  it('fires onChange', () => {
    const onChange = jest.fn();
    render(<Input data-testid="i" onChange={onChange} />);
    fireEvent.change(screen.getByTestId('i'), { target: { value: 'abc' } });
    expect(onChange).toHaveBeenCalledTimes(1);
  });
});
