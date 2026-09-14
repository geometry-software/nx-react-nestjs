import {
  loginSchema,
  productSchema,
  shipmentSchema,
  userSchema,
} from './schemas';

describe('form schemas', () => {
  it('coerces a valid product price', () => {
    expect(
      productSchema.parse({ name: 'Monitor', price: '199', active: true })
        .price,
    ).toBe(199);
  });

  it('rejects invalid user and login values', () => {
    expect(
      userSchema.safeParse({
        name: 'A',
        email: 'bad',
        role: 'root',
        active: true,
      }).success,
    ).toBe(false);
    expect(
      loginSchema.safeParse({ email: 'bad', password: 'short' }).success,
    ).toBe(false);
  });

  it('requires a recipient and at least one product for shipping', () => {
    expect(
      shipmentSchema.safeParse({
        recipient: {
          name: 'John Smith',
          address: '10 Main Street',
          city: 'Lisbon',
          country: 'Portugal',
        },
        items: [{ productId: 'product-1', quantity: '2' }],
      }).success,
    ).toBe(true);
    expect(
      shipmentSchema.safeParse({
        recipient: {},
        items: [],
      }).success,
    ).toBe(false);
  });
});
