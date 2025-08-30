"use client";

import {
  DatePicker,
  Input,
  Select,
  Table,
  Spin,
  Modal,
  Form,
  Button,
  Rate,
  Segmented,
} from "antd";
import { ColumnsType } from "antd/es/table";
import { Delivery } from "@/shared/models/delivery";
import ErrorBoundary from "@/shared/components/ErrorBoundary";
import { getUrlParams, setUrlParams } from "@/shared/usecase/url-params";
import TableStatusBadge from "@/shared/components/TableStatusBadge";
import { SearchOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { orderStatusDropdown } from "@/shared/models/dropdown";
import {
  useRequestPickupPlates,
  useSchoolDeliveries,
  useSchoolLiveDelivery,
} from "./repository/useSchoolDelivery";
import DeliveryCard from "@/app/(driver)/driver/aktivitas/components/DeliveryCard";
import DraggerUpload from "@/shared/components/Uploader";
import TextArea from "antd/es/input/TextArea";
import { useState, useMemo } from "react";
import { RequestPickupPlatesPayload } from "@/shared/models/pesanan";
import ClientSideSchoolMaps from "./component/ClientSideSchoolMaps";
import AktivitasIcon from "@/shared/components/icons/AktivitasIcon";
import TrackingIcon from "@/shared/components/icons/TrackingIcon";

export default function SchoolAktivitasPage() {
  const { data, isLoading, error, isSessionLoading, date } =
    useSchoolDeliveries();

  const {
    data: liveData,
    isLoading: liveLoading,
    error: liveError,
  } = useSchoolLiveDelivery();
  const activeOrderId = liveData?.data?.[0]?.order_id || "";

  const [form] = Form.useForm();

  const [selectedDelivery, setSelectedDelivery] = useState<Delivery | null>(
    null
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [statusAction, setStatusAction] = useState<{
    status: string;
    title: string;
    icon: React.ReactNode;
  } | null>(null);

  const requestPickupPlatesMutation = useRequestPickupPlates();

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

  const handleSubmitMutation = async (values: RequestPickupPlatesPayload) => {
    if (!statusAction || !selectedDelivery) return;

    requestPickupPlatesMutation.mutate({
      order_id: selectedDelivery.order_id,
      notes: values.notes,
      image_url: values.image_url,
      rating: values.rating,
    });

    // Close modal on submission
    setIsModalOpen(false);
  };
  // Handle modal cancel
  const handleCancel = () => {
    setIsModalOpen(false);
    setSelectedDelivery(null);
    setStatusAction(null);
  };

  return (
    <div>
      <div className="flex items-start lg:items-center justify-between mb-[24px] flex-col lg:flex-row">
        <div className="flex items-center gap-[8px]">
          <AktivitasIcon isActive={true} />
          <h1 className="text-[24px] font-[500]">Aktivitas</h1>
        </div>

        <Segmented
          defaultValue={"delivery"}
          options={[
            {
              label: "Pengantaran",
              value: "delivery",
            },
            {
              label: "Pengambilan",
              value: "pickup",
            },
          ]}
          onChange={(value) => {
            setUrlParams({ mode: value });
            setUrlParams({ page: "1" });
          }}
        />
      </div>
      <ErrorBoundary error={liveError}>
        <div className="flex flex-col lg:flex-row gap-[22px] min:h-[300px]  overflow-hidden">
          {liveData?.data && liveData?.data?.length > 0 && (
            <div className="w-full max-w-[300px] mb-[22px]  overflow-hidden h-full">
              <div className="flex items-center gap-[8px] mb-[12px]">
                <AktivitasIcon isActive={true} />
                <h1 className="text-[16px] font-[500]">
                  Aktivitas Berlangsung
                </h1>
              </div>
              {liveLoading ? (
                <Spin size="large" tip="Loading session data..." />
              ) : (
                <DeliveryCard
                  onStatusUpdate={() => {
                    setSelectedDelivery(liveData?.data[0] || null);
                    setStatusAction({
                      status: "",
                      title: "Request Ambil Piring",
                      icon: null,
                    });
                    setIsModalOpen(true);
                  }}
                  mode="SCHOOL"
                  delivery={liveData?.data[0] || null}
                />
              )}
            </div>
          )}

          {liveData && liveData?.data?.length > 0 && (
            <div className="w-full">
              <div className="flex items-center gap-[8px] mb-[12px]">
                <TrackingIcon isActive={true} />
                <h1 className="text-[16px] font-[500] ">Maps</h1>
              </div>
              {liveData?.data && liveData.data[0] && (
                <ClientSideSchoolMaps
                  orderId={activeOrderId}
                  schoolPosition={
                    liveData.data[0].school
                      ? ([
                          liveData.data[0].school.latitude,
                          liveData.data[0].school.longitude,
                        ] as [number, number])
                      : undefined
                  }
                />
              )}
            </div>
          )}
        </div>
      </ErrorBoundary>
      <ErrorBoundary error={error}>
        <div
          className={`${
            liveData && liveData?.data?.length > 0 ? "mt-[22px]" : ""
          }`}
        >
          <h1 className="text-[16px] font-[500] mb-[12px]">
            Aktivitas Yang Akan Datang
          </h1>
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

          <Modal
            title={statusAction?.title || "Update Status"}
            open={isModalOpen}
            onCancel={handleCancel}
            footer={null}
            maskClosable={!requestPickupPlatesMutation.isPending}
          >
            <Form form={form} onFinish={handleSubmitMutation} layout="vertical">
              <Form.Item
                name={"image_url"}
                label="Bukti"
                rules={[{ required: true, message: "Bukti wajib diisi" }]}
              >
                <DraggerUpload
                  formItemName="image_url"
                  form={form}
                  limit={1}
                  multiple={false}
                />
              </Form.Item>
              <Form.Item
                name="rating"
                label="Rating"
                rules={[{ required: true, message: "Rating wajib diisi" }]}
              >
                <Rate />
              </Form.Item>
              <Form.Item
                name="notes"
                label="Catatan"
                rules={[{ required: true, message: "Catatan wajib diisi" }]}
              >
                <TextArea
                  rows={4}
                  placeholder="Masukkan catatan"
                  disabled={requestPickupPlatesMutation.isPending}
                />
              </Form.Item>
              <div className="flex justify-end gap-2">
                <Button
                  onClick={handleCancel}
                  disabled={requestPickupPlatesMutation.isPending}
                >
                  Batal
                </Button>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={requestPickupPlatesMutation.isPending}
                >
                  Simpan
                </Button>
              </div>
            </Form>
          </Modal>
        </div>
      </ErrorBoundary>
    </div>
  );
}
