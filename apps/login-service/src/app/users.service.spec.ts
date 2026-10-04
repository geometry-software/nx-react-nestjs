import type { CrudListQueryDto } from 'geometry-sdk/adapters';
import { describe, expect, it, vi } from 'vitest';
import { UpdateUserDto } from './dto/user.dto';
import { UsersService } from './users.service';

describe('UsersService', () => {
  const repository = {
    findAll: vi.fn(),
    findOne: vi.fn(),
    update: vi.fn(),
    remove: vi.fn(),
    removeMany: vi.fn(),
  };
  const service = new UsersService(repository);

  it('delegates list queries to the user repository', async () => {
    const query = {
      page: 1,
      limit: 10,
      sort: 'role',
      order: 'desc',
    } as CrudListQueryDto;
    const result = {
      data: [],
      meta: { page: 1, limit: 10, total: 0, totalPages: 1 },
    };
    repository.findAll.mockResolvedValue(result);

    await expect(service.findAll(query)).resolves.toBe(result);
    expect(repository.findAll).toHaveBeenCalledWith(query);
  });

  it('delegates read, update, and delete operations', async () => {
    const updateDto = { role: 'manager' } as UpdateUserDto;
    const user = { id: 'user-1', role: 'admin' };
    repository.findOne.mockResolvedValue(user);
    repository.update.mockResolvedValue({ ...user, role: 'manager' });
    repository.remove.mockResolvedValue({ deleted: true });
    repository.removeMany.mockResolvedValue({ deleted: 2 });

    await expect(service.findOne('user-1')).resolves.toBe(user);
    await expect(service.update('user-1', updateDto)).resolves.toMatchObject({
      role: 'manager',
    });
    await expect(service.remove('user-1')).resolves.toEqual({ deleted: true });
    await expect(service.removeMany(['user-1', 'user-2'])).resolves.toEqual({
      deleted: 2,
    });
  });
});
