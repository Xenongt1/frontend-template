import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { AttributesSection } from './AttributesSection';

describe('AttributesSection', () => {
  it('shows the empty panel when there are no attributes and the form is closed', () => {
    render(<AttributesSection />);
    expect(
      screen.getByText(/No Attributes added/i)
    ).toBeInTheDocument();
  });

  it('calls onOpenForm when the Add Attribute button is clicked', () => {
    const onOpenForm = jest.fn();
    render(<AttributesSection onOpenForm={onOpenForm} />);
    fireEvent.click(screen.getByRole('button', { name: /add attribute/i }));
    expect(onOpenForm).toHaveBeenCalledTimes(1);
  });

  it('hides the empty panel when the form is open and renders the inputs', () => {
    const onNameChange = jest.fn();
    const onValueChange = jest.fn();
    const onAdd = jest.fn();
    render(
      <AttributesSection
        isFormOpen
        nameValue="Thickness"
        value="0.9mm"
        onNameChange={onNameChange}
        onValueChange={onValueChange}
        onAdd={onAdd}
      />
    );

    expect(screen.queryByText(/No Attributes added/i)).not.toBeInTheDocument();

    const nameInput = screen.getByLabelText(/attribute name/i) as HTMLInputElement;
    const valueInput = screen.getByLabelText(/^value$/i) as HTMLInputElement;
    expect(nameInput.value).toBe('Thickness');
    expect(valueInput.value).toBe('0.9mm');

    fireEvent.change(nameInput, { target: { value: 'Width' } });
    fireEvent.change(valueInput, { target: { value: '12mm' } });
    expect(onNameChange).toHaveBeenCalledWith('Width');
    expect(onValueChange).toHaveBeenCalledWith('12mm');

    fireEvent.click(screen.getByRole('button', { name: /^add$/i }));
    expect(onAdd).toHaveBeenCalledTimes(1);
  });

  it('renders attribute chips and calls onRemove with the clicked attribute', () => {
    const onRemove = jest.fn();
    render(
      <AttributesSection
        attributes={['Color: Red', 'Weight: 5kg']}
        onRemove={onRemove}
      />
    );

    expect(screen.getByText('Color: Red')).toBeInTheDocument();
    expect(screen.getByText('Weight: 5kg')).toBeInTheDocument();
    // Empty panel should be hidden
    expect(screen.queryByText(/No Attributes added/i)).not.toBeInTheDocument();

    fireEvent.click(screen.getByLabelText('Remove Color: Red'));
    expect(onRemove).toHaveBeenCalledWith('Color: Red');
  });
});
