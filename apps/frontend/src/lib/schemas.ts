import { z } from 'zod';
export const productSchema = z.object({
  name: z.string().trim().min(2, 'Must be at least 2 characters'),
  price: z.coerce.number().min(0, 'Price cannot be negative'),
  quantity: z.coerce.number().int().min(0, 'Quantity cannot be negative'),
  description: z.string().optional(),
  active: z.boolean().default(true),
});
export const userSchema = z.object({
  name: z.string().trim().min(2, 'Must be at least 2 characters'),
  email: z.email('Invalid email address'),
  role: z.enum(['admin', 'manager', 'viewer']),
  active: z.boolean().default(true),
});
export const loginSchema = z.object({
  email: z.email('Invalid email address'),
  password: z.string().min(8, 'Must be at least 8 characters'),
});
export const registerSchema = loginSchema.extend({
  name: z.string().trim().min(2, 'Must be at least 2 characters'),
});
export const shipmentSchema = z.object({
  createdByUserId: z.string().min(1, 'Select a user'),
  recipient: z.object({
    name: z.string().trim().min(2, 'Name must be at least 2 characters'),
    address: z.string().trim().min(3, 'Address must be at least 3 characters'),
    city: z.string().trim().min(2, 'City must be at least 2 characters'),
    country: z.string().trim().min(2, 'Country must be at least 2 characters'),
  }),
  invoiceIds: z.array(z.string().min(1)).min(1, 'Select at least one invoice'),
});
