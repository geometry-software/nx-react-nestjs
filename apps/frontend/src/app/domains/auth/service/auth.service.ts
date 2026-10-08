import { getDataService } from '@/app/services/data.service';
import { authApi } from '@/app/api/auth.api';
import { getFirebaseIdentity } from '@/app/services/firebase-auth.service';
import type {
  AuthTokenResponse,
  FirebaseSessionResponse,
  LoginInput,
  RegisterInput,
} from '../models/auth.model';

const { apiService } = getDataService();

export const authService = apiService.api.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<AuthTokenResponse, LoginInput>({
      query: (body) => apiService.post(authApi.login, body),
    }),
    register: builder.mutation<AuthTokenResponse, RegisterInput & { firebaseIdToken: string }>({
      query: (body) => apiService.post(authApi.register, body),
    }),
    prepareFirebaseSession: builder.mutation<FirebaseSessionResponse, string>({
      query: (idToken) => apiService.post(authApi.session, { idToken }),
    }),
    verifyEmail: builder.mutation<{ status: 'ok' }, string>({
      query: (token) => apiService.get(`${authApi.verifyEmail}?token=${encodeURIComponent(token)}`),
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  usePrepareFirebaseSessionMutation,
  useVerifyEmailMutation,
} = authService;

export function useAuthService() {
  const [loginMutation, loginState] = useLoginMutation();
  const [registerMutation, registerState] = useRegisterMutation();
  const [verifyEmailMutation] = useVerifyEmailMutation();

  return {
    login: (body: LoginInput) => loginMutation(body).unwrap(),
    register: async (body: RegisterInput) => {
      const { idToken } = await getFirebaseIdentity();
      return registerMutation({ ...body, firebaseIdToken: idToken }).unwrap();
    },
    verifyEmail: (token: string) => verifyEmailMutation(token).unwrap(),
    isLoggingIn: loginState.isLoading,
    isRegistering: registerState.isLoading,
  };
}
