import { validate } from 'class-validator';
import { UpdateUserDto } from './user.dto';

describe('UpdateUserDto', () => {
  it('rejects an unsupported role', async () => {
    const dto = Object.assign(new UpdateUserDto(), { role: 'root' });
    expect(await validate(dto)).toHaveLength(1);
  });
});

