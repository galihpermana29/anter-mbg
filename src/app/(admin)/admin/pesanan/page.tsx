"use client";

import { Input, Select, Table } from "antd";
import { useListPesanan } from "./repository/usePesanan";
import TableStatusBadge from "@/shared/components/TableStatusBadge";
import ErrorBoundary from "@/shared/components/ErrorBoundary";
import { setUrlParams } from "@/shared/usecase/url-params";
import { orderStatusDropdown } from "@/shared/models/dropdown";

const PesananPage = () => {
  const { data, isLoading, refetch, error } = useListPesanan();

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
  ];

  return (
    <div>
      <h1 className="text-[24px] font-[500] mb-[24px]">Pesanan</h1>
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
        </div>
      </ErrorBoundary>
    </div>
  );
};

export default PesananPage;
