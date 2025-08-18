"use client";

import { Button, Form, Input } from "antd";
import { useLogin } from "./repository/useLogin";

const LoginPage = () => {
  const { mutate, isPending, isError, error } = useLogin();
  return (
    <div className="min-h-screen bg-[url('/background.png')] bg-cover bg-center flex items-center justify-center">
      <div className="flex flex-col items-center justify-center h-full bg-white p-[32px] rounded-[12px] min-w-[300px] md:min-w-[450px]">
        <div className="mb-[24px]">
          <h1 className="font-[500] text-[30px] text-center">Selamat Datang</h1>
          <p className="text-[14px] font-[500] text-[#595959] text-center">
            Masukkan username dan password Anda
          </p>
        </div>
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
            <Input placeholder="Password" className="!w-full" />
          </Form.Item>
          <div className="flex items-center justify-center">
            <Button
              type="primary"
              htmlType="submit"
              className="!w-[280px] mx-auto"
              loading={isPending}
            >
              Masuk
            </Button>
          </div>
        </Form>
      </div>
    </div>
  );
};

export default LoginPage;
