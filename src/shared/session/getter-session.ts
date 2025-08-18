"use server";
import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { sessionOptions } from "./setup";

import { ILoginResponse } from "../models/session";

// ADD THE GETSESSION ACTION
export async function getSession() {
  const session = await getIronSession<ILoginResponse["data"]>(
    await cookies(),
    sessionOptions
  );
  return session;
}

export async function getSessionString() {
  const session = await getIronSession<ILoginResponse["data"]>(
    await cookies(),
    sessionOptions
  );
  return JSON.stringify(session);
}

export async function setSession(newSessionData: ILoginResponse["data"]) {
  let session = await getSession();
  Object.keys(newSessionData).forEach((key) => {
    session[key as keyof ILoginResponse["data"]] =
      newSessionData[key as keyof ILoginResponse["data"]];
  });

  await session.save();
}

export async function setSessionSpecific(value: string, key: string) {
  const session = await getSession();
  session[key as keyof ILoginResponse["data"]] = value;
  await session.save();
}

export async function removeSession() {
  const session = await getSession();
  session.destroy();
}
