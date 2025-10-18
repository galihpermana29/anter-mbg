"use client";

import ErrorBoundary from "@/shared/components/ErrorBoundary";
import { jenjangDropdown } from "@/shared/models/dropdown";
import {
  AutoComplete,
  Button,
  Col,
  Form,
  Input,
  InputNumber,
  Row,
  Select,
  message,
} from "antd";
import { useGeolocation } from "@/shared/hooks/useGeolocation";
import { useEffect, useState, useRef, useCallback } from "react";
import dynamic from "next/dynamic";
import {
  useCreateSekolah,
  useEditSekolah,
  useGetDetailSekolah,
} from "../repository/useMutateSekolah";
import { useRouter, useSearchParams } from "next/navigation";
import { getUrlParams } from "@/shared/usecase/url-params";
import toast from "react-hot-toast";

// Import Leaflet map component dynamically to avoid SSR issues
const LeafletMap = dynamic(() => import("@/shared/components/LeafletMap"), {
  ssr: false,
});

interface LocationOption {
  value: string;
  label: string;
  lat: number;
  lon: number;
}

const TambahSekolahPage = () => {
  const [form] = Form.useForm();
  const { loading, error, position, getCurrentPosition } = useGeolocation();
  const [mapCoordinates, setMapCoordinates] = useState<{
    latitude: number | null;
    longitude: number | null;
  }>({
    latitude: null,
    longitude: null,
  });
  const [searchOptions, setSearchOptions] = useState<LocationOption[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const query = useSearchParams();
  const schoolId = query.get("id");
  const isEditMode = !!schoolId;

  const { data, isFetching } = useGetDetailSekolah(schoolId as string);
  const schoolData = data?.data; // Access the data property of IDetailSekolah

  const router = useRouter();

  const { mutate, isPending } = useCreateSekolah();

  const { mutate: mutateEdit, isPending: isPendingEdit } = useEditSekolah(
    schoolId as string
  );

  // Set form values when detail data is loaded in edit mode
  useEffect(() => {
    if (isEditMode && schoolData) {
      form.setFieldsValue({
        name: schoolData.name,
        address: schoolData.address,
        latitude: schoolData.latitude.toString(),
        longitude: schoolData.longitude.toString(),
        contact_person: schoolData.contact_person,
        contact_email: schoolData.contact_email,
        contact_phone: schoolData.contact_phone,
        notes: schoolData.notes || "",
      });

      // Update map coordinates
      setMapCoordinates({
        latitude: schoolData.latitude,
        longitude: schoolData.longitude,
      });
    }
  }, [schoolData, form, isEditMode]);

  // Update form values when position changes
  useEffect(() => {
    if (position.latitude && position.longitude) {
      form.setFieldsValue({
        latitude: position.latitude.toString(),
        longitude: position.longitude.toString(),
        address: position.address || "",
      });

      // Update map coordinates
      setMapCoordinates({
        latitude: position.latitude,
        longitude: position.longitude,
      });
    }
  }, [position, form]);

  // No need for handleCoordinateChange since fields are disabled

  // Handle get current location button click
  const handleGetCurrentLocation = async () => {
    getCurrentPosition();
    if (error) {
      message.error(`Gagal mendapatkan lokasi: ${error}`);
    }
  };

  // Handle location search using Nominatim API with debounce
  const handleLocationSearch = useCallback((searchText: string) => {
    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (!searchText || searchText.length < 3) {
      setSearchOptions([]);
      setSearchLoading(false);
      return;
    }

    setSearchLoading(true);

    // Debounce the API call by 500ms
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
            searchText
          )}&limit=5&addressdetails=1`
        );
        const data = await response.json();

        const options: LocationOption[] = data.map((item: any) => ({
          value: item.display_name,
          label: item.display_name,
          lat: parseFloat(item.lat),
          lon: parseFloat(item.lon),
        }));

        setSearchOptions(options);
      } catch (err) {
        message.error("Gagal mencari lokasi");
        console.error(err);
      } finally {
        setSearchLoading(false);
      }
    }, 500);
  }, []);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  // Handle location selection from search
  const handleLocationSelect = (value: string, option: LocationOption) => {
    form.setFieldsValue({
      address: value,
      latitude: option.lat.toString(),
      longitude: option.lon.toString(),
    });

    setMapCoordinates({
      latitude: option.lat,
      longitude: option.lon,
    });
  };

  // Handle map click/drag to update coordinates
  const handleMapLocationSelect = async (lat: number, lng: number) => {
    form.setFieldsValue({
      latitude: lat.toString(),
      longitude: lng.toString(),
    });

    setMapCoordinates({
      latitude: lat,
      longitude: lng,
    });

    // Reverse geocode to get address
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
      );
      const data = await response.json();
      if (data.display_name) {
        form.setFieldsValue({
          address: data.display_name,
        });
      }
    } catch (err) {
      console.error("Failed to reverse geocode:", err);
    }
  };

  return (
    <div>
      <div>
        <h1 className="text-[24px] font-[500] mb-[24px]">
          {isEditMode ? "Edit Sekolah" : "Tambah Sekolah"}
        </h1>
      </div>
      <ErrorBoundary error={null}>
        <div>
          <Form
            layout="vertical"
            form={form}
            disabled={isPending || isFetching}
            onFinish={(val) => {
              const newPayload = {
                ...val,
                longitude: parseFloat(val.longitude),
                latitude: parseFloat(val.latitude),
                contact_phone: val.contact_phone.toString(),
                is_active: true,
              };

              if (isEditMode) {
                mutateEdit(newPayload);
              } else {
                // Add new school
                mutate(newPayload);
              }
            }}
          >
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Form.Item
                  label="Nama Sekolah"
                  name={"name"}
                  rules={[
                    { required: true, message: "Please input your name!" },
                  ]}
                >
                  <Input placeholder="Nama Sekolah" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="Jenjang"
                  name={"category"}
                  rules={[
                    { required: true, message: "Please input category!" },
                  ]}
                >
                  <Select
                    options={jenjangDropdown}
                    placeholder="Pilih Jenjang"
                  />
                </Form.Item>
              </Col>
            </Row>
            <Row className="mb-4">
              <div className="flex items-center justify-between gap-3 w-full mb-2">
                <h2 className="text-lg font-medium">Alamat Sekolah</h2>
                <Button
                  type="text"
                  onClick={handleGetCurrentLocation}
                  loading={loading}
                >
                  Dapatkan lokasi saat ini
                </Button>
              </div>
              <div className="w-full h-[300px] mb-4">
                <LeafletMap
                  latitude={mapCoordinates.latitude}
                  longitude={mapCoordinates.longitude}
                  onLocationSelect={handleMapLocationSelect}
                  draggable={true}
                />
              </div>
            </Row>
            <Form.Item
              label="Alamat"
              name={"address"}
              rules={[{ required: true, message: "Please input address!" }]}
              tooltip="Cari lokasi atau klik pada peta untuk memilih lokasi"
            >
              <AutoComplete
                options={searchOptions}
                onSearch={handleLocationSearch}
                onSelect={handleLocationSelect}
                placeholder="Cari alamat atau klik pada peta"
              />
            </Form.Item>
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Form.Item
                  label="Longitude"
                  name={"longitude"}
                  rules={[
                    {
                      required: true,
                      message: "Silakan dapatkan lokasi saat ini!",
                    },
                  ]}
                >
                  <Input placeholder="Longitude" disabled />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="Latitude"
                  name={"latitude"}
                  rules={[
                    {
                      required: true,
                      message: "Silakan dapatkan lokasi saat ini!",
                    },
                  ]}
                >
                  <Input placeholder="Latitude" disabled />
                </Form.Item>
              </Col>
            </Row>
            <h1 className="text-[24px] font-[500] mb-[24px]">Informasi PIC</h1>
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Form.Item
                  label="Nama PIC"
                  name={"contact_person"}
                  rules={[
                    { required: true, message: "Please input your name!" },
                  ]}
                >
                  <Input placeholder="Nama" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="No WhatsApp PIC"
                  name={"contact_phone"}
                  rules={[
                    { required: true, message: "Please input your name!" },
                  ]}
                >
                  <InputNumber placeholder="No WhatsApp" className="!w-full" />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Form.Item label="Email PIC" name={"contact_email"}>
                  <Input type="email" placeholder="Email" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="Catatan" name={"notes"}>
                  <Input placeholder="Catatan" />
                </Form.Item>
              </Col>
            </Row>
            <Row className="flex justify-end gap-2">
              <Button
                type="default"
                onClick={() => router.push("/admin/sekolah")}
              >
                Batal
              </Button>
              <Button
                loading={isPending || isPendingEdit}
                type="primary"
                htmlType="submit"
              >
                {isEditMode ? "Update" : "Simpan"}
              </Button>
            </Row>
          </Form>
        </div>
      </ErrorBoundary>
    </div>
  );
};

export default TambahSekolahPage;
