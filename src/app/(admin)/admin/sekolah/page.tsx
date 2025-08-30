"use client";

import { Button, Input, Select, Table } from "antd";
import ErrorBoundary from "@/shared/components/ErrorBoundary";
import { setUrlParams } from "@/shared/usecase/url-params";
import useListSekolah from "./repository/useSekolah";
import { useRouter } from "next/navigation";
import { jenjangDropdown } from "@/shared/models/dropdown";
import { Sekolah } from "@/shared/models/sekolah";
import SekolahIcon from "@/shared/components/icons/SekolahIcon";

const SekolahPage = () => {
  const { data, isLoading, refetch, error } = useListSekolah();

  const router = useRouter();

  const column = [
    {
      title: "ID Sekolah",
      dataIndex: "id",
    },
    {
      title: "Nama Sekolah",
      dataIndex: "name",
    },
    {
      title: "Jenjang",
      dataIndex: "category",
    },
    {
      title: "Alamat",
      dataIndex: "address",
    },
    {
      title: "PIC",
      dataIndex: "contact_person",
    },
    {
      title: "PIC Phone",
      dataIndex: "contact_phone",
    },
    {
      title: "Action",
      dataIndex: "action",
      render: (text: string, record: Sekolah) => (
        <div className="flex gap-[8px]">
          <Button
            type="primary"
            onClick={() => {
              router.push(`/admin/sekolah/tambah?id=${record.id}`);
            }}
          >
            Edit
          </Button>
          {/* <Button type="default">Hapus</Button> */}
          <Button
            type="default"
            onClick={() => {
              router.push(
                `/admin/sekolah/log?id=${record.id}&school_name=${record.name}`
              );
            }}
          >
            Detail
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="flex md:items-center justify-between md:flex-row flex-col mb-[24px] gap-[24px]">
        <div className="flex items-center gap-[8px] ">
          <SekolahIcon isActive={true} />
          <h1 className="text-[24px] font-[500]">Sekolah</h1>
        </div>

        <Button
          type="primary"
          onClick={() => {
            router.push("/admin/sekolah/tambah");
          }}
        >
          Tambah Sekolah
        </Button>
      </div>

      <ErrorBoundary error={error}>
        <div className="flex flex-col gap-[24px]">
          <div className="flex flex-col md:flex-row gap-[8px]">
            <Input
              allowClear
              onClear={() => {
                setUrlParams({ page: 1 });
                refetch();
              }}
              onPressEnter={() => {
                refetch();
              }}
              placeholder="Cari sekolah"
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
              options={jenjangDropdown}
              placeholder="Pilih Jenjang"
              onChange={(value) => {
                setUrlParams({ category: value, page: 1 });
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

export default SekolahPage;
