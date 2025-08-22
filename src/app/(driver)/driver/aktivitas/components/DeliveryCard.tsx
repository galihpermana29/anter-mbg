"use client";

import { Card, Button } from "antd";
import { Delivery } from "@/shared/models/delivery";
import TableStatusBadge from "@/shared/components/TableStatusBadge";
import { CarOutlined, CheckOutlined, InboxOutlined } from "@ant-design/icons";
import { formatDepartureTime } from "@/shared/utils/date-formatter";

interface DeliveryCardProps {
  delivery: Delivery;
  expandedCardId: string | null;
  onToggleExpand: (orderId: string) => void;
  onStatusUpdate: (
    delivery: Delivery,
    action: { status: string; title: string; icon: React.ReactNode }
  ) => void;
}

export default function DeliveryCard({
  delivery,
  expandedCardId,
  onToggleExpand,
  onStatusUpdate,
}: DeliveryCardProps) {
  console.log(delivery, "delivry?");
  // Get action button based on status
  const getActionButton = () => {
    if (delivery.status === "Siap Diantar") {
      return (
        <Button
          type="primary"
          block
          onClick={(e) => {
            e.stopPropagation();
            onStatusUpdate(delivery, {
              status: "PICKED_UP",
              title: "Konfirmasi & Antar",
              icon: <CarOutlined />,
            });
          }}
        >
          Konfirmasi & Antar
        </Button>
      );
    } else if (delivery.status === "Menuju Sekolah") {
      return (
        <Button
          type="primary"
          block
          onClick={(e) => {
            e.stopPropagation();
            onStatusUpdate(delivery, {
              status: "DELIVERED",
              title: "Tiba di Sekolah",
              icon: <CheckOutlined />,
            });
          }}
        >
          Tiba di Sekolah
        </Button>
      );
    } else if (delivery.status === "Piring Siap Diambil") {
      return (
        <Button
          type="primary"
          block
          onClick={(e) => {
            e.stopPropagation();
            onStatusUpdate(delivery, {
              status: "PICKED_UP_PLATES",
              title: "Ambil Piring",
              icon: <InboxOutlined />,
            });
          }}
        >
          Ambil Piring
        </Button>
      );
    }
    return null;
  };

  return (
    <Card
      hoverable
      className="h-full"
      onClick={() => onToggleExpand(delivery.order_id)}
    >
      <div className="flex justify-between items-center mb-3">
        <TableStatusBadge status={delivery.status} />
      </div>

      <div className="text-sm">
        <h3 className="text-md font-bold mb-2">{delivery.school.name}</h3>
        <p className="mb-1">
          <span className="font-medium">Porsi:</span> {delivery.portion}
        </p>
        <p className="mb-1">
          <span className="font-medium">Antar Sebelum:</span>{" "}
          {delivery.deliver_before}
        </p>
        <p className="mb-1">
          <span className="font-medium">Alamat:</span> {delivery.school.address}
        </p>
        <p className="mb-1">
          <span className="font-medium">Waktu Berangkat:</span>{" "}
          {delivery.departe_time === "00:00" ? "-" : formatDepartureTime(delivery.departe_time)}
        </p>

        {/* Action Button */}
        <div className="mt-3">{getActionButton()}</div>
      </div>
    </Card>
  );
}
