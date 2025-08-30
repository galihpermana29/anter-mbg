import { Delivery } from "./delivery";

export interface IListPesanan {
  data: Pesanan[];
  status: string;
  meta: Meta;
}

export interface RequestPickupPlatesPayload {
  order_id: string;
  notes: string;
  image_url: string;
  rating: number;
}

export interface IDetailDelivery {
  data: Delivery;
  status: string;
  meta: Meta;
}

export interface Pesanan {
  id: string;
  kitchen_id: string;
  kitchen_name: string;
  school_id: string;
  school_name: string;
  school_address: string;
  driver_id: string;
  driver_name: string;
  portion: number;
  status: string;
  deliver_before: string;
  ordered_for: string;
  notes: string;
  departed_time: string;
  picked_up_time: string;
  delivery_address: string;
  delivered_time: string;
  create_time: string;
  proof_image_url: string;
}

export interface Meta {
  page: number;
  limit: number;
  totalPage: number;
  totalData: number;
}

export interface IResponsePesananStatistik {
  data: IPesananStatistikData;
  status: string;
}

export interface IPesananStatistikData {
  total_orders: number;
  total_portions: number;
  delivery: DeliveryStats;
  pickup: PickupStats;
}

export interface DeliveryStats {
  pending: Stats;
  ready_for_delivery: Stats;
  out_for_delivery: Stats;
  delivered: Stats;
}

export interface Stats {
  count: number;
  portions: number;
  percentage: number;
}

export interface PickupStats {
  ready_for_pickup: Stats;
  out_for_pickup: Stats;
  pickup_completed: Stats;
  cancelled: Stats;
}
