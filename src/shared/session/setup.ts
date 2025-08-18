import { SessionOptions } from "iron-session";
import { ILoginResponse } from "../models/session";

export const defaultSession: ILoginResponse["data"] = {
  access_token: "",
  kitchen_id: "",
  user_id: "",
  role: "",
};

export const sessionOptions: SessionOptions = {
  // You need to create a secret key at least 32 characters long.
  password: "yMB4GTIrk7KdGqBCvxT5Ka0H3QWSlmewebRdkf2UkPM=",
  cookieName: "mbg-session",
  cookieOptions: {
    httpOnly: true,
    // Secure only works in `https` environments. So if the environment is `https`, it'll return true.
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 3, // One hour
  },
};
