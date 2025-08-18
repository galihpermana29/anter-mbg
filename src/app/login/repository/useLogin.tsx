import { ILoginPayload } from "@/shared/models/login";
import { ILoginResponse } from "@/shared/models/session";
import { fetchAPIWithoutToken } from "@/shared/repository/api";
import { setSession } from "@/shared/session/getter-session";
import { useMutation } from "@tanstack/react-query";
import { message } from "antd";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

export function useLogin() {
  const router = useRouter();
  const { mutate, isPending, isError, error } = useMutation({
    mutationFn: async (values: ILoginPayload) => {
      message.loading("Loading...");
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
        await setSession(loginData);
        toast.success("Login berhasil");

        if (loginData.role === "KITCHEN") {
          router.push("/admin/pesanan");
        }

        if (loginData.role === "SCHOOL") {
          router.push("/school");
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
