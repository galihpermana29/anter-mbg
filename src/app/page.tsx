"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getSessionClient } from "@/shared/session/get-session-client";

const Page = () => {
  const router = useRouter();

  const checkSession = async () => {
    const data = await getSessionClient();
    if (!data || !data.access_token) {
      router.push("/login");
    }
  };
  useEffect(() => {
    checkSession();
  }, []);
  return <div></div>;
};

export default Page;
