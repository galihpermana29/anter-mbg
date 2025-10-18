"use client";

import ErrorBoundary from "@/shared/components/ErrorBoundary";
import SekolahIcon from "@/shared/components/icons/SekolahIcon";
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
import { useEditSekolahProfile } from "@/app/(admin)/admin/sekolah/repository/useMutateSekolah";
import { getSessionClient } from "@/shared/session/get-session-client";
import { fetchAPIWithoutToken } from "@/shared/repository/api";
import { IResponseProfileSekolah } from "@/shared/models/sekolah";

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

const ProfileSekolahPage = () => {
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
  const [schoolData, setSchoolData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [schoolId, setSchoolId] = useState<string | null>(null);

  const { mutate: mutateEdit, isPending: isPendingEdit } = useEditSekolahProfile(
    schoolId as string
  );

  // Fetch school data on mount
  useEffect(() => {
    const fetchSchoolData = async () => {
      try {
        const session = await getSessionClient();
        if (!session?.user?.school_id) {
          throw new Error("School ID not found");
        }

        setSchoolId(session.user.school_id);

        const detailSekolah = await fetchAPIWithoutToken<IResponseProfileSekolah>(
          `/v1/schools/${session.user.school_id}`,
          {
            method: "GET",
          },
          {
            "X-Source": "web",
            "X-User-Id": session.user_id,
            "X-Kitchen-Id": session.kitchen_id,
            Authorization: `Bearer ${session.access_token}`,
          }
        );

        if (detailSekolah?.data) {
          setSchoolData(detailSekolah.data);
          form.setFieldsValue({
            name: detailSekolah.data.name,
            category: detailSekolah.data.category,
            address: detailSekolah.data.address,
            latitude: detailSekolah.data.latitude?.toString(),
            longitude: detailSekolah.data.longitude?.toString(),
            contact_person: detailSekolah.data.contact_person,
            contact_email: detailSekolah.data.contact_email,
            contact_phone: detailSekolah.data.contact_phone,
            notes: detailSekolah.data.notes || "",
          });

          setMapCoordinates({
            latitude: detailSekolah.data.latitude,
            longitude: detailSekolah.data.longitude,
          });
        }
      } catch (err) {
        message.error("Gagal memuat data sekolah");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSchoolData();
  }, [form]);

  // Update form values when position changes
  useEffect(() => {
    if (position.latitude && position.longitude) {
      form.setFieldsValue({
        latitude: position.latitude.toString(),
        longitude: position.longitude.toString(),
        address: position.address || form.getFieldValue("address"),
      });

      setMapCoordinates({
        latitude: position.latitude,
        longitude: position.longitude,
      });
    }
  }, [position, form]);

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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div>Loading...</div>
      </div>
    );
  }

  if (!schoolData) {
    return (
      <ErrorBoundary error={new Error("Error Something Went Wrong")}>
        <div>Error Something Went Wrong</div>
      </ErrorBoundary>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-[8px] mb-6">
        <SekolahIcon isActive={true} />
        <h1 className="text-[24px] font-[500]">Profil Sekolah</h1>
      </div>

      <ErrorBoundary error={null}>
        <Form
          layout="vertical"
          form={form}
          disabled={isPendingEdit}
          onFinish={(val) => {
            const newPayload = {
              ...val,
              longitude: parseFloat(val.longitude),
              latitude: parseFloat(val.latitude),
              contact_phone: val.contact_phone.toString(),
              is_active: true,
            };

            mutateEdit(newPayload);
          }}
        >
          {/* Section 1: Informasi Sekolah */}
          <div className="bg-white rounded-lg p-6 shadow-sm mb-6">
            <h2 className="text-[18px] font-[600] text-[#030303D9] mb-6">
              Informasi Sekolah
            </h2>
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
                <h3 className="text-[16px] font-[500] text-[#030303D9]">Alamat Sekolah</h3>
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
          </div>

          {/* Section 2: Informasi PIC */}
          <div className="bg-white rounded-lg p-6 shadow-sm mb-6">
            <h2 className="text-[18px] font-[600] text-[#030303D9] mb-6">
              Informasi PIC
            </h2>
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
          </div>

          <Row className="flex justify-end gap-2">
            <Button
              loading={isPendingEdit}
              type="primary"
              htmlType="submit"
            >
              Simpan Perubahan
            </Button>
          </Row>
        </Form>
      </ErrorBoundary>
    </div>
  );
};

export default ProfileSekolahPage;
