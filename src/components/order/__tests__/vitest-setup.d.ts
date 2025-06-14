
import '@testing-library/jest-dom';

declare global {
  namespace Vi {
    interface JestAssertion<T = any> {
      toBeInTheDocument(): T;
      toBeChecked(): T;
      toBeDisabled(): T;
      toHaveClass(className: string): T;
      toHaveAttribute(attribute: string, value?: string): T;
      toHaveTextContent(text: string): T;
    }
  }
}
