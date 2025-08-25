"use client";

import { Card, Button } from "antd";
import { Delivery } from "@/shared/models/delivery";
import TableStatusBadge from "@/shared/components/TableStatusBadge";
import { CarOutlined, CheckOutlined, InboxOutlined } from "@ant-design/icons";
import { formatDepartureTime } from "@/shared/utils/date-formatter";
import Link from "next/link";

interface DeliveryCardProps {
  delivery: Delivery | null;
  mode?: "SCHOOL" | "DRIVER" | "KITCHEN";
  onToggleExpand?: (orderId: string) => void;
  onStatusUpdate?: (
    delivery: Delivery,
    action: { status: string; title: string; icon: React.ReactNode }
  ) => void;
}

export default function DeliveryCard({
  delivery,
  mode = "DRIVER",
  onToggleExpand,
  onStatusUpdate,
}: DeliveryCardProps) {
  // Get action button based on status
  const getActionButton = () => {
    if (delivery?.status === "Siap Diantar" && mode === "DRIVER") {
      return (
        <Button
          type="primary"
          block
          onClick={(e) => {
            e.stopPropagation();
            onStatusUpdate?.(delivery, {
              status: "PICKED_UP",
              title: "Konfirmasi & Antar",
              icon: <CarOutlined />,
            });
          }}
        >
          Konfirmasi & Antar
        </Button>
      );
    }

    if (delivery?.status === "Menuju Sekolah" && mode === "DRIVER") {
      return (
        <Button
          type="primary"
          block
          onClick={(e) => {
            e.stopPropagation();
            onStatusUpdate?.(delivery, {
              status: "DELIVERED",
              title: "Tiba di Sekolah",
              icon: <CheckOutlined />,
            });
          }}
        >
          Tiba di Sekolah
        </Button>
      );
    }

    if (delivery?.status === "Piring Siap Diambil" && mode === "DRIVER") {
      return (
        <Button
          type="primary"
          block
          onClick={(e) => {
            e.stopPropagation();
            onStatusUpdate?.(delivery, {
              status: "PICKED_UP_PLATES",
              title: "Ambil Piring",
              icon: <InboxOutlined />,
            });
          }}
        >
          Konfirmasi Piring & Kembali
        </Button>
      );
    }

    if (delivery?.status === "Makanan Diterima" && mode === "SCHOOL") {
      return (
        <Button
          type="primary"
          block
          onClick={(e) => {
            e.stopPropagation();
            onStatusUpdate?.(delivery, {
              status: "REQUEST_PLATES",
              title: "Request Ambil Piring",
              icon: <InboxOutlined />,
            });
          }}
        >
          Request Ambil Piring
        </Button>
      );
    }
    return null;
  };

  return (
    <Card
      hoverable
      className="h-full w-full max-w-[300px]"
      onClick={() => onToggleExpand?.(delivery?.order_id || "")}
    >
      <div className="flex justify-between items-center mb-3">
        <TableStatusBadge status={delivery?.status || ""} />
        {mode === "KITCHEN" && (
          <Link
            href={`/admin/pesanan/live-track?id=${delivery?.order_id}`}
            className="!text-[#FF9314] text-[14px] hover:underline cursor-pointer"
          >
            Lacak Pesanan
          </Link>
        )}
      </div>

      <div className="text-sm">
        <h3 className="text-md font-bold mb-2">{delivery?.school.name}</h3>
        <p className="mb-1">
          <span className="font-medium">Porsi:</span> {delivery?.portion}
        </p>
        <p className="mb-1">
          <span className="font-medium">Waktu Berangkat:</span>{" "}
          {delivery?.departe_time === "00:00"
            ? "-"
            : formatDepartureTime(delivery?.departe_time || "")}
        </p>
        <p className="mb-1">
          <span className="font-medium">Antar Sebelum:</span>{" "}
          {delivery?.deliver_before}
        </p>
        {["SCHOOL", "KITCHEN"].includes(mode) ? (
          <p className="mb-1">
            <span className="font-medium">Nama Driver:</span>{" "}
            {delivery?.driver?.name}
          </p>
        ) : (
          <p className="mb-1">
            <span className="font-medium line-clamp-5">Alamat:</span>{" "}
            {delivery?.school.address}
          </p>
        )}

        {/* Action Button */}
        <div className="mt-3">
          {" "}
          {["DRIVER", "SCHOOL"].includes(mode) ? getActionButton() : null}
        </div>
      </div>
    </Card>
  );
}
