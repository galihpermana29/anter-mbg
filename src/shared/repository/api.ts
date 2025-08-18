import { redirect } from "next/navigation";
import { getSessionClient } from "../session/get-session-client";

export const API_URl = process.env.NEXT_PUBLIC_API_URL;

export async function fetchAPI<T>(
  url: string, //send /v1/endpoint
  options?: RequestInit
): Promise<T> {
  const session = await getSessionClient();
  const token = session?.access_token;

  if (!token) {
    throw new Error("No token found");
  }

  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
    "X-User-ID": session?.user_id,
    "X-Kitchen-ID": session?.kitchen_id,
    "X-Source": "web",
  };

  const response = await fetch(`${API_URl}/api${url}`, {
    ...options,
    headers,
  });
  if (!response.ok) {
    throw new Error("Network response was not ok");
  }
  return response.json();
}

export async function fetchAPIWithoutToken<T>(
  url: string, //send /v1/endpoint
  options?: RequestInit
): Promise<T> {
  const headers = {
    "Content-Type": "application/json",
  };

  const response = await fetch(`${API_URl}/api${url}`, {
    ...options,
    headers,
  });
  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      Object.prototype.hasOwnProperty.call(data, "status")
        ? data.status
        : "Something went wrong"
    );
  }
  return data;
}
