import { getDataService } from '@/app/services/data.service';
import { authApi } from '@/app/api/auth.api';
import type {
  AuthTokenResponse,
  LoginInput,
  RegisterInput,
} from '../models/auth.model';

const { apiService } = getDataService();

export const authService = apiService.api.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<AuthTokenResponse, LoginInput>({
      query: (body) => apiService.post(authApi.login, body),
    }),
    register: builder.mutation<AuthTokenResponse, RegisterInput>({
      query: (body) => apiService.post(authApi.register, body),
    }),
  }),
});

export const { useLoginMutation, useRegisterMutation } = authService;

export function useAuthService() {
  const [loginMutation, loginState] = useLoginMutation();
  const [registerMutation, registerState] = useRegisterMutation();

  return {
    login: (body: LoginInput) => loginMutation(body).unwrap(),
    register: (body: RegisterInput) => registerMutation(body).unwrap(),
    isLoggingIn: loginState.isLoading,
    isRegistering: registerState.isLoading,
  };
}
