import { RepositoryValidationError } from '../core/errors.js';

export function assertAdapterProvider(
  provider: string,
  expected: string,
): void {
  if (provider !== expected) {
    throw new RepositoryValidationError(
      `Invalid adapter configuration: expected "${expected}", received "${provider}"`,
    );
  }
}
