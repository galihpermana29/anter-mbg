"use client";

import { DatePicker, Input, Select, Table, Spin } from "antd";
import { ColumnsType } from "antd/es/table";
import { Delivery } from "@/shared/models/delivery";
import ErrorBoundary from "@/shared/components/ErrorBoundary";
import { getUrlParams, setUrlParams } from "@/shared/usecase/url-params";
import TableStatusBadge from "@/shared/components/TableStatusBadge";
import { SearchOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { orderStatusDropdown } from "@/shared/models/dropdown";
import { useSchoolDeliveries } from "./repository/useSchoolDelivery";

export default function SchoolAktivitasPage() {
  const { data, isLoading, error, isSessionLoading, date } =
    useSchoolDeliveries();

  const columns: ColumnsType<Delivery> = [
    {
      title: "Porsi",
      dataIndex: "portion",
      key: "portion",
      width: 100,
    },
    {
      title: "Antar Sebelum",
      dataIndex: "deliver_before",
      key: "deliver_before",
      width: 120,
    },
    {
      title: "Waktu Berangkat",
      dataIndex: "departe_time",
      key: "departe_time",
      width: 150,
      render: (time) => (time === "00:00" ? "-" : time),
    },
    {
      title: "Driver",
      key: "driver",
      width: 200,
      render: (_, record) => record.driver?.name || "-",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 120,
      render: (status) => <TableStatusBadge status={status} />,
    },
  ];

  // Handle search input
  const handleSearch = (value: string) => {
    setUrlParams({ search: value });
    setUrlParams({ page: "1" });
  };

  // Handle date change
  const handleDateChange = (date: any) => {
    if (date) {
      setUrlParams({ date: date.format("YYYY-MM-DD") });
    } else {
      setUrlParams({ date: "" });
    }
    setUrlParams({ page: "1" });
  };

  // Handle pagination
  const handlePaginationChange = (page: number) => {
    setUrlParams({ page: page.toString() });
  };

  // Handle status change
  const handleStatusChange = (value: string) => {
    setUrlParams({ status: value });
    setUrlParams({ page: "1" });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-[24px]">
        <h1 className="text-[24px] font-[500]">Pengantaran</h1>
      </div>
      <ErrorBoundary error={error}>
        <div className="">
          <div className="flex gap-[8px] md:flex-row flex-col mb-[24px]">
            <div className="md:w-[240px] w-full">
              <DatePicker
                className="w-full"
                placeholder="Pilih Tanggal"
                value={date ? dayjs(date as string) : null}
                onChange={handleDateChange}
                format="DD MMM YYYY"
              />
            </div>
            <div className="md:w-[240px] w-full">
              <Input
                placeholder="Cari..."
                onChange={(e) => handleSearch(e.target.value)}
                suffix={<SearchOutlined />}
                allowClear
              />
            </div>
            <div className="md:w-[240px] w-full">
              <Select
                className="w-full"
                placeholder="Filter Status"
                value={status && status !== "" ? (status as string) : null}
                onChange={handleStatusChange}
                options={orderStatusDropdown}
                allowClear
              />
            </div>
          </div>
          {isSessionLoading ? (
            <div className="flex justify-center items-center py-8">
              <Spin size="large" tip="Loading session data..." />
            </div>
          ) : (
            <Table
              columns={columns}
              dataSource={data?.data || []}
              rowKey="order_id"
              loading={isLoading}
              pagination={{
                pageSize: 20,
                total: data?.meta.totalData || 0,
                onChange: handlePaginationChange,
                showSizeChanger: false,
              }}
              scroll={{ x: 1000 }}
            />
          )}
        </div>
      </ErrorBoundary>
    </div>
  );
}
