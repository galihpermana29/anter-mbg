"use client";

import React from "react";
import { useListPesanan } from "./repository/usePesanan";
import { Input, Select, Table, Typography } from "antd";
import { Pesanan } from "@/shared/models/pesanan";
import { ColumnsType } from "antd/es/table";
import ErrorBoundary from "@/shared/components/ErrorBoundary";
import { orderStatusDropdown } from "@/shared/models/dropdown";
import TableStatusBadge from "@/shared/components/TableStatusBadge";
import { setUrlParams } from "@/shared/usecase/url-params";
import { Button } from "antd";
import { useRouter } from "next/navigation";
import PesananIcon from "@/shared/components/icons/PesananIcon";

export default function PesananPage() {
  const { data, isLoading, refetch, error } = useListPesanan();
  const router = useRouter();

  const columns: ColumnsType<Pesanan> = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
    },
    {
      title: "Kitchen",
      dataIndex: "kitchen_name",
      key: "kitchen_name",
    },
    {
      title: "Portion",
      dataIndex: "portion",
      key: "portion",
      width: 100,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 150,
      render: (text: string) => <TableStatusBadge status={text} />,
    },
    {
      title: "Deliver Before",
      dataIndex: "deliver_before",
      key: "deliver_before",
      width: 180,
    },
    {
      title: "Ordered For",
      dataIndex: "ordered_for",
      key: "ordered_for",
      width: 180,
    },
    {
      title: "Notes",
      dataIndex: "notes",
      key: "notes",
      width: 180,
    },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-[24px]">
        <div className="flex items-center gap-[8px]">
          <PesananIcon isActive={true} />
          <h1 className="text-[24px] font-[500]">Pesanan</h1>
        </div>
        <Button
          type="primary"
          onClick={() => router.push("/school/pesanan/tambah")}
        >
          Tambah Pesanan
        </Button>
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
              className="w-[200px]"
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
            columns={columns}
            dataSource={data?.data}
            loading={isLoading}
            pagination={{
              pageSize: 10,
              total: data?.meta?.totalData,
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
}
