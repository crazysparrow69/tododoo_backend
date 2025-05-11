export interface AuthResponse {
  token: string;
  isEmailVerified?: boolean;
  email?: string;
}
