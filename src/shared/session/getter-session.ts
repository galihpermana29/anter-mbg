"use server";
import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { sessionOptions } from "./setup";

import { IDetailUser, Data } from "../models/session";

export interface ISession extends Data {
  user?: IDetailUser;
}

// ADD THE GETSESSION ACTION
export async function getSession() {
  const session = await getIronSession<ISession>(
    await cookies(),
    sessionOptions
  );
  return session;
}

export async function getSessionString() {
  const session = await getIronSession<ISession>(
    await cookies(),
    sessionOptions
  );
  return JSON.stringify(session);
}

export async function setSession(newSessionData: Data, userData?: IDetailUser) {
  let session = await getSession();

  // Set basic session data
  Object.keys(newSessionData).forEach((key) => {
    session[key as keyof Data] = newSessionData[key as keyof Data];
  });

  // Set user data if provided
  if (userData) {
    session.user = userData;
  }

  await session.save();
}

export async function setSessionSpecific(value: string, key: string) {
  const session = await getSession();
  (session as any)[key] = value;
  await session.save();
}

export async function removeSession() {
  const session = await getSession();
  session.destroy();
}
