import { ILoginResponse } from "../models/session";

export async function getSessionClient(): Promise<ILoginResponse["data"]> {
  const session = await fetch("/api/session");
  return session.json();
}
