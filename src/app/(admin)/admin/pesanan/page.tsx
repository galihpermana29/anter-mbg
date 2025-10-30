"use client";

import { Button, Input, Modal, Select, Table, message } from "antd";
import { useListPesanan, useExportPesanan } from "./repository/usePesanan";
import TableStatusBadge from "@/shared/components/TableStatusBadge";
import ErrorBoundary from "@/shared/components/ErrorBoundary";
import { setUrlParams } from "@/shared/usecase/url-params";
import { orderStatusDropdown } from "@/shared/models/dropdown";
import { Pesanan } from "@/shared/models/pesanan";
import { useState } from "react";
import Image from "next/image";
import PesananIcon from "@/shared/components/icons/PesananIcon";
import * as XLSX from "xlsx";
import { formatDepartureTime, formatTime, formatTimeOnly } from "@/shared/utils/date-formatter";

const PesananPage = () => {
  const { data, isLoading, refetch, error } = useListPesanan();
  const { data: exportData, isLoading: isExporting, refetch: refetchExport } = useExportPesanan();
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

  // XLSX Export functionality
  const handleExportXLSX = async () => {
    try {
      await refetchExport();

      if (exportData?.data) {
        // Format data for XLSX export based on table columns
        const xlsxData = exportData.data.map((item: Pesanan) => ({
          'ID': item.id,
          'Sekolah': item.school_name,
          'Waktu Antar': item.deliver_before,
          'Diterima': item.picked_up_time,
          'Driver Antar': item.driver_name,
          'Driver Pickup': item.driver_name,
          'Status': item.status,
        }));

        // Create workbook and worksheet
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(xlsxData);

        // Add worksheet to workbook
        XLSX.utils.book_append_sheet(wb, ws, 'Pesanan');

        // Generate filename with current date
        const filename = `pesanan-export-${new Date().toISOString().split('T')[0]}.xlsx`;

        // Save file
        XLSX.writeFile(wb, filename);

        message.success('Data exported successfully!');
      }
    } catch (error) {
      message.error('Failed to export data');
    }
  };
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
      // render: (time: string) => (time === "00:00" ? "-" : formatDepartureTime(time || "")),
    },
    {
      title: "Diterima",
      dataIndex: "delivered_time",
      render: (time: string) => (time === "00:00" ? "-" : formatTimeOnly(time || "")),
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
      fixed: "right",
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
          <div className="flex items-center gap-[8px] mb-[24px]">
            <div className="flex gap-[8px] md:flex-row flex-col w-full">
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
            <Button
              type="primary"
              className=""
              onClick={handleExportXLSX}
              loading={isExporting}
            >
              Export to Excel
            </Button>
          </div>
          <Table
            columns={column as any}
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
