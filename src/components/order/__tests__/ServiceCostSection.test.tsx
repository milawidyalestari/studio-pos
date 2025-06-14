
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ServiceCostSection from '../ServiceCostSection';

describe('ServiceCostSection', () => {
  const mockFormData = {
    notes: 'Test order notes',
    jasaDesain: '50000',
    biayaLain: '25000',
    admin: 'Admin User',
    desainer: 'Designer User',
    komputer: 'Computer 1'
  };

  const mockOnFormDataChange = vi.fn();
  const totalPrice = 100000;

  beforeEach(() => {
    mockOnFormDataChange.mockClear();
  });

  it('renders all form fields with correct values', () => {
    render(
      <ServiceCostSection
        formData={mockFormData}
        totalPrice={totalPrice}
        onFormDataChange={mockOnFormDataChange}
      />
    );

    expect(screen.getByDisplayValue('Test order notes')).toBeInTheDocument();
    expect(screen.getByDisplayValue('50000')).toBeInTheDocument();
    expect(screen.getByDisplayValue('25000')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Admin User')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Designer User')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Computer 1')).toBeInTheDocument();
  });

  it('displays formatted total price in readonly sub total field', () => {
    render(
      <ServiceCostSection
        formData={mockFormData}
        totalPrice={totalPrice}
        onFormDataChange={mockOnFormDataChange}
      />
    );

    // Check if formatted currency is displayed in the sub total field
    const subTotalInput = screen.getByLabelText(/sub total/i);
    expect(subTotalInput).toHaveAttribute('readonly');
  });

  it('calls onFormDataChange when notes field changes', () => {
    render(
      <ServiceCostSection
        formData={mockFormData}
        totalPrice={totalPrice}
        onFormDataChange={mockOnFormDataChange}
      />
    );

    const notesTextarea = screen.getByDisplayValue('Test order notes');
    fireEvent.change(notesTextarea, { target: { value: 'Updated notes' } });

    expect(mockOnFormDataChange).toHaveBeenCalledWith('notes', 'Updated notes');
  });

  it('calls onFormDataChange when design service field changes', () => {
    render(
      <ServiceCostSection
        formData={mockFormData}
        totalPrice={totalPrice}
        onFormDataChange={mockOnFormDataChange}
      />
    );

    const jasaDesainInput = screen.getByDisplayValue('50000');
    fireEvent.change(jasaDesainInput, { target: { value: '75000' } });

    expect(mockOnFormDataChange).toHaveBeenCalledWith('jasaDesain', '75000');
  });

  it('calls onFormDataChange when other costs field changes', () => {
    render(
      <ServiceCostSection
        formData={mockFormData}
        totalPrice={totalPrice}
        onFormDataChange={mockOnFormDataChange}
      />
    );

    const biayaLainInput = screen.getByDisplayValue('25000');
    fireEvent.change(biayaLainInput, { target: { value: '30000' } });

    expect(mockOnFormDataChange).toHaveBeenCalledWith('biayaLain', '30000');
  });

  it('calls onFormDataChange when admin field changes', () => {
    render(
      <ServiceCostSection
        formData={mockFormData}
        totalPrice={totalPrice}
        onFormDataChange={mockOnFormDataChange}
      />
    );

    const adminInput = screen.getByDisplayValue('Admin User');
    fireEvent.change(adminInput, { target: { value: 'New Admin' } });

    expect(mockOnFormDataChange).toHaveBeenCalledWith('admin', 'New Admin');
  });

  it('has correct form field labels', () => {
    render(
      <ServiceCostSection
        formData={mockFormData}
        totalPrice={totalPrice}
        onFormDataChange={mockOnFormDataChange}
      />
    );

    expect(screen.getByLabelText(/notes/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/design service/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/other costs/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/admin/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/designer/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/computer/i)).toBeInTheDocument();
  });
});
