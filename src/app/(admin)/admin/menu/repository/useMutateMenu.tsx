import { ICreateMenuPayload, IDetailMenu } from "@/shared/models/menu";
import { fetchAPI } from "@/shared/repository/api";
import { getSessionString } from "@/shared/session/getter-session";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export function useCreateMenu() {
  const router = useRouter();
  const { mutate, isPending, isError, error } = useMutation({
    mutationFn: async (data: ICreateMenuPayload) => {
      const sessionString = await getSessionString();
      const session = JSON.parse(sessionString);
      const response = await fetchAPI<ICreateMenuPayload>("/v1/kitchens/menus", {
        method: "POST",
        body: JSON.stringify({
          ...data,
          kitchen_id: session?.kitchen_id,
        }),
      });
      return response;
    },

    onSuccess: () => {
      toast.success("Menu berhasil ditambahkan");
      router.push("/admin/menu");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  return {
    mutate,
    isPending,
    isError,
    error,
  };
}

export function useGetDetailMenu(menuId: string | undefined | null) {
  const { data, isFetching, isError, error } = useQuery({
    queryKey: [
      {
        key: "menu",
        menuId,
      },
    ],
    queryFn: async () => {
      const response = await fetchAPI<IDetailMenu>(
        `/v1/kitchens/menus/${menuId}`
      );
      return response;
    },
    enabled: !!menuId,
  });

  return {
    data,
    isFetching,
    isError,
    error,
  };
}

export function useEditMenu(menuId: string | undefined | null) {
  const router = useRouter();
  const { mutate, isPending, isError, error } = useMutation({
    mutationFn: async (data: ICreateMenuPayload) => {
      const sessionString = await getSessionString();
      const session = JSON.parse(sessionString);
      const response = await fetchAPI<ICreateMenuPayload>(
        `/v1/kitchens/menus/${menuId}`,
        {
          method: "PATCH",
          body: JSON.stringify({
            ...data,
            kitchen_id: session?.kitchen_id,
          }),
        }
      );
      return response;
    },

    onSuccess: () => {
      toast.success("Menu berhasil diubah");
      router.push("/admin/menu");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  return {
    mutate,
    isPending,
    isError,
    error,
  };
}
