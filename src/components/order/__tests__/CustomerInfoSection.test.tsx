
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import CustomerInfoSection from '../CustomerInfoSection';

describe('CustomerInfoSection', () => {
  const mockFormData = {
    customer: 'John Doe',
    outdoor: false,
    laserPrinting: true,
    mugNota: false,
    tanggal: '2024-06-14',
    waktu: '10:30',
    estimasi: '3',
    estimasiWaktu: '14:00'
  };

  const mockOnFormDataChange = vi.fn();

  beforeEach(() => {
    mockOnFormDataChange.mockClear();
  });

  it('renders all form fields correctly', () => {
    render(
      <CustomerInfoSection
        formData={mockFormData}
        onFormDataChange={mockOnFormDataChange}
      />
    );

    expect(screen.getByDisplayValue('John Doe')).toBeInTheDocument();
    expect(screen.getByDisplayValue('2024-06-14')).toBeInTheDocument();
    expect(screen.getByDisplayValue('10:30')).toBeInTheDocument();
    expect(screen.getByDisplayValue('3')).toBeInTheDocument();
    expect(screen.getByDisplayValue('14:00')).toBeInTheDocument();
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

  it('calls onFormDataChange when date input changes', () => {
    render(
      <CustomerInfoSection
        formData={mockFormData}
        onFormDataChange={mockOnFormDataChange}
      />
    );

    const dateInput = screen.getByDisplayValue('2024-06-14');
    fireEvent.change(dateInput, { target: { value: '2024-06-15' } });

    expect(mockOnFormDataChange).toHaveBeenCalledWith('tanggal', '2024-06-15');
  });
});
