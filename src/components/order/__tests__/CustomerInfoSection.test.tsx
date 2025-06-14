
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import CustomerInfoSection from '../CustomerInfoSection';

// Mock the useCustomers hook
vi.mock('@/hooks/useCustomers', () => ({
  useCustomers: () => ({
    customers: [
      { id: '1', nama: 'John Doe', kode: 'CUST001' },
      { id: '2', nama: 'Jane Smith', kode: 'CUST002' }
    ],
    isLoading: false
  })
}));

// Mock the CustomerModal component
vi.mock('@/components/CustomerModal', () => ({
  default: ({ open, onClose }: { open: boolean; onClose: () => void }) => 
    open ? <div data-testid="customer-modal">Customer Modal</div> : null
}));

describe('CustomerInfoSection', () => {
  const mockFormData = {
    customer: 'John Doe',
    customerId: '1',
    outdoor: false,
    laserPrinting: true,
    mugNota: false,
    tanggal: '2024-06-14',
    waktu: '10:30',
    estimasi: '2024-06-17',
    estimasiWaktu: '14:00'
  };

  const mockOnFormDataChange = vi.fn();

  beforeEach(() => {
    mockOnFormDataChange.mockClear();
  });

  it('renders customer input field as writeable', () => {
    render(
      <CustomerInfoSection
        formData={mockFormData}
        onFormDataChange={mockOnFormDataChange}
      />
    );

    const customerInput = screen.getByDisplayValue('John Doe');
    expect(customerInput).toBeInTheDocument();
    expect(customerInput).not.toBeDisabled();
  });

  it('does not show customer ID in the form', () => {
    render(
      <CustomerInfoSection
        formData={mockFormData}
        onFormDataChange={mockOnFormDataChange}
      />
    );

    // Customer ID should not be visible anywhere in the form
    expect(screen.queryByDisplayValue('1')).not.toBeInTheDocument();
    expect(screen.queryByText('Customer ID')).not.toBeInTheDocument();
  });

  it('calls onFormDataChange when customer input changes', () => {
    render(
      <CustomerInfoSection
        formData={mockFormData}
        onFormDataChange={mockOnFormDataChange}
      />
    );

    const customerInput = screen.getByDisplayValue('John Doe');
    fireEvent.change(customerInput, { target: { value: 'Jane Smith' } });

    expect(mockOnFormDataChange).toHaveBeenCalledWith('customer', 'Jane Smith');
  });

  it('displays checkboxes with correct states', () => {
    render(
      <CustomerInfoSection
        formData={mockFormData}
        onFormDataChange={mockOnFormDataChange}
      />
    );

    const outdoorCheckbox = screen.getByRole('checkbox', { name: /outdoor\/indoor/i });
    const laserCheckbox = screen.getByRole('checkbox', { name: /laser printing/i });
    const mugCheckbox = screen.getByRole('checkbox', { name: /mug\/nota\/stemple/i });

    expect(outdoorCheckbox).not.toBeChecked();
    expect(laserCheckbox).toBeChecked();
    expect(mugCheckbox).not.toBeChecked();
  });

  it('calls onFormDataChange when checkbox is toggled', () => {
    render(
      <CustomerInfoSection
        formData={mockFormData}
        onFormDataChange={mockOnFormDataChange}
      />
    );

    const outdoorCheckbox = screen.getByRole('checkbox', { name: /outdoor\/indoor/i });
    fireEvent.click(outdoorCheckbox);

    expect(mockOnFormDataChange).toHaveBeenCalledWith('outdoor', true);
  });

  it('shows add customer button', () => {
    render(
      <CustomerInfoSection
        formData={mockFormData}
        onFormDataChange={mockOnFormDataChange}
      />
    );

    const addButton = screen.getByRole('button');
    expect(addButton).toBeInTheDocument();
  });
});
