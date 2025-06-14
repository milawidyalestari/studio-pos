import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ItemFormSection from '../ItemFormSection';

describe('ItemFormSection', () => {
  const mockCurrentItem = {
    id: 'item-1',
    bahan: 'vinyl',
    item: 'Test Banner',
    ukuran: { panjang: '100', lebar: '50' },
    quantity: '2',
    finishing: 'laminating'
  };

  const mockUpdateCurrentItem = vi.fn();
  const mockResetCurrentItem = vi.fn();
  const mockOnSave = vi.fn();
  const mockOnAddItem = vi.fn();

  beforeEach(() => {
    mockUpdateCurrentItem.mockClear();
    mockResetCurrentItem.mockClear();
    mockOnSave.mockClear();
    mockOnAddItem.mockClear();
  });

  it('renders all form fields with correct values', () => {
    render(
      <ItemFormSection
        currentItem={mockCurrentItem}
        updateCurrentItem={mockUpdateCurrentItem}
        resetCurrentItem={mockResetCurrentItem}
        editingItemId={null}
        onSave={mockOnSave}
        onAddItem={mockOnAddItem}
        isSaving={false}
      />
    );

    expect(screen.getByDisplayValue('item-1')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Test Banner')).toBeInTheDocument();
    expect(screen.getByDisplayValue('100')).toBeInTheDocument();
    expect(screen.getByDisplayValue('50')).toBeInTheDocument();
    expect(screen.getByDisplayValue('2')).toBeInTheDocument();
  });

  it('calls updateCurrentItem when input values change', () => {
    render(
      <ItemFormSection
        currentItem={mockCurrentItem}
        updateCurrentItem={mockUpdateCurrentItem}
        resetCurrentItem={mockResetCurrentItem}
        editingItemId={null}
        onSave={mockOnSave}
        onAddItem={mockOnAddItem}
        isSaving={false}
      />
    );

    const itemInput = screen.getByDisplayValue('Test Banner');
    fireEvent.change(itemInput, { target: { value: 'New Banner' } });

    expect(mockUpdateCurrentItem).toHaveBeenCalledWith('item', 'New Banner');
  });

  it('calls updateCurrentItem with correct ukuran object when size changes', () => {
    render(
      <ItemFormSection
        currentItem={mockCurrentItem}
        updateCurrentItem={mockUpdateCurrentItem}
        resetCurrentItem={mockResetCurrentItem}
        editingItemId={null}
        onSave={mockOnSave}
        onAddItem={mockOnAddItem}
        isSaving={false}
      />
    );

    const lengthInput = screen.getByDisplayValue('100');
    fireEvent.change(lengthInput, { target: { value: '120' } });

    expect(mockUpdateCurrentItem).toHaveBeenCalledWith('ukuran', { panjang: '120', lebar: '50' });
  });

  it('shows Add Item button when not editing', () => {
    render(
      <ItemFormSection
        currentItem={mockCurrentItem}
        updateCurrentItem={mockUpdateCurrentItem}
        resetCurrentItem={mockResetCurrentItem}
        editingItemId={null}
        onSave={mockOnSave}
        onAddItem={mockOnAddItem}
        isSaving={false}
      />
    );

    expect(screen.getByText('Add Item')).toBeInTheDocument();
    expect(screen.queryByText('Update Item')).not.toBeInTheDocument();
  });

  it('shows Update Item button when editing', () => {
    render(
      <ItemFormSection
        currentItem={mockCurrentItem}
        updateCurrentItem={mockUpdateCurrentItem}
        resetCurrentItem={mockResetCurrentItem}
        editingItemId="item-1"
        onSave={mockOnSave}
        onAddItem={mockOnAddItem}
        isSaving={false}
      />
    );

    expect(screen.getByText('Update Item')).toBeInTheDocument();
    expect(screen.queryByText('Add Item')).not.toBeInTheDocument();
  });

  it('calls onAddItem when Add Item button is clicked', () => {
    render(
      <ItemFormSection
        currentItem={mockCurrentItem}
        updateCurrentItem={mockUpdateCurrentItem}
        resetCurrentItem={mockResetCurrentItem}
        editingItemId={null}
        onSave={mockOnSave}
        onAddItem={mockOnAddItem}
        isSaving={false}
      />
    );

    const addButton = screen.getByText('Add Item');
    fireEvent.click(addButton);

    expect(mockOnAddItem).toHaveBeenCalled();
  });

  it('calls resetCurrentItem when Reset button is clicked', () => {
    render(
      <ItemFormSection
        currentItem={mockCurrentItem}
        updateCurrentItem={mockUpdateCurrentItem}
        resetCurrentItem={mockResetCurrentItem}
        editingItemId={null}
        onSave={mockOnSave}
        onAddItem={mockOnAddItem}
        isSaving={false}
      />
    );

    const resetButton = screen.getByText('Reset');
    fireEvent.click(resetButton);

    expect(mockResetCurrentItem).toHaveBeenCalled();
  });
});
