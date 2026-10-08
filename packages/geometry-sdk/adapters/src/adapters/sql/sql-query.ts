import { RepositoryValidationError } from '../core/errors.js';

/** Restricts the raw read escape hatch shared by native SQL and TypeORM adapters. */
export function assertSqlReadQuery(expression: string): void {
  if (!/^\s*SELECT\s/i.test(expression) || expression.includes(';')) {
    throw new RepositoryValidationError('SQL query must be a single SELECT statement');
  }
}
