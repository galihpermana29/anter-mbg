import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/shared/session/getter-session";
import { fetchAPI } from "@/shared/repository/api";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    // Get session to verify authentication
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get order ID from params
    const { orderId } = params;
    if (!orderId) {
      return NextResponse.json(
        { message: "Order ID is required" },
        { status: 400 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { status, note } = body;

    if (!status) {
      return NextResponse.json(
        { message: "Status is required" },
        { status: 400 }
      );
    }

    // Forward the request to the backend API
    const response = await fetchAPI(
      `/v1/deliveries/${orderId}/status`,
      {
        method: "PATCH",
        body: JSON.stringify({
          status,
          note: note || "",
        }),
      }
    );

    return NextResponse.json(response);
  } catch (error: any) {
    console.error("Error updating delivery status:", error);
    return NextResponse.json(
      { message: error.message || "Failed to update status" },
      { status: 500 }
    );
  }
}
