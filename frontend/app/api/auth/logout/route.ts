import { NextResponse } from "next/server";
import { logoutUser } from "@/lib/api/auth";

export async function POST(request: Request) {
  try {
    const { refresh } = await request.json();
    const response = await logoutUser(refresh);

    if (!response.ok) {
      throw new Error("Blacklist failed");
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Logout failed" }, { status: 500 });
  }
}
