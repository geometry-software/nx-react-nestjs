import { createContext, useContext, type AriaAttributes } from 'react';

export const FieldValidationContext = createContext<{
  invalid: boolean;
  errorId?: string;
} | null>(null);

export function useFieldValidation(props: AriaAttributes) {
  const field = useContext(FieldValidationContext);
  return {
    'aria-invalid': field?.invalid || props['aria-invalid'],
    'aria-describedby': [props['aria-describedby'], field?.errorId]
      .filter(Boolean).join(' ') || undefined,
  };
}
