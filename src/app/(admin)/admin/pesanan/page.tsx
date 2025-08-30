"use client";

import { Button, Input, Modal, Select, Table } from "antd";
import { useListPesanan } from "./repository/usePesanan";
import TableStatusBadge from "@/shared/components/TableStatusBadge";
import ErrorBoundary from "@/shared/components/ErrorBoundary";
import { setUrlParams } from "@/shared/usecase/url-params";
import { orderStatusDropdown } from "@/shared/models/dropdown";
import { Pesanan } from "@/shared/models/pesanan";
import { useState } from "react";
import Image from "next/image";
import PesananIcon from "@/shared/components/icons/PesananIcon";

const PesananPage = () => {
  const { data, isLoading, refetch, error } = useListPesanan();
  const [statusAction, setStatusAction] = useState<{
    status: string;
    title: string;
    icon: React.ReactNode;
  } | null>(null);

  const [selectedOrder, setSelectedOrder] = useState<Pesanan | null>(null);

  // Handle modal cancel
  const handleCancel = () => {
    setIsModalOpen(false);
    setSelectedOrder(null);
    setStatusAction(null);
  };

  const handleOpenOrderDetail = (order: Pesanan) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const [isModalOpen, setIsModalOpen] = useState(false);
  const column = [
    {
      title: "ID",
      dataIndex: "id",
    },
    {
      title: "Sekolah",
      dataIndex: "school_name",
    },
    {
      title: "Waktu Antar",
      dataIndex: "deliver_before",
    },
    {
      title: "Diterima",
      dataIndex: "picked_up_time",
    },
    {
      title: "Driver Antar",
      dataIndex: "driver_name",
    },
    {
      title: "Driver Pickup",
      dataIndex: "driver_name",
    },
    {
      title: "Status",
      dataIndex: "status",
      render: (text: string) => <TableStatusBadge status={text} />,
    },
    {
      title: "Detail",
      render: (_: any, record: Pesanan) => {
        return (
          <Button type="primary" onClick={() => handleOpenOrderDetail(record)}>
            Detail
          </Button>
        );
      },
    },
  ];

  return (
    <div>
      <div className="flex items-center gap-[8px] mb-[12px]">
        <PesananIcon isActive={true} />
        <h1 className="text-[24px] font-[500]">Pesanan</h1>
      </div>
      <ErrorBoundary error={error}>
        <div className="">
          <div className="flex gap-[8px] md:flex-row flex-col mb-[24px]">
            <Input
              allowClear
              onClear={() => {
                setUrlParams({ page: 1 });
                refetch();
              }}
              onPressEnter={() => {
                refetch();
              }}
              placeholder="Cari pesanan"
              className="max-w-[400px]"
              onChange={(e) =>
                setUrlParams({ search: e.target.value, page: 1 })
              }
            />
            <Select
              allowClear
              onClear={() => {
                setUrlParams({ page: 1 });
                refetch();
              }}
              options={orderStatusDropdown}
              placeholder="Pilih Status"
              onChange={(value: string) => {
                setUrlParams({ status: value, page: 1 });
                refetch();
              }}
            />
          </div>
          <Table
            columns={column}
            dataSource={data?.data}
            loading={isLoading}
            pagination={{
              pageSize: 10,
              total: data?.meta.totalData,
              onChange: (page) => {
                setUrlParams({ page });
                refetch();
              },
            }}
            scroll={{ x: "max-content" }}
          />

          <Modal
            title={statusAction?.title || "Update Status"}
            open={isModalOpen}
            onCancel={handleCancel}
            footer={null}
          >
            <div>
              <h1 className="text-[16px] font-[500]">Bukti</h1>
              {selectedOrder?.proof_image_url ? (
                <Image
                  src={selectedOrder?.proof_image_url || ""}
                  alt="proof_url"
                  width={500}
                  height={500}
                />
              ) : (
                "No Image"
              )}

              <h1 className="mt-[15px] text-[16px] font-[500]">Notes</h1>
              <p>{selectedOrder?.notes}</p>
            </div>
          </Modal>
        </div>
      </ErrorBoundary>
    </div>
  );
};

export default PesananPage;
