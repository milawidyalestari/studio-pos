import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import PriceSummarySection from '../PriceSummarySection';

describe('PriceSummarySection', () => {
  const mockFormData = {
    discount: 10,
    ppn: 11
  };

  const mockOnFormDataChange = vi.fn();
  const totalPrice = 200000;

  beforeEach(() => {
    mockOnFormDataChange.mockClear();
  });

  it('renders total price prominently', () => {
    render(
      <PriceSummarySection
        formData={mockFormData}
        totalPrice={totalPrice}
        onFormDataChange={mockOnFormDataChange}
      />
    );

    expect(screen.getByText('TOTAL')).toBeInTheDocument();
    // Check if formatted currency is displayed
    expect(screen.getByText(/200,000/)).toBeInTheDocument();
  });

  it('renders discount and tax input fields with correct values', () => {
    render(
      <PriceSummarySection
        formData={mockFormData}
        totalPrice={totalPrice}
        onFormDataChange={mockOnFormDataChange}
      />
    );

    expect(screen.getByDisplayValue('10')).toBeInTheDocument(); // discount
    expect(screen.getByDisplayValue('11')).toBeInTheDocument(); // ppn
  });

  it('calls onFormDataChange when discount changes', () => {
    render(
      <PriceSummarySection
        formData={mockFormData}
        totalPrice={totalPrice}
        onFormDataChange={mockOnFormDataChange}
      />
    );

    const discountInput = screen.getByDisplayValue('10');
    fireEvent.change(discountInput, { target: { value: '15' } });

    expect(mockOnFormDataChange).toHaveBeenCalledWith('discount', 15);
  });

  it('calls onFormDataChange when tax percentage changes', () => {
    render(
      <PriceSummarySection
        formData={mockFormData}
        totalPrice={totalPrice}
        onFormDataChange={mockOnFormDataChange}
      />
    );

    const ppnInput = screen.getByDisplayValue('11');
    fireEvent.change(ppnInput, { target: { value: '12' } });

    expect(mockOnFormDataChange).toHaveBeenCalledWith('ppn', 12);
  });

  it('has percentage symbols for discount and tax fields', () => {
    render(
      <PriceSummarySection
        formData={mockFormData}
        totalPrice={totalPrice}
        onFormDataChange={mockOnFormDataChange}
      />
    );

    const percentageSymbols = screen.getAllByText('%');
    expect(percentageSymbols).toHaveLength(2);
  });

  it('has down payment and remaining fields', () => {
    render(
      <PriceSummarySection
        formData={mockFormData}
        totalPrice={totalPrice}
        onFormDataChange={mockOnFormDataChange}
      />
    );

    expect(screen.getByLabelText(/down payment/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/remaining/i)).toBeInTheDocument();
  });

  it('shows remaining amount as readonly with formatted currency', () => {
    render(
      <PriceSummarySection
        formData={mockFormData}
        totalPrice={totalPrice}
        onFormDataChange={mockOnFormDataChange}
      />
    );

    const remainingInput = screen.getByLabelText(/remaining/i);
    expect(remainingInput).toHaveAttribute('readonly');
  });

  it('has tax checkbox', () => {
    render(
      <PriceSummarySection
        formData={mockFormData}
        totalPrice={totalPrice}
        onFormDataChange={mockOnFormDataChange}
      />
    );

    expect(screen.getByRole('checkbox')).toBeInTheDocument();
    expect(screen.getByText('Tax')).toBeInTheDocument();
  });
});
