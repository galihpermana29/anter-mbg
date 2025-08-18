import { removeSession } from "@/shared/session/getter-session";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    // Remove the session
    await removeSession();
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json({ success: false, error: "Failed to logout" }, { status: 500 });
  }
}
