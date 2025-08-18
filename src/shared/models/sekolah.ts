export interface IListSekolah {
  data: Sekolah[];
  status: string;
  meta: Meta;
}

export interface IDetailSekolah {
  data: Sekolah;
  status: string;
}

export interface Sekolah {
  id: string;
  kitchen_id: string;
  kitchen_name: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  contact_person: string;
  contact_email: string;
  contact_phone: string;
  notes: string;
  is_active: boolean;
}

export interface Meta {
  page: number;
  limit: number;
  totalPage: number;
  totalData: number;
}

export interface ICreateSekolahPayload {
  kitchen_id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  contact_person: string;
  contact_email: string;
  contact_phone: string;
  notes: string;
  is_active: boolean;
}
