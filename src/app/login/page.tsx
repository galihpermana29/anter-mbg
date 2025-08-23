"use client";

import { Button, Form, Input, Alert, Tooltip } from "antd";
import { useLogin } from "./repository/useLogin";
import { useGeolocationPermission } from "@/shared/hooks/useGeolocationPermission";

const LoginPage = () => {
  const { mutate, isPending, isError, error } = useLogin();
  const {
    permission: geolocationPermission,
    isChecking: checkingPermission,
    requestPermission: requestGeolocationPermission,
  } = useGeolocationPermission();

  return (
    <div className="min-h-screen bg-[url('/background.png')] bg-cover bg-center flex items-center justify-center">
      <div className="flex flex-col items-center justify-center h-full bg-white p-[32px] rounded-[12px] min-w-[300px] md:min-w-[450px]">
        <div className="mb-[24px]">
          <h1 className="font-[500] text-[30px] text-center">Selamat Datang</h1>
          <p className="text-[14px] font-[500] text-[#595959] text-center">
            Masukkan username dan password Anda
          </p>
        </div>

        {geolocationPermission === "denied" && (
          <Alert
            message="Akses Lokasi Diperlukan"
            description={
              <div>
                <p>
                  Aplikasi ini memerlukan akses ke lokasi Anda untuk berfungsi
                  dengan baik.
                </p>
                <p>
                  Mohon aktifkan izin lokasi di pengaturan browser Anda, lalu
                  muat ulang halaman ini.
                </p>
              </div>
            }
            type="warning"
            showIcon
            className="mb-4"
          />
        )}

        {geolocationPermission === "prompt" && (
          <Alert
            message="Izin Lokasi Diperlukan"
            description={
              <div>
                <p>Aplikasi ini memerlukan akses ke lokasi Anda.</p>
                <Button
                  type="primary"
                  size="small"
                  onClick={requestGeolocationPermission}
                  className="mt-2"
                >
                  Izinkan Akses Lokasi
                </Button>
              </div>
            }
            type="info"
            showIcon
            className="mb-4"
          />
        )}
        <Form layout="vertical" className="flex-1 w-full" onFinish={mutate}>
          <Form.Item
            name="username"
            label="Username"
            rules={[{ required: true, message: "Please input your username!" }]}
          >
            <Input placeholder="Username" className="!w-full" />
          </Form.Item>
          <Form.Item
            name="password"
            label="Password"
            rules={[{ required: true, message: "Please input your password!" }]}
          >
            <Input.Password placeholder="Password" className="!w-full" />
          </Form.Item>
          <div className="flex items-center justify-center">
            <Button
              type="primary"
              htmlType="submit"
              className="!w-[280px] mx-auto"
              loading={isPending || checkingPermission}
              disabled={
                geolocationPermission !== "granted" ||
                isPending ||
                checkingPermission
              }
              title={
                geolocationPermission !== "granted"
                  ? "Izinkan akses lokasi terlebih dahulu"
                  : ""
              }
            >
              {checkingPermission ? "Memeriksa Izin Lokasi..." : "Masuk"}
            </Button>
          </div>
        </Form>
      </div>
    </div>
  );
};

export default LoginPage;
