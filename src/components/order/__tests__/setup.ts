
import React from 'react';
import { expect, afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';

// Extend Vitest's expect with jest-dom matchers
expect.extend(matchers);

// Cleanup after each test case
afterEach(() => {
  cleanup();
});

// Mock the formatCurrency function
vi.mock('@/services/masterData', () => ({
  formatCurrency: (amount: number) => `Rp ${amount.toLocaleString('id-ID')}`
}));

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
  Edit: () => React.createElement('svg', { 'data-testid': 'edit' }),
  Trash2: () => React.createElement('svg', { 'data-testid': 'trash-2' }),
  Plus: () => React.createElement('svg', { 'data-testid': 'plus' })
}));
