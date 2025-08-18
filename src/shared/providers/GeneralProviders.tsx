"use client";
import { ConfigProvider } from "antd";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});

const GeneralProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <ConfigProvider
      theme={{
        token: {
          // Seed Token
          colorPrimary: "#FF9314",
          borderRadius: 2,

          // Alias Token
          colorBgContainer: "#fff",
        },
        components: {
          Button: {
            colorPrimary: "#FF9314",
            defaultActiveBorderColor: "#FF9314",

            colorBorder: "#FF9314",
            textTextColor: "#FF9314",
            colorText: "#FF9314",

            fontWeight: "bold",
          },

          Table: {
            headerBg: "#FFF6EB",
            headerColor: "#FF9314",
          },
        },
      }}
    >
      <Toaster />
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </ConfigProvider>
  );
};

export default GeneralProviders;
