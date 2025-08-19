import { fetchAPI } from "@/shared/repository/api";
import { getSessionClient } from "@/shared/session/get-session-client";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export interface OrderItem {
  school_id: string;
  portion: number;
  deliver_before: string;
  notes: string;
}

export interface OrderDetail {
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
}

export interface OrderDetailResponse {
  data: OrderDetail;
  status: string;
}

export function useCreatePesanan() {
  const router = useRouter();
  
  return useMutation({
    mutationFn: async (data: OrderItem[]) => {
      return await fetchAPI("/v1/orders", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      toast.success("Pesanan berhasil dibuat");
      router.push("/school/pesanan");
    },
    onError: (error: any) => {
      toast.error(error?.message || "Gagal membuat pesanan");
    },
  });
}

export function useEditPesanan(id: string | null) {
  const router = useRouter();
  
  return useMutation({
    mutationFn: async (data: OrderItem) => {
      return await fetchAPI(`/v1/orders/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      toast.success("Pesanan berhasil diperbarui");
      router.push("/school/pesanan");
    },
    onError: (error: any) => {
      toast.error(error?.message || "Gagal memperbarui pesanan");
    },
  });
}

export function useGetOrderDetail(id: string | null) {
  return useQuery({
    queryKey: [{ key: "orderDetail", id }],
    queryFn: async () => {
      return await fetchAPI<OrderDetailResponse>(`/v1/orders/${id}`);
    },
    enabled: !!id,
  });
}
