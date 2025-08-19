import { ILoginResponse } from "../models/session";
import { ISession } from "./getter-session";

export async function getSessionClient(): Promise<ISession> {
  const session = await fetch("/api/session");
  return session.json();
}
