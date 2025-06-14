
import { expect, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom';

// extends Vitest's expect
expect.extend({});

afterEach(() => {
  cleanup();
});
