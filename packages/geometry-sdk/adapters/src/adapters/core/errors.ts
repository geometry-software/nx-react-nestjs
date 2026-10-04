export class RepositoryError extends Error {
  constructor(
    message: string,
    readonly code = "REPOSITORY_ERROR",
    override readonly cause?: unknown,
  ) {
    super(message, { cause });
    this.name = new.target.name;
  }
}

export class RepositoryNotFoundError extends RepositoryError {
  constructor(resource: string, id?: unknown) {
    super(
      `${resource} not found${id === undefined ? "" : `: ${String(id)}`}`,
      "REPOSITORY_NOT_FOUND",
    );
  }
}

export class RepositoryValidationError extends RepositoryError {
  constructor(message: string, cause?: unknown) {
    super(message, "REPOSITORY_VALIDATION", cause);
  }
}

export class RepositoryConflictError extends RepositoryError {
  constructor(message: string, cause?: unknown) {
    super(message, "REPOSITORY_CONFLICT", cause);
  }
}

export class RepositoryConnectionError extends RepositoryError {
  constructor(message = "Repository connection failed", cause?: unknown) {
    super(message, "REPOSITORY_CONNECTION", cause);
  }
}

export class RepositoryOperationError extends RepositoryError {
  constructor(operation: string, cause?: unknown) {
    super(
      `Repository operation failed: ${operation}`,
      "REPOSITORY_OPERATION",
      cause,
    );
  }
}
