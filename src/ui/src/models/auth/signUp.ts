export interface SignUpRequest {
  username: string;
  password: string;
  confirm_password: string;
}

export interface SignUpResponse {
  api_token: string;
}
