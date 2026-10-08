export type AuthTokenResponse = { accessToken: string };
export type FirebaseSessionResponse = {
  uid: string;
  created: boolean;
};
export type LoginInput = { email: string; password: string };
export type RegisterInput = LoginInput & {
  name: string;
  role: 'viewer' | 'manager' | 'admin';
  language: string;
};
