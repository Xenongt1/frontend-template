import React, { createRef } from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Select } from './Select';

const OPTIONS = [
  { label: 'Apple', value: 'a' },
  { label: 'Banana', value: 'b' },
];

describe('Select', () => {
  it('renders placeholder + options and forwards ref', () => {
    const ref = createRef<HTMLSelectElement>();
    render(
      <Select
        ref={ref}
        options={OPTIONS}
        placeholder="Pick one"
        value=""
        onChange={() => {}}
        data-testid="sel"
      />
    );
    const sel = screen.getByTestId('sel') as HTMLSelectElement;
    expect(sel).toBe(ref.current);
    // placeholder + 2 options
    expect(sel.options).toHaveLength(3);
    expect(sel.options[0].textContent).toBe('Pick one');
    expect(sel.options[1].value).toBe('a');
    expect(sel.options[2].value).toBe('b');
    // placeholder color (no value picked)
    expect(sel.style.color).toBe('rgb(156, 163, 175)');
  });

  it('omits the placeholder option when no placeholder is given', () => {
    render(
      <Select
        options={OPTIONS}
        value="a"
        onChange={() => {}}
        data-testid="sel"
      />
    );
    const sel = screen.getByTestId('sel') as HTMLSelectElement;
    expect(sel.options).toHaveLength(2);
  });

  it('uses selected-value color when a value is picked', () => {
    render(
      <Select
        options={OPTIONS}
        value="a"
        onChange={() => {}}
        data-testid="sel"
      />
    );
    const sel = screen.getByTestId('sel') as HTMLSelectElement;
    expect(sel.style.color).toBe('rgb(8, 40, 59)');
  });

  it('fires user focus/blur/change handlers and toggles focus style', () => {
    const onFocus = jest.fn();
    const onBlur = jest.fn();
    const onChange = jest.fn();
    render(
      <Select
        options={OPTIONS}
        placeholder="Pick"
        value=""
        onFocus={onFocus}
        onBlur={onBlur}
        onChange={onChange}
        data-testid="sel"
      />
    );
    const sel = screen.getByTestId('sel') as HTMLSelectElement;
    const unfocusedShadow = sel.style.boxShadow;

    fireEvent.focus(sel);
    expect(onFocus).toHaveBeenCalledTimes(1);
    expect(sel.style.boxShadow).not.toBe(unfocusedShadow);

    fireEvent.change(sel, { target: { value: 'b' } });
    expect(onChange).toHaveBeenCalledTimes(1);

    fireEvent.blur(sel);
    expect(onBlur).toHaveBeenCalledTimes(1);
    expect(sel.style.boxShadow).toBe('none');
  });
});
