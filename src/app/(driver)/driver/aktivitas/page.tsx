"use client";

import {
  DatePicker,
  Input,
  Select,
  Row,
  Col,
  Spin,
  Pagination,
  Modal,
  Form,
  Input as AntInput,
  Button,
  message,
  Segmented,
} from "antd";
import { Delivery } from "@/shared/models/delivery";
import ErrorBoundary from "@/shared/components/ErrorBoundary";
import { setUrlParams } from "@/shared/usecase/url-params";
import { SearchOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { orderStatusDropdown } from "@/shared/models/dropdown";
import { useDriverDeliveries } from "./repository/useDriverDelivery";
import { useState } from "react";
import DeliveryCard from "./components/DeliveryCard";
import toast from "react-hot-toast";
import dynamic from "next/dynamic";
import DraggerUpload from "@/shared/components/Uploader";
const DriverMaps = dynamic(() => import("./components/DriverMaps"), {
  ssr: false,
});

export default function DriverAktivitasPage() {
  const {
    data,
    isLoading,
    error,
    isSessionLoading,
    date,
    updateStatusMutation,
  } = useDriverDeliveries();
  const [expandedCardId, setExpandedCardId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDelivery, setSelectedDelivery] = useState<Delivery | null>(
    null
  );
  const [statusAction, setStatusAction] = useState<{
    status: string;
    title: string;
    icon: React.ReactNode;
  } | null>(null);
  const [form] = Form.useForm();

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

  // Toggle card expansion
  const toggleCardExpansion = (orderId: string) => {
    if (expandedCardId === orderId) {
      setExpandedCardId(null);
    } else {
      setExpandedCardId(orderId);
    }
  };

  // Handle status update button click
  const handleStatusButtonClick = (
    delivery: Delivery,
    action: { status: string; title: string; icon: React.ReactNode }
  ) => {
    setSelectedDelivery(delivery);
    setStatusAction(action);
    setIsModalOpen(true);
    form.resetFields();
  };

  // Handle modal cancel
  const handleCancel = () => {
    setIsModalOpen(false);
    setSelectedDelivery(null);
    setStatusAction(null);
  };

  // Handle form submission using mutation
  const handleSubmit = (values: { note: string; proof_image_url: string }) => {
    if (!selectedDelivery || !statusAction) return;

    updateStatusMutation.mutate({
      orderId: selectedDelivery.order_id,
      status: statusAction.status,
      note: values.note,
      proof_image_url: values.proof_image_url,
    });

    // Close modal on submission
    setIsModalOpen(false);
  };

  return (
    <div>
      <div className="flex items-start lg:items-center justify-between mb-[24px] flex-col lg:flex-row">
        <h1 className="text-[24px] font-[500]">Maps</h1>
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
      <DriverMaps />
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
          {isSessionLoading ? (
            <div className="flex justify-center items-center py-8">
              <Spin size="large" />
            </div>
          ) : (
            <>
              <Row gutter={[16, 16]}>
                {data?.data.map((delivery: Delivery) => (
                  <Col
                    xs={24}
                    sm={12}
                    md={8}
                    lg={8}
                    xl={6}
                    key={delivery.order_id}
                  >
                    <DeliveryCard
                      delivery={delivery}
                      onToggleExpand={toggleCardExpansion}
                      onStatusUpdate={handleStatusButtonClick}
                    />
                  </Col>
                ))}
              </Row>

              {/* Pagination */}
              <div className="flex justify-center mt-6">
                <Pagination
                  current={parseInt(data?.meta.page.toString() || "1")}
                  pageSize={parseInt(data?.meta.limit.toString() || "20")}
                  total={data?.meta.totalData || 0}
                  onChange={handlePaginationChange}
                  showSizeChanger={false}
                />
              </div>
            </>
          )}
        </div>
      </ErrorBoundary>

      {/* Status Update Modal */}
      <Modal
        title={statusAction?.title || "Update Status"}
        open={isModalOpen}
        onCancel={handleCancel}
        footer={null}
        maskClosable={!updateStatusMutation.isPending}
      >
        <Form form={form} onFinish={handleSubmit} layout="vertical">
          <Form.Item
            name={"proof_image_url"}
            label="Bukti"
            rules={[{ required: true, message: "Bukti wajib diisi" }]}
          >
            <DraggerUpload
              formItemName="proof_image_url"
              form={form}
              limit={1}
              multiple={false}
            />
          </Form.Item>
          <Form.Item
            name="note"
            label="Catatan"
            rules={[{ required: true, message: "Catatan wajib diisi" }]}
          >
            <AntInput.TextArea
              rows={4}
              placeholder="Masukkan catatan"
              disabled={updateStatusMutation.isPending}
            />
          </Form.Item>
          <div className="flex justify-end gap-2">
            <Button
              onClick={handleCancel}
              disabled={updateStatusMutation.isPending}
            >
              Batal
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={updateStatusMutation.isPending}
            >
              Simpan
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
}
