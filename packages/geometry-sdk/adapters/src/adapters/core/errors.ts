import { RepositoryErrorCode, RepositoryErrorName } from '../errors/error-names.js';

export class RepositoryError extends Error {
  constructor(
    message: string,
    readonly code: RepositoryErrorCode = RepositoryErrorCode.Repository,
    name: RepositoryErrorName = RepositoryErrorName.Repository,
  ) {
    super(message);
    this.name = name;
  }
}

export class RepositoryNotFoundError extends RepositoryError {
  constructor(resource: string, id?: unknown) {
    super(
      `${resource} not found${id === undefined ? "" : `: ${String(id)}`}`,
      RepositoryErrorCode.NotFound,
      RepositoryErrorName.NotFound,
    );
  }
}

export class RepositoryValidationError extends RepositoryError {
  constructor(message: string) {
    super(message, RepositoryErrorCode.Validation, RepositoryErrorName.Validation);
  }
}

export class RepositoryConflictError extends RepositoryError {
  constructor(message: string) {
    super(message, RepositoryErrorCode.Conflict, RepositoryErrorName.Conflict);
  }
}

export class RepositoryConnectionError extends RepositoryError {
  constructor(message = "Repository connection failed") {
    super(message, RepositoryErrorCode.Connection, RepositoryErrorName.Connection);
  }
}

export class RepositoryOperationError extends RepositoryError {
  constructor(operation: string) {
    super(
      `Repository operation failed: ${operation}`,
      RepositoryErrorCode.Operation,
      RepositoryErrorName.Operation,
    );
  }
}
