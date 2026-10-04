import { ConflictException, UnauthorizedException } from '@nestjs/common';
import type { JwtService } from '@nestjs/jwt';
import type { MongoRepository } from 'typeorm';
import { describe, expect, it, vi } from 'vitest';
import type { Account } from './entities/session.entity';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  const repositoryMock = {
    findOneBy: vi.fn(),
    create: vi.fn(),
    save: vi.fn(),
  };
  const accounts = repositoryMock as unknown as MongoRepository<Account>;
  const jwt = { sign: vi.fn(() => 'signed-token') } as unknown as JwtService;
  const service = new AuthService(accounts, jwt);

  it('registers a new account with a normalized email and returns a token', async () => {
    repositoryMock.findOneBy.mockResolvedValue(null);
    repositoryMock.create.mockImplementation((value) => value as Account);
    repositoryMock.save.mockImplementation(async (value) => ({
      ...value,
      id: 'account-1',
    }));

    const result = await service.register({
      name: 'Alice',
      email: ' ALICE@example.com ',
      password: 'secret123',
    });

    expect(repositoryMock.findOneBy).toHaveBeenCalledWith({ email: 'alice@example.com' });
    expect(repositoryMock.create).toHaveBeenCalledWith(
      expect.objectContaining({
        email: 'alice@example.com',
        name: 'Alice',
        passwordHash: expect.any(String),
      }),
    );
    expect(result).toEqual({
      accessToken: 'signed-token',
      user: { id: 'account-1', email: 'alice@example.com', name: 'Alice' },
    });
    expect(jwt.sign).toHaveBeenCalledWith({
      sub: 'account-1',
      email: 'alice@example.com',
    });
  });

  it('rejects registration when the email is already used', async () => {
    vi.clearAllMocks();
    repositoryMock.findOneBy.mockResolvedValue({ id: 'existing' });

    await expect(
      service.register({ name: 'Alice', email: 'alice@example.com', password: 'secret123' }),
    ).rejects.toBeInstanceOf(ConflictException);
    expect(repositoryMock.create).not.toHaveBeenCalled();
  });

  it('rejects login with an unknown account or an invalid password', async () => {
    vi.clearAllMocks();
    repositoryMock.findOneBy.mockResolvedValue(null);
    await expect(
      service.login({ email: 'missing@example.com', password: 'secret123' }),
    ).rejects.toBeInstanceOf(UnauthorizedException);

    repositoryMock.findOneBy.mockResolvedValue({
      id: 'account-1',
      email: 'alice@example.com',
      passwordHash: 'not-a-valid-password-hash',
      name: 'Alice',
    });
    await expect(
      service.login({ email: ' ALICE@example.com ', password: 'wrongpass' }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
    expect(repositoryMock.findOneBy).toHaveBeenLastCalledWith({
      email: 'alice@example.com',
    });
  });
});

