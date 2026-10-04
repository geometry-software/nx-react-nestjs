import { validate } from 'class-validator';
import { LoginDto } from './auth.dto';

describe('LoginDto', () => {
  it('rejects an invalid email and a short password', async () => {
    const dto = Object.assign(new LoginDto(), {
      email: 'invalid',
      password: 'short',
    });
    expect(await validate(dto)).toHaveLength(2);
  });
});

