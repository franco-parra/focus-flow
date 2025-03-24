import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { refresh } = await request.json();

    const response = await fetch("http://localhost:8000/api/token/blacklist/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refresh }),
    });

    if (!response.ok) {
      throw new Error("Blacklist failed");
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Logout failed" }, { status: 500 });
  }
}
