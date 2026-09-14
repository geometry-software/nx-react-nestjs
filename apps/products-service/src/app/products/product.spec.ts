import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CrudListQueryDto } from '@nx-react-nestjs/backend-utils';

describe('Product ListQueryDto', () => {
  it('transforms URL pagination values to numbers', async () => {
    const dto = plainToInstance(CrudListQueryDto, { page: '2', limit: '20' });
    expect(await validate(dto)).toHaveLength(0);
    expect(dto).toMatchObject({ page: 2, limit: 20 });
  });
});
