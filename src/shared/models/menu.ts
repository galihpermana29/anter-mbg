export interface IListMenu {
  data: Menu[];
  status: string;
  meta: Meta;
}

export interface IDetailMenu {
  data: Menu;
  status: string;
}

export interface Menu {
  id: string;
  kitchen_id: string;
  kitchen_name: string;
  name: string;
  image_url: string;
  category: string;
  date: string;
}

export interface Meta {
  page: number;
  limit: number;
  totalPage: number;
  totalData: number;
}

export interface ICreateMenuPayload {
  kitchen_id?: string;
  name: string;
  image_url: string;
  category: string;
}
