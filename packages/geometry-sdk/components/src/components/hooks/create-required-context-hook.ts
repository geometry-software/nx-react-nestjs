import { type Context, useContext } from 'react';

export function createRequiredContextHook<TValue>(
  context: Context<TValue | null>,
  errorMessage: string,
) {
  return function useRequiredContext(): TValue {
    const value = useContext(context);
    if (value === null) throw new Error(errorMessage);
    return value;
  };
}
