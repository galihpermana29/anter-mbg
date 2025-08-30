import { ILoginPayload } from "@/shared/models/login";
import { IDetailUserByID, ILoginResponse } from "@/shared/models/session";
import { fetchAPIWithoutToken } from "@/shared/repository/api";
import { setSession } from "@/shared/session/getter-session";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

export function useLogin() {
  const router = useRouter();
  const { mutate, isPending, isError, error } = useMutation({
    mutationFn: async (values: ILoginPayload) => {
      const response = await fetchAPIWithoutToken<ILoginResponse>(
        "/v1/users/login",
        {
          method: "POST",
          body: JSON.stringify(values),
        }
      );

      return response;
    },
    onSuccess: async (data) => {
      const loginData = data.data;

      try {
        const response = await fetchAPIWithoutToken<IDetailUserByID>(
          `/v1/users/${loginData.user_id}`,
          {
            method: "GET",
          },
          {
            "X-Source": "web",
            "X-User-Id": loginData.user_id,
            "X-Kitchen-Id": loginData.kitchen_id,
            Authorization: `Bearer ${loginData.access_token}`,
          }
        );
        await setSession(loginData, response.data);
        toast.success("Login berhasil");

        if (loginData.role === "KITCHEN") {
          router.push("/admin/statistik");
        }

        if (loginData.role === "SCHOOL") {
          router.push("/school/aktivitas");
        }

        if (loginData.role === "DRIVER") {
          router.push("/driver/aktivitas");
        }
      } catch (error) {
        throw error;
      }
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
