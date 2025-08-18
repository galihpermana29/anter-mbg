export interface ILoginResponse {
  data: Data;
  status: string;
}

export interface Data {
  access_token: string;
  kitchen_id: string;
  user_id: string;
  role: string;
}
