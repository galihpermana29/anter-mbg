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

export interface IResponseLogSekolah {
  data: LogSekolah[];
  status: string;
  meta: Meta;
}

export interface LogSekolah {
  id: string;
  order_id: string;
  school_id: string;
  school_name: string;
  date: string;
  image_url: string;
  rating: number;
  notes: string;
}

export interface IStatsSekolah {
  data: IStatsSekolahData;
  status: string;
}

export interface IStatsSekolahData {
  total_school_all: number;
  total_school_tk: number;
  total_school_sd: number;
  total_school_smp: number;
  total_school_sma: number;
}
