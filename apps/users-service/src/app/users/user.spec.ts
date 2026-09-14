import { validate } from 'class-validator';
import { CreateUserDto } from './dto/user.dto';

describe('CreateUserDto', () => {
  it('rejects an unsupported role', async () => {
    const dto = Object.assign(new CreateUserDto(), {
      name: 'Demo User',
      email: 'demo@example.com',
      role: 'root',
    });
    expect(await validate(dto)).toHaveLength(1);
  });
});
