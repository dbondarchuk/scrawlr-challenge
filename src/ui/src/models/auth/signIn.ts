export interface SignInRequest {
  username: string;
  password: string;
}

export interface SignInResponse {
  api_token: string;
}
