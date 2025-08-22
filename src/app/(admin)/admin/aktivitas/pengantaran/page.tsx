"use client";

import { DatePicker, Input, Select, Table, Spin } from "antd";
import {
  useAssignDriver,
  useDriverOptions,
  useListDeliveries,
} from "./repository/useDelivery";
import { ColumnsType } from "antd/es/table";
import { Delivery } from "@/shared/models/delivery";
import ErrorBoundary from "@/shared/components/ErrorBoundary";
import { getUrlParams, setUrlParams } from "@/shared/usecase/url-params";
import TableStatusBadge from "@/shared/components/TableStatusBadge";
import { SearchOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { useState } from "react";
import { orderStatusDropdown } from "@/shared/models/dropdown";

export default function PengantaranPage() {
  const { data, isLoading, error, date } = useListDeliveries();
  const { data: driverOptions, isLoading: isLoadingDrivers } =
    useDriverOptions();
  const { mutate: assignDriver } = useAssignDriver();

  // Track which orders are currently being processed
  const [processingOrders, setProcessingOrders] = useState<
    Record<string, boolean>
  >({});

  const handleDriverAssignment = (orderId: string, driverId: string) => {
    // Mark this order as processing
    setProcessingOrders((prev) => ({ ...prev, [orderId]: true }));

    // Call the mutation
    assignDriver(
      { order_id: orderId, driver_id: driverId },
      {
        onSettled: () => {
          // Remove the processing state when done
          setProcessingOrders((prev) => ({ ...prev, [orderId]: false }));
        },
      }
    );
  };

  const columns: ColumnsType<Delivery> = [
    {
      title: "Sekolah",
      dataIndex: ["school", "name"],
      key: "school_name",
      width: 200,
    },
    {
      title: "Alamat",
      dataIndex: ["school", "address"],
      key: "school_address",
      width: 250,
    },
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
      render: (_, record) => {
        const isProcessing = processingOrders[record.order_id] || false;

        // If status is pending, show driver selection dropdown
        if (record.status === "Pending") {
          return (
            <div className="flex items-center">
              <Select
                placeholder="Pilih Driver"
                style={{ width: "100%" }}
                onChange={(value) =>
                  handleDriverAssignment(record.order_id, value)
                }
                loading={isLoadingDrivers || isProcessing}
                disabled={isProcessing}
                options={driverOptions?.map((driver) => ({
                  value: driver.id,
                  label: driver.name,
                }))}
              />
              {isProcessing && <Spin size="small" className="ml-2" />}
            </div>
          );
        }

        // Otherwise show driver name
        return record.driver?.name || "-";
      },
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 120,
      render: (status) => <TableStatusBadge status={status} />,
    },
    // {
    //   title: "Aksi",
    //   key: "action",
    //   width: 100,
    //   render: (_, record) => (
    //     <Button
    //       type="primary"
    //       size="small"
    //       onClick={() =>
    //         router.push(
    //           `/admin/aktivitas/pengantaran/detail?id=${record.order_id}`
    //         )
    //       }
    //     >
    //       Detail
    //     </Button>
    //   ),
    // },
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
                onChange={handleStatusChange}
                options={orderStatusDropdown}
                allowClear
              />
            </div>
          </div>
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
            scroll={{ x: 1200 }}
          />
        </div>
      </ErrorBoundary>
    </div>
  );
}
