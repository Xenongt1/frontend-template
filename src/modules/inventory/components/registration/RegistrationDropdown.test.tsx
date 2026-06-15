import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { RegistrationDropdown } from './RegistrationDropdown';

const OPTIONS = [
  { label: 'One', value: '1' },
  { label: 'Two', value: '2' },
];

describe('RegistrationDropdown', () => {
  it('renders the placeholder when no value is selected', () => {
    render(
      <RegistrationDropdown
        id="dd"
        options={OPTIONS}
        placeholder="Pick one"
        value=""
        onChange={() => {}}
      />
    );
    const btn = screen.getByRole('button', { name: /pick one/i });
    expect(btn).toHaveAttribute('aria-expanded', 'false');
  });

  it('renders the selected option label when a value matches', () => {
    render(
      <RegistrationDropdown
        id="dd"
        options={OPTIONS}
        value="2"
        onChange={() => {}}
      />
    );
    expect(screen.getByRole('button', { name: 'Two' })).toBeInTheDocument();
  });

  it('falls back to "Select" when no placeholder and no match', () => {
    render(
      <RegistrationDropdown
        id="dd"
        options={OPTIONS}
        value=""
        onChange={() => {}}
      />
    );
    expect(screen.getByRole('button', { name: 'Select' })).toBeInTheDocument();
  });

  it('opens the listbox on trigger click and shows options + placeholder row', () => {
    render(
      <RegistrationDropdown
        id="dd"
        options={OPTIONS}
        placeholder="Pick one"
        value=""
        onChange={() => {}}
      />
    );
    fireEvent.click(screen.getByRole('button', { name: /pick one/i }));
    expect(screen.getByRole('listbox')).toBeInTheDocument();
    // placeholder + 2 options
    expect(screen.getAllByRole('option')).toHaveLength(3);
  });

  it('calls onChange with the selected value and closes the listbox', () => {
    const onChange = jest.fn();
    render(
      <RegistrationDropdown
        id="dd"
        options={OPTIONS}
        placeholder="Pick one"
        value=""
        onChange={onChange}
      />
    );
    fireEvent.click(screen.getByRole('button', { name: /pick one/i }));
    fireEvent.click(screen.getByRole('option', { name: 'Two' }));
    expect(onChange).toHaveBeenCalledWith('2');
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('calls onChange with "" when the placeholder row is clicked', () => {
    const onChange = jest.fn();
    render(
      <RegistrationDropdown
        id="dd"
        options={OPTIONS}
        placeholder="Pick one"
        value="1"
        onChange={onChange}
      />
    );
    fireEvent.click(screen.getByRole('button', { name: 'One' }));
    fireEvent.click(screen.getByRole('option', { name: /pick one/i }));
    expect(onChange).toHaveBeenCalledWith('');
  });

  it('closes when clicking outside (pointerdown)', () => {
    render(
      <div>
        <RegistrationDropdown
          id="dd"
          options={OPTIONS}
          placeholder="Pick one"
          value=""
          onChange={() => {}}
        />
        <button data-testid="outside">outside</button>
      </div>
    );
    fireEvent.click(screen.getByRole('button', { name: /pick one/i }));
    expect(screen.getByRole('listbox')).toBeInTheDocument();

    fireEvent.pointerDown(screen.getByTestId('outside'));
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });
});
