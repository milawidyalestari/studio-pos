
import '@testing-library/jest-dom';

// Mock Supabase client
export const mockSupabase = {
  from: jest.fn(() => ({
    select: jest.fn(() => ({
      order: jest.fn(() => Promise.resolve({ data: [], error: null }))
    })),
    insert: jest.fn(() => Promise.resolve({ data: null, error: null })),
    update: jest.fn(() => Promise.resolve({ data: null, error: null })),
    delete: jest.fn(() => Promise.resolve({ data: null, error: null }))
  }))
};

// Mock useToast hook
export const mockToast = jest.fn();

// Mock React Query
export const mockQueryClient = {
  invalidateQueries: jest.fn()
};
