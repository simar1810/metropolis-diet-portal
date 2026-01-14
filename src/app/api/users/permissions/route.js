import { NextResponse } from "next/server";

export async function PUT(request) {
  try {
    const { id, permissions } = await request.json();
    
    if (!id) {
      return NextResponse.json(
        { status_code: 400, message: "User ID is required" },
        { status: 400 }
      );
    }

    if (!Array.isArray(permissions)) {
      return NextResponse.json(
        { status_code: 400, message: "Permissions must be an array" },
        { status: 400 }
      );
    }

    // Validate permission numbers (1-8 are valid)
    const validPermissions = [1, 2, 3, 4, 5, 6, 7, 8];
    const invalidPermissions = permissions.filter(p => !validPermissions.includes(p));
    
    if (invalidPermissions.length > 0) {
      return NextResponse.json(
        { 
          status_code: 400, 
          message: `Invalid permissions: ${invalidPermissions.join(', ')}. Valid permissions are: ${validPermissions.join(', ')}` 
        },
        { status: 400 }
      );
    }

    // Call the backend API to update user permissions
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_ENDPOINT}/app/users/permissions`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${request.headers.get('authorization')?.replace('Bearer ', '')}`
      },
      body: JSON.stringify({ id, permissions })
    });

    const data = await response.json();

    if (response.ok) {
      return NextResponse.json(data, { status: 200 });
    } else {
      return NextResponse.json(
        { status_code: response.status, message: data.message || "Failed to update permissions" },
        { status: response.status }
      );
    }
  } catch (error) {
    return NextResponse.json(
      { status_code: 500, message: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
