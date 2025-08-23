"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { Spin } from "antd";
import { Delivery } from "@/shared/models/delivery";

// Dynamically import the KitchenMap component with no SSR
const KitchenMapNoSSR = dynamic(
  () => import("./KitchenMap"),
  { 
    ssr: false,
    loading: () => (
      <div className="flex justify-center items-center h-[400px]">
        <Spin tip="Loading map..." />
      </div>
    )
  }
);

interface ClientSideKitchenMapProps {
  orderData: Delivery | undefined;
  isLoading: boolean;
}

const ClientSideKitchenMap = ({ orderData, isLoading }: ClientSideKitchenMapProps) => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div className="flex justify-center items-center h-[400px]">
        <Spin tip="Initializing map..." />
      </div>
    );
  }

  return <KitchenMapNoSSR orderData={orderData} isLoading={isLoading} />;
};

export default ClientSideKitchenMap;
