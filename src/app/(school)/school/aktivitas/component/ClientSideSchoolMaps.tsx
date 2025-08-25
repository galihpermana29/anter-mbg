"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

// Dynamically import the SchoolMaps component with SSR disabled
const SchoolMaps = dynamic(() => import("./SchoolMap"), {
  ssr: false,
  loading: () => (
    <div className="flex justify-center items-center h-[300px] bg-gray-50 rounded-lg">
      <p>Loading map...</p>
    </div>
  ),
});

interface ClientSideSchoolMapsProps {
  orderId: string;
  schoolPosition?: [number, number];
}

const ClientSideSchoolMaps = ({
  orderId,
  schoolPosition,
}: ClientSideSchoolMapsProps) => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div className="flex justify-center items-center h-[300px] bg-gray-50 rounded-lg">
        <p>Loading map...</p>
      </div>
    );
  }

  return <SchoolMaps orderId={orderId} schoolPosition={schoolPosition} />;
};

export default ClientSideSchoolMaps;
