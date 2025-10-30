"use client";

import { Button, Col, Image, Input, Row, Select, Table } from "antd";
import { ColumnsType } from "antd/es/table";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import ErrorBoundary from "@/shared/components/ErrorBoundary";
import { Menu, IListMenu } from "@/shared/models/menu";
import useListMenu from "./repository/useMenu";
import { getUrlParams, setUrlParams } from "@/shared/usecase/url-params";
import { jenjangDropdown } from "@/shared/models/dropdown";
import MenuIcon from "@/shared/components/icons/MenuIcon";

export default function MenuPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState<string>(getUrlParams("search") || "");
  const [category, setCategory] = useState<string>(
    getUrlParams("category") || ""
  );

  // Fetch menu data
  const { data, isLoading, error, refetch } = useListMenu();

  // Update URL params when search or category changes
  useEffect(() => {
    setUrlParams({
      page: getUrlParams("page") || "1",
      search,
      category,
    });

    // Refetch data when URL params change
    refetch();
  }, [searchParams, refetch, search, category]);

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setUrlParams({
      page: "1",
      search: e.target.value,
      category,
    });
  };

  // Handle category filter change
  const handleCategoryChange = (value: string) => {
    setCategory(value);
    setUrlParams({
      page: "1",
      search,
      category: value,
    });
  };

  // Clear search
  const handleClearSearch = () => {
    setSearch("");
    setUrlParams({
      page: "1",
      search: "",
      category,
    });
  };

  // Handle pagination change
  const handlePaginationChange = (page: number) => {
    setUrlParams({
      page: page.toString(),
      search,
      category,
    });
  };

  // Navigate to add menu page
  const handleAddMenu = () => {
    router.push("/admin/menu/tambah");
  };

  // Navigate to edit menu page
  const handleEditMenu = (id: string) => {
    router.push(`/admin/menu/tambah?id=${id}`);
  };

  // Table columns configuration
  const columns: ColumnsType<Menu> = [
    {
      title: "Nama Menu",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Kategori",
      dataIndex: "category",
      key: "category",
    },
    {
      title: "Gambar",
      dataIndex: "image_url",
      key: "image_url",
      render: (image: string) =>
        image ? (
          <Image
            src={image}
            alt="Menu"
            width={100}
            height={100}
            style={{ objectFit: "cover" }}
          />
          // <img
          //   src={image}
          //   alt="Menu"
          //   style={{ width: "100px", height: "100px", objectFit: "cover" }}
          // />
        ) : (
          "No Image"
        ),
    },
    {
      title: "Aksi",
      key: "action",
      render: (_, record) => (
        <div className="flex gap-2">
          <Button type="primary" onClick={() => handleEditMenu(record.id)}>
            Edit
          </Button>
          <Button
            danger
            onClick={() => {
              toast.error("Delete functionality not implemented yet");
            }}
          >
            Delete
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <ErrorBoundary error={error}>
        <div className="mb-6">
          <div className="flex justify-between items-center mb-[24px]">
            <div className="flex items-center gap-[8px] ">
              <MenuIcon isActive={true} />
              <h1 className="text-[24px] font-[500]">Menu</h1>
            </div>

            <Button type="primary" onClick={handleAddMenu}>
              Tambah Menu
            </Button>
          </div>
          <Row gutter={[16, 16]} className="mb-4">
            <Col xs={24} sm={12} md={8} lg={6}>
              <Input
                placeholder="Cari menu..."
                value={search}
                onChange={handleSearchChange}
                suffix={
                  search ? (
                    <span
                      className="cursor-pointer"
                      onClick={handleClearSearch}
                    >
                      ✕
                    </span>
                  ) : null
                }
              />
            </Col>
            <Col xs={24} sm={12} md={8} lg={6}>
              <Select
                className="!w-full md:max-w-max"
                placeholder="Jenjang"
                value={category || undefined}
                onChange={handleCategoryChange}
                allowClear
                options={jenjangDropdown}
              />
            </Col>
          </Row>
        </div>

        <Table
          columns={columns}
          dataSource={data?.data || []}
          rowKey="id"
          loading={isLoading}
          pagination={{
            current: Number(getUrlParams("page") || 1),
            pageSize: data?.meta?.limit || 10,
            total: data?.meta?.totalData || 0,
            onChange: handlePaginationChange,
            showSizeChanger: false,
          }}
          scroll={{ x: "max-content" }}
        />
      </ErrorBoundary>
    </div>
  );
}
