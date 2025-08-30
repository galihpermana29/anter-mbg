import { IResponsePesananStatistik } from "@/shared/models/pesanan";
import { IStatsSekolah } from "@/shared/models/sekolah";
import { fetchAPI } from "@/shared/repository/api";
import { useQuery } from "@tanstack/react-query";

export const useSekolahStatistik = () => {
  const { data, isFetching, isError, error, refetch } = useQuery({
    queryKey: [
      {
        key: "stats-sekolah",
      },
    ],
    queryFn: async ({ signal }) => {
      const response = await fetchAPI<IStatsSekolah>(`/v1/schools/stats`, {
        signal,
      });

      return response;
    },
  });

  return {
    data,
    isLoading: isFetching,
    isError,
    error,
    refetch,
  };
};

export const usePesananStatistik = () => {
  const { data, isFetching, isError, error, refetch } = useQuery({
    queryKey: [
      {
        key: "stats-pesanan",
      },
    ],
    queryFn: async ({ signal }) => {
      const response = await fetchAPI<IResponsePesananStatistik>(
        `/v1/orders/stats`,
        {
          signal,
        }
      );

      return response;
    },
  });

  return {
    data,
    isLoading: isFetching,
    isError,
    error,
    refetch,
  };
};
