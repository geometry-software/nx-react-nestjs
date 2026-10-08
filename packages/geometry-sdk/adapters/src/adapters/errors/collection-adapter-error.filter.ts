import {
  BadRequestException,
  Catch,
  ConflictException,
  InternalServerErrorException,
  NotFoundException,
  type ArgumentsHost,
  type ExceptionFilter,
} from '@nestjs/common';
import {
  RepositoryConflictError,
  RepositoryError,
  RepositoryNotFoundError,
  RepositoryValidationError,
} from '../core/errors.js';

/** Maps collection errors to HTTP responses without wrapping each adapter call. */
@Catch(RepositoryError)
export class CollectionAdapterErrorFilter implements ExceptionFilter<RepositoryError> {
  /** Maps a repository error to an HTTP response. */
  public catch(error: RepositoryError, host: ArgumentsHost): void {
    const exception = error instanceof RepositoryNotFoundError
      ? new NotFoundException(error.message)
      : error instanceof RepositoryValidationError
        ? new BadRequestException(error.message)
        : error instanceof RepositoryConflictError
          ? new ConflictException(error.message)
          : new InternalServerErrorException();
    const response = host.switchToHttp().getResponse<{
      status(code: number): { json(body: string | object): void };
    }>();
    response.status(exception.getStatus()).json(exception.getResponse());
  }
}
