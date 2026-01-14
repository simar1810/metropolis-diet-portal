import { NextResponse } from "next/server";

export async function POST(request) {
	try {
		const { refreshToken, _id, userType, userData, ...others } = await request.json();
		const response = NextResponse.json(
			{ status_code: 200, message: "Logged in successfully" },
			{ status: 200 }
		);

		response.cookies.set("token", refreshToken, {
			httpOnly: true,
			// httpOnly: false,
			secure: process.env.NODE_ENV === "production",
			path: "/",
			maxAge: 60 * 60 * 24 * 7,
		});
		response.cookies.set("_id", _id, {
			httpOnly: false, // Allow client-side access for filtering
			secure: process.env.NODE_ENV === "production",
			path: "/",
			maxAge: 60 * 60 * 24 * 7,
		});

		// Store user type and permissions for frontend access
		if (userType) {
			response.cookies.set("userType", userType, {
				httpOnly: false, // Allow client-side access
				secure: process.env.NODE_ENV === "production",
				path: "/",
				maxAge: 60 * 60 * 24 * 7,
			});
		}

		if (userData && userData.permissions) {
			response.cookies.set(
				"userPermissions",
				JSON.stringify(userData.permissions),
				{
					httpOnly: false, // Allow client-side access
					secure: process.env.NODE_ENV === "production",
					path: "/",
					maxAge: 60 * 60 * 24 * 7,
				}
			);
		}

		// Store user's assigned client IDs for filtering
		if (userData && userData.clients && Array.isArray(userData.clients)) {
			const clientIds = userData.clients.map((client) =>
				typeof client === "object" && client.$oid ? client.$oid : client
			);
			response.cookies.set("userClientIds", JSON.stringify(clientIds), {
				httpOnly: false, // Allow client-side access
				secure: process.env.NODE_ENV === "production",
				path: "/",
				maxAge: 60 * 60 * 24 * 7,
			});
		}

		return response;
	} catch (error) {
		return NextResponse.json(
			{ message: error.message + ". Please try again later!" },
			{ status: 200 }
		);
	}
}
