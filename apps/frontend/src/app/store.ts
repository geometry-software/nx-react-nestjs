import { configureStore } from '@reduxjs/toolkit';
import {
  authApi,
  invoicesApi,
  productsApi,
  shippingApi,
  usersApi,
} from '../services/api';
import { createRequestActivityMiddleware } from './request-activity';

const requestActivityMiddleware = createRequestActivityMiddleware([
  productsApi.reducerPath,
  usersApi.reducerPath,
  shippingApi.reducerPath,
  invoicesApi.reducerPath,
]);
export const store = configureStore({
  reducer: {
    [productsApi.reducerPath]: productsApi.reducer,
    [usersApi.reducerPath]: usersApi.reducer,
    [authApi.reducerPath]: authApi.reducer,
    [shippingApi.reducerPath]: shippingApi.reducer,
    [invoicesApi.reducerPath]: invoicesApi.reducer,
  },
  middleware: (g) =>
    g().concat(
      requestActivityMiddleware,
      productsApi.middleware,
      usersApi.middleware,
      shippingApi.middleware,
      invoicesApi.middleware,
      authApi.middleware,
    ),
});
