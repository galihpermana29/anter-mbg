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

export interface IDetailUserByID {
  data: IDetailUser;
  status: string;
}

export interface IDetailUser {
  id: string;
  fullname: string;
  username: string;
  role: string;
  email: string;
  kitchen_id: string;
  school_id: string;
  phone: string;
  is_active: boolean;
}
