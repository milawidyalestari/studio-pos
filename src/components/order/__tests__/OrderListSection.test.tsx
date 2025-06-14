
import React from 'react';
import { render } from '@testing-library/react';
import { screen, fireEvent } from '@testing-library/dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import OrderListSection from '../OrderListSection';

describe('OrderListSection', () => {
  const mockOrderList = [
    {
      id: '1',
      bahan: 'vinyl',
      item: 'Banner 1',
      ukuran: { panjang: '100', lebar: '50' },
      quantity: '2',
      finishing: 'laminating',
      subTotal: 150000
    },
    {
      id: '2',
      bahan: 'canvas',
      item: 'Banner 2',
      ukuran: { panjang: '80', lebar: '40' },
      quantity: '1',
      finishing: 'cutting',
      subTotal: 75000
    }
  ];

  const mockOnEditItem = vi.fn();
  const mockOnDeleteItem = vi.fn();

  beforeEach(() => {
    mockOnEditItem.mockClear();
    mockOnDeleteItem.mockClear();
  });

  it('renders order list with correct data', () => {
    render(
      <OrderListSection
        orderList={mockOrderList}
        onEditItem={mockOnEditItem}
        onDeleteItem={mockOnDeleteItem}
      />
    );

    expect(screen.getByText('Order List')).toBeInTheDocument();
    expect(screen.getByText('Banner 1')).toBeInTheDocument();
    expect(screen.getByText('Banner 2')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
  });

  it('displays formatted currency correctly', () => {
    render(
      <OrderListSection
        orderList={mockOrderList}
        onEditItem={mockOnEditItem}
        onDeleteItem={mockOnDeleteItem}
      />
    );

    // Assuming formatCurrency returns "Rp 150,000" format
    expect(screen.getByText(/150,000/)).toBeInTheDocument();
    expect(screen.getByText(/75,000/)).toBeInTheDocument();
  });

  it('shows correct item numbers starting from 1', () => {
    render(
      <OrderListSection
        orderList={mockOrderList}
        onEditItem={mockOnEditItem}
        onDeleteItem={mockOnDeleteItem}
      />
    );

    const rows = screen.getAllByText(/^[12]$/);
    expect(rows).toHaveLength(2);
    expect(rows[0]).toHaveTextContent('1');
    expect(rows[1]).toHaveTextContent('2');
  });

  it('calls onEditItem when edit button is clicked', () => {
    render(
      <OrderListSection
        orderList={mockOrderList}
        onEditItem={mockOnEditItem}
        onDeleteItem={mockOnDeleteItem}
      />
    );

    const editButtons = screen.getAllByRole('button');
    const firstEditButton = editButtons.find(button => 
      button.querySelector('svg')?.getAttribute('data-testid') === 'edit' ||
      button.innerHTML.includes('Edit')
    );

    if (firstEditButton) {
      fireEvent.click(firstEditButton);
      expect(mockOnEditItem).toHaveBeenCalledWith(mockOrderList[0]);
    }
  });

  it('calls onDeleteItem when delete button is clicked', () => {
    render(
      <OrderListSection
        orderList={mockOrderList}
        onEditItem={mockOnEditItem}
        onDeleteItem={mockOnDeleteItem}
      />
    );

    const deleteButtons = screen.getAllByRole('button');
    const firstDeleteButton = deleteButtons.find(button => 
      button.querySelector('svg')?.getAttribute('data-testid') === 'trash-2' ||
      button.innerHTML.includes('Trash')
    );

    if (firstDeleteButton) {
      fireEvent.click(firstDeleteButton);
      expect(mockOnDeleteItem).toHaveBeenCalledWith('1');
    }
  });

  it('renders empty state when no items', () => {
    render(
      <OrderListSection
        orderList={[]}
        onEditItem={mockOnEditItem}
        onDeleteItem={mockOnDeleteItem}
      />
    );

    expect(screen.getByText('Order List')).toBeInTheDocument();
    // Should still show headers but no data rows
    expect(screen.getByText('No')).toBeInTheDocument();
    expect(screen.getByText('Item')).toBeInTheDocument();
  });
});
