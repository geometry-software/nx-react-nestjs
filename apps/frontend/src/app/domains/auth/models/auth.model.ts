export type AuthTokenResponse = { accessToken: string };
export type LoginInput = { email: string; password: string };
export type RegisterInput = LoginInput & { name: string };
