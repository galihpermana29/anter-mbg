"use client";

import { Button, Col, Form, Input, Row, Select, Upload, message } from "antd";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { UploadOutlined } from "@ant-design/icons";
import type { UploadFile, UploadProps } from "antd";
import toast from "react-hot-toast";
import ErrorBoundary from "@/shared/components/ErrorBoundary";
import {
  useCreateMenu,
  useGetDetailMenu,
  useEditMenu,
} from "../repository/useMutateMenu";
import { ICreateMenuPayload } from "@/shared/models/menu";
import { jenjangDropdown } from "@/shared/models/dropdown";

export default function MenuFormPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const menuId = searchParams.get("id");
  const isEditMode = !!menuId;

  const [form] = Form.useForm();
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [imageUrl, setImageUrl] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Mutations
  const { mutate: createMenu, isPending: isCreating } = useCreateMenu();
  const { mutate: updateMenu, isPending: isUpdating } = useEditMenu(menuId);

  // Fetch menu detail for edit mode
  const { data: menuDetail, isFetching: isLoadingDetail } =
    useGetDetailMenu(menuId);

  // Set form values when menu detail is loaded in edit mode
  useEffect(() => {
    if (isEditMode && menuDetail?.data) {
      form.setFieldsValue({
        name: menuDetail.data.name,
        category: menuDetail.data.category,
      });

      // Set image preview if exists
      if (menuDetail.data.image_url) {
        setImageUrl(menuDetail.data.image_url);
        setFileList([
          {
            uid: "-1",
            name: "menu-image.png",
            status: "done",
            url: menuDetail.data.image_url,
          },
        ]);
      }
    }
  }, [isEditMode, menuDetail, form]);

  // Handle form submission
  const handleSubmit = async (values: any) => {
    try {
      setIsSubmitting(true);

      // Prepare payload
      const payload: ICreateMenuPayload = {
        name: values.name,
        category: values.category,
        image_url: "", // Default empty string, will be updated if image exists
      };

      // Add image if available
      if (fileList.length > 0 && fileList[0].originFileObj) {
        // In a real implementation, you would upload the image to a server
        // and get back a URL to include in the payload
        // For now, we'll simulate this process

        // This is a placeholder for actual image upload logic
        // payload.image_url = await uploadImage(fileList[0].originFileObj);

        // For demo purposes, we'll just use a placeholder URL
        payload.image_url =
          imageUrl ||
          "https://res.cloudinary.com/dqipjpy1w/image/upload/v1750179370/bn1ruaqvijfe476f0mlk.png";
      }

      if (isEditMode) {
        updateMenu(payload);
      } else {
        createMenu(payload);
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("Terjadi kesalahan saat menyimpan menu");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle image upload
  const handleImageUpload: UploadProps["onChange"] = ({
    fileList: newFileList,
  }) => {
    setFileList(newFileList);

    // Preview image
    if (newFileList.length > 0 && newFileList[0].originFileObj) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImageUrl(e.target?.result as string);
      };
      reader.readAsDataURL(newFileList[0].originFileObj);
    } else {
      setImageUrl("");
    }
  };

  // Handle cancel button
  const handleCancel = () => {
    router.push("/admin/menu");
  };

  return (
    <div className="p-6">
      <ErrorBoundary error={null}>
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-4">
            {isEditMode ? "Edit Menu" : "Tambah Menu Baru"}
          </h1>
        </div>

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          disabled={isSubmitting || isLoadingDetail}
        >
          <Row gutter={[16, 16]}>
            <Col xs={24} md={12}>
              <Form.Item
                label="Nama Menu"
                name="name"
                rules={[{ required: true, message: "Nama menu wajib diisi" }]}
              >
                <Input placeholder="Masukkan nama menu" />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item
                label="Kategori"
                name="category"
                rules={[{ required: true, message: "Kategori wajib dipilih" }]}
              >
                <Select
                  placeholder="Pilih kategori"
                  options={jenjangDropdown}
                />
              </Form.Item>
            </Col>

            <Col xs={24}>
              <Form.Item
                label="Gambar Menu"
                name="image"
                valuePropName="fileList"
                getValueFromEvent={(e) => e?.fileList}
              >
                <Upload
                  listType="picture"
                  maxCount={1}
                  fileList={fileList}
                  onChange={handleImageUpload}
                  beforeUpload={() => false} // Prevent auto upload
                >
                  <Button icon={<UploadOutlined />}>Upload Gambar</Button>
                </Upload>
              </Form.Item>

              {imageUrl && (
                <div className="mb-4">
                  <p className="mb-2">Preview:</p>
                  <img
                    src={imageUrl}
                    alt="Menu Preview"
                    style={{ maxWidth: "200px", maxHeight: "200px" }}
                  />
                </div>
              )}
            </Col>
          </Row>

          <div className="flex gap-4 mt-6 justify-end">
            <Button
              type="primary"
              htmlType="submit"
              loading={isCreating || isUpdating}
            >
              {isEditMode ? "Simpan Perubahan" : "Tambah Menu"}
            </Button>
            <Button onClick={handleCancel}>Batal</Button>
          </div>
        </Form>
      </ErrorBoundary>
    </div>
  );
}
