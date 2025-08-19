"use client";

import ErrorBoundary from "@/shared/components/ErrorBoundary";
import {
  Button,
  Card,
  Col,
  DatePicker,
  Form,
  Input,
  InputNumber,
  Row,
  TimePicker,
  Typography,
} from "antd";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import {
  useCreatePesanan,
  useEditPesanan,
  useGetOrderDetail,
} from "../repository/useMutatePesanan";
import { getSessionClient } from "@/shared/session/get-session-client";
import dayjs, { Dayjs } from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";

dayjs.extend(isoWeek);
dayjs.extend(isSameOrBefore);

const { RangePicker } = DatePicker;
const { Title } = Typography;

export default function TambahPesananPage() {
  const [form] = Form.useForm();
  const router = useRouter();
  const query = useSearchParams();
  const orderId = query.get("id");
  const isEditMode = !!orderId;

  const [selectedDates, setSelectedDates] = useState<Dayjs[]>([]);
  const [schoolId, setSchoolId] = useState<string>("");

  const { mutate, isPending } = useCreatePesanan();
  const { mutate: mutateEdit, isPending: isPendingEdit } =
    useEditPesanan(orderId);
  const { data: orderDetail, isFetching } = useGetOrderDetail(orderId);

  // Get school ID from session
  useEffect(() => {
    const getSchoolId = async () => {
      const session = await getSessionClient();
      if (session.user?.school_id) {
        setSchoolId(session.user.school_id);
      }
    };

    getSchoolId();
  }, []);

  // Set form values when detail data is loaded in edit mode
  useEffect(() => {
    if (isEditMode && orderDetail?.data) {
      const orderData = orderDetail.data;
      const deliverBeforeDate = dayjs(orderData.deliver_before);

      // Set selected dates array with just this one date
      setSelectedDates([deliverBeforeDate]);

      // Set form values
      form.setFieldsValue({
        orders: [
          {
            portion: orderData.portion,
            deliver_before: deliverBeforeDate,
            notes: orderData.notes || "",
            date: deliverBeforeDate,
            key: deliverBeforeDate.format("YYYY-MM-DD"), // Add unique key based on date
          },
        ],
      });
    }
  }, [orderDetail, form, isEditMode]);

  // Function to check if a date is a weekend (Sunday)
  const isWeekend = (date: Dayjs) => {
    return date.day() === 0; // 0 is Sunday
  };

  // Function to handle date range selection
  const handleDateRangeChange = (dates: any) => {
    if (!dates || dates.length !== 2) {
      setSelectedDates([]);
      return;
    }

    const [start, end] = dates;
    const dateRange: Dayjs[] = [];
    let current = start.clone();

    // Generate array of dates between start and end, excluding weekends
    while (current.isSameOrBefore(end, "day")) {
      if (!isWeekend(current)) {
        dateRange.push(current.clone());
      }
      current = current.add(1, "day");
    }

    setSelectedDates(dateRange);

    // Reset form fields for the new date selection
    form.setFieldsValue({
      orders: dateRange.map((date, index) => ({
        portion: undefined,
        deliver_before: undefined,
        notes: "",
        date: date,
        key: date.format("YYYY-MM-DD"), // Add unique key based on date
      })),
    });
  };

  // Limit selectable dates to current week and next week
  const disabledDate = (current: Dayjs) => {
    // Get today
    const today = dayjs();

    // Calculate the end of next week (Saturday)
    const endOfNextWeek = today.endOf("week").add(1, "week");

    // Disable dates before today or after end of next week
    return (
      current.isBefore(today, "day") || current.isAfter(endOfNextWeek, "day")
    );
  };

  // Handle form submission
  const handleSubmit = async (values: any) => {
    if (isEditMode) {
      // For edit mode, we only have one order
      const order = values.orders[0];
      const updatedOrder = {
        school_id: schoolId,
        portion: order.portion,
        deliver_before:
          order.date.format("YYYY-MM-DD") +
          "T" +
          order.deliver_before.format("HH:mm:00") +
          "Z",
        notes: order.notes || "",
      };

      mutateEdit(updatedOrder);
    } else {
      // For create mode, we have multiple orders
      const orders = values.orders.map((order: any) => ({
        school_id: schoolId,
        portion: order.portion,
        deliver_before:
          order.date.format("YYYY-MM-DD") +
          "T" +
          order.deliver_before.format("HH:mm:00") +
          "Z",
        notes: order.notes || "",
      }));

      mutate(orders);
    }
  };

  return (
    <div>
      <div>
        <h1 className="text-[24px] font-[500] mb-[24px]">
          {isEditMode ? "Edit Pesanan" : "Tambah Pesanan"}
        </h1>
      </div>
      <ErrorBoundary error={null}>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{ orders: [] }}
          disabled={isFetching}
        >
          <Title level={5} className="mb-4">
            Pilih Rentang Tanggal Pesanan
          </Title>
          {!isEditMode && (
            <Card className="mb-6">
              <RangePicker
                className="w-full"
                disabledDate={disabledDate}
                onChange={handleDateRangeChange}
                format="DD MMM YYYY"
              />
              <div className="mt-4 text-gray-500">
                <p>* Hanya bisa memesan untuk hari Senin-Sabtu</p>
                <p>
                  * Rentang tanggal maksimal adalah minggu ini dan minggu depan
                </p>
              </div>
            </Card>
          )}

          {selectedDates.length > 0 && (
            <div className="my-6 ">
              <Title level={5} className="mb-4">
                Detail Pesanan
              </Title>
              <Form.List name="orders">
                {(fields) => (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {fields.map((field, index) => (
                      <Card
                        key={`order-${field.key}-${index}`}
                        className="mb-4"
                        title={`Pesanan untuk ${selectedDates[index]?.format(
                          "dddd, DD MMM YYYY"
                        )}`}
                      >
                        <Form.Item
                          {...field}
                          name={[field.name, "date"]}
                          hidden={true}
                        />
                        <Row gutter={[16, 16]}>
                          <Col span={12}>
                            <Form.Item
                              {...field}
                              name={[field.name, "portion"]}
                              label="Jumlah Porsi"
                              rules={[
                                {
                                  required: true,
                                  message: "Jumlah porsi harus diisi",
                                },
                              ]}
                            >
                              <InputNumber
                                min={1}
                                className="!w-full"
                                placeholder="Masukkan jumlah porsi"
                              />
                            </Form.Item>
                          </Col>
                          <Col span={12}>
                            <Form.Item
                              {...field}
                              name={[field.name, "deliver_before"]}
                              label="Antar Sebelum Jam"
                              rules={[
                                {
                                  required: true,
                                  message: "Waktu pengantaran harus diisi",
                                },
                              ]}
                            >
                              <TimePicker
                                format="HH:mm"
                                className="w-full"
                                placeholder="Pilih waktu"
                              />
                            </Form.Item>
                          </Col>
                        </Row>
                        <Form.Item
                          {...field}
                          name={[field.name, "notes"]}
                          label="Catatan"
                        >
                          <Input.TextArea
                            rows={2}
                            placeholder="Masukkan catatan (opsional)"
                          />
                        </Form.Item>
                      </Card>
                    ))}
                  </div>
                )}
              </Form.List>
            </div>
          )}

          <Row className="flex justify-end gap-2">
            <Button
              type="default"
              onClick={() => router.push("/school/pesanan")}
            >
              Batal
            </Button>
            <Button
              loading={isPending || isPendingEdit}
              type="primary"
              htmlType="submit"
              disabled={selectedDates.length === 0}
            >
              {isEditMode ? "Update" : "Simpan"}
            </Button>
          </Row>
        </Form>
      </ErrorBoundary>
    </div>
  );
}
