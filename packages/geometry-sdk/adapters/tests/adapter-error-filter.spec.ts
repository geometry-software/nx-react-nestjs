import type { ArgumentsHost } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';
import { CollectionAdapterErrorFilter } from '../src/adapters/errors/collection-adapter-error.filter.js';
import {
  RepositoryConflictError,
  RepositoryNotFoundError,
  RepositoryOperationError,
  RepositoryValidationError,
} from '../src/adapters/core/errors.js';

describe('CollectionAdapterErrorFilter.catch', () => {
  it.each([
    { error: new RepositoryNotFoundError('Item', 'missing'), status: 404 },
    { error: new RepositoryValidationError('Invalid query'), status: 400 },
    { error: new RepositoryConflictError('Already exists'), status: 409 },
    { error: new RepositoryOperationError('read'), status: 500 },
  ])('maps $error.name to HTTP $status', ({ error, status }) => {
    const json = vi.fn();
    const response = { status: vi.fn(() => ({ json })) };
    const host = { switchToHttp: () => ({ getResponse: () => response }) } as unknown as ArgumentsHost;
    new CollectionAdapterErrorFilter().catch(error, host);
    expect(response.status).toHaveBeenCalledWith(status);
    expect(json).toHaveBeenCalledWith(expect.objectContaining({ statusCode: status }));
  });
});
