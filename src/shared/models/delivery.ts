export interface School {
  id: string;
  name: string;
  address: string;
}

export interface Driver {
  id: string;
  name: string;
}

export interface ProgressDelivered {
  current: number;
  total: number;
}

export interface Delivery {
  order_id: string;
  school: School;
  portion: number;
  deliver_before: string;
  departe_time: string;
  eta_label: string;
  driver?: Driver;
  status: string;
  eta_minutes: number;
  route_id: string;
  seq: number;
  progress_delivered: ProgressDelivered;
}

export interface DeliveryListResponse {
  data: Delivery[];
  status: string;
  meta: {
    page: number;
    limit: number;
    totalPage: number;
    totalData: number;
  };
}

export interface DriverOption {
  id: string;
  name: string;
}

export interface AssignDriverPayload {
  order_id: string;
  driver_id: string;
}

export interface DriverListResponse {
  data: Array<{
    id: string;
    fullname: string;
    username: string;
    role: string;
    email: string;
    kitchen_id: string;
    school_id: string;
    phone: string;
    is_active: boolean;
  }>;
  status: string;
  meta: {
    page: number;
    limit: number;
    totalPage: number;
    totalData: number;
  };
}
