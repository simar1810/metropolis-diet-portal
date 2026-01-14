import { fetchData } from "@/lib/api";
import { NextResponse } from "next/server";

export async function GET(request, { params }) {
	const { coachId } = await params;

	try {
		const backendUrl = `app/downline/visualizer/${coachId}`;

		const data = await fetchData(backendUrl);

		return NextResponse.json(data, { status: 200 });
	} catch (error) {
		console.error("Proxy API Error:", error);
		return NextResponse.json(
			{ status_code: 500, message: "Internal server error in API proxy" },
			{ status: 500 }
		);
	}
}
