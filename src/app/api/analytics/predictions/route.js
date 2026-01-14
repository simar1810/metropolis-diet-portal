import { NextResponse } from "next/server";
import { sendData } from "@/lib/api";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get("period") || "30d";
    const coachId = searchParams.get("coachId");
    const horizon = searchParams.get("horizon") || "30d";

    // Call backend predictive analytics API
    const response = await sendData(
      `app/analytics/predictions?period=${period}&coachId=${coachId}&horizon=${horizon}`
    );

    if (response.status !== true) {
      return NextResponse.json(
        { error: response.message || "Failed to fetch predictions" },
        { status: response.status_code || 500 }
      );
    }

    return NextResponse.json(response.data);
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
