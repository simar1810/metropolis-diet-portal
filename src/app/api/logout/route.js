import { NextResponse } from "next/server";

export async function DELETE(request) {
  try {
    const response = NextResponse.json(
      { status_code: 200, message: 'Logged out successfully' },
      { status: 200 }
    );

    response.cookies.set('token', "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 0,
    });
    response.cookies.set('_id', "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 0,
    });

    return response;
  } catch (error) {
    return NextResponse.json(
      { status_code: 500, message: error.message },
      { status: 200 }
    );
  }
}