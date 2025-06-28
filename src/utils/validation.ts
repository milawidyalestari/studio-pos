export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePhone = (phone: string): boolean => {
  const phoneRegex = /^(\+62|62|0)[0-9]{9,13}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
};

export const validateRequired = (value: string): boolean => {
  return value.trim().length > 0;
};

export const validateNumber = (value: string): boolean => {
  return !isNaN(Number(value)) && Number(value) >= 0;
};

export const validatePositiveNumber = (value: string): boolean => {
  return !isNaN(Number(value)) && Number(value) > 0;
};

export const validateMinLength = (value: string, minLength: number): boolean => {
  return value.length >= minLength;
};

export const validateMaxLength = (value: string, maxLength: number): boolean => {
  return value.length <= maxLength;
};

export interface ValidationRule {
  validator: (value: string) => boolean;
  message: string;
}

export const createValidationRules = (rules: ValidationRule[]) => {
  return (value: string): string | null => {
    for (const rule of rules) {
      if (!rule.validator(value)) {
        return rule.message;
      }
    }
    return null;
  };
};