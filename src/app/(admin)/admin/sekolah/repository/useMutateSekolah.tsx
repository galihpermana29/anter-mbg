import {
  ICreateSekolahPayload,
  IDetailSekolah,
  IListSekolah,
} from "@/shared/models/sekolah";
import { fetchAPI } from "@/shared/repository/api";
import { getSessionString } from "@/shared/session/getter-session";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export function useCreateSekolah() {
  const router = useRouter();
  const { mutate, isPending, isError, error } = useMutation({
    mutationFn: async (data: ICreateSekolahPayload) => {
      const sessionString = await getSessionString();
      const session = JSON.parse(sessionString);
      const response = await fetchAPI<ICreateSekolahPayload>("/v1/schools", {
        method: "POST",
        body: JSON.stringify([
          {
            ...data,
            kitchen_id: session?.kitchen_id,
          },
        ]),
      });
      return response;
    },

    onSuccess: () => {
      toast.success("Sekolah berhasil ditambahkan");
      router.push("/admin/sekolah");
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

export function useGetDetailSekolah(schoolId: string | undefined | null) {
  const { data, isFetching, isError, error } = useQuery({
    queryKey: [
      {
        key: "sekolah",
        schoolId,
      },
    ],
    queryFn: async () => {
      const response = await fetchAPI<IDetailSekolah>(
        `/v1/schools/${schoolId}`
      );

      console.log(response);
      return response;
    },
    enabled: !!schoolId,
  });

  return {
    data,
    isFetching,
    isError,
    error,
  };
}

export function useEditSekolah(schoolId: string | undefined | null) {
  const router = useRouter();
  const { mutate, isPending, isError, error } = useMutation({
    mutationFn: async (data: ICreateSekolahPayload) => {
      const sessionString = await getSessionString();
      const session = JSON.parse(sessionString);
      const response = await fetchAPI<ICreateSekolahPayload>(
        `/v1/schools/${schoolId}`,
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
      toast.success("Sekolah berhasil diubah");
      router.push("/admin/sekolah");
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
