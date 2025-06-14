
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import OrderActionButtons from '../OrderActionButtons';

describe('OrderActionButtons', () => {
  const mockOnNew = vi.fn();
  const mockOnSave = vi.fn();
  const mockOnSubmit = vi.fn();

  beforeEach(() => {
    mockOnNew.mockClear();
    mockOnSave.mockClear();
    mockOnSubmit.mockClear();
  });

  it('renders all action buttons', () => {
    render(
      <OrderActionButtons
        onNew={mockOnNew}
        onSave={mockOnSave}
        onSubmit={mockOnSubmit}
        isSaving={false}
        hasUnsavedChanges={false}
      />
    );

    expect(screen.getByText('New')).toBeInTheDocument();
    expect(screen.getByText('Save Order')).toBeInTheDocument();
    expect(screen.getByText('Print SPK')).toBeInTheDocument();
    expect(screen.getByText('Print Receipt')).toBeInTheDocument();
  });

  it('calls onNew when New button is clicked', () => {
    render(
      <OrderActionButtons
        onNew={mockOnNew}
        onSave={mockOnSave}
        onSubmit={mockOnSubmit}
        isSaving={false}
        hasUnsavedChanges={false}
      />
    );

    const newButton = screen.getByText('New');
    fireEvent.click(newButton);

    expect(mockOnNew).toHaveBeenCalled();
  });

  it('calls onSave when Save Order button is clicked', () => {
    render(
      <OrderActionButtons
        onNew={mockOnNew}
        onSave={mockOnSave}
        onSubmit={mockOnSubmit}
        isSaving={false}
        hasUnsavedChanges={false}
      />
    );

    const saveButton = screen.getByText('Save Order');
    fireEvent.click(saveButton);

    expect(mockOnSave).toHaveBeenCalled();
  });

  it('calls onSubmit when Print Receipt button is clicked', () => {
    render(
      <OrderActionButtons
        onNew={mockOnNew}
        onSave={mockOnSave}
        onSubmit={mockOnSubmit}
        isSaving={false}
        hasUnsavedChanges={false}
      />
    );

    const printButton = screen.getByText('Print Receipt');
    fireEvent.click(printButton);

    expect(mockOnSubmit).toHaveBeenCalled();
  });

  it('shows "Saving..." text when isSaving is true', () => {
    render(
      <OrderActionButtons
        onNew={mockOnNew}
        onSave={mockOnSave}
        onSubmit={mockOnSubmit}
        isSaving={true}
        hasUnsavedChanges={true}
      />
    );

    expect(screen.getByText('Saving...')).toBeInTheDocument();
    expect(screen.queryByText('Save Order')).not.toBeInTheDocument();
  });

  it('disables save button when saving', () => {
    render(
      <OrderActionButtons
        onNew={mockOnNew}
        onSave={mockOnSave}
        onSubmit={mockOnSubmit}
        isSaving={true}
        hasUnsavedChanges={true}
      />
    );

    const saveButton = screen.getByText('Saving...');
    expect(saveButton).toBeDisabled();
  });

  it('applies different styling when there are unsaved changes', () => {
    render(
      <OrderActionButtons
        onNew={mockOnNew}
        onSave={mockOnSave}
        onSubmit={mockOnSubmit}
        isSaving={false}
        hasUnsavedChanges={true}
      />
    );

    const saveButton = screen.getByText('Save Order');
    expect(saveButton).toHaveClass('bg-[#0050C8]');
  });

  it('uses outline variant when no unsaved changes', () => {
    render(
      <OrderActionButtons
        onNew={mockOnNew}
        onSave={mockOnSave}
        onSubmit={mockOnSubmit}
        isSaving={false}
        hasUnsavedChanges={false}
      />
    );

    const saveButton = screen.getByText('Save Order');
    expect(saveButton).not.toHaveClass('bg-[#0050C8]');
  });

  it('has correct button types', () => {
    render(
      <OrderActionButtons
        onNew={mockOnNew}
        onSave={mockOnSave}
        onSubmit={mockOnSubmit}
        isSaving={false}
        hasUnsavedChanges={false}
      />
    );

    const newButton = screen.getByText('New');
    const saveButton = screen.getByText('Save Order');
    const printSpkButton = screen.getByText('Print SPK');
    const printReceiptButton = screen.getByText('Print Receipt');

    expect(newButton).toHaveAttribute('type', 'button');
    expect(saveButton).toHaveAttribute('type', 'button');
    expect(printSpkButton).toHaveAttribute('type', 'button');
    expect(printReceiptButton).toHaveAttribute('type', 'submit');
  });
});
