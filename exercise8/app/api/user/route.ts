
import { NextResponse } from "next/server";
import { inngest } from "../../inngest/client";

export async function POST(req: Request) {
  try {
    const { email, name } = await req.json();

    if (
      typeof email !== "string" ||
      !email.includes("@") ||
      typeof name !== "string" ||
      !name.trim()
    ) {
      return NextResponse.json(
        { success: false, message: "Please provide a valid name and email." },
        { status: 400 }
      );
    }

    const user = {
      id: crypto.randomUUID(),
      email,
      name,
    };

    await inngest.send({
      name: "user/create",
      data: { email, name },
    });

    return NextResponse.json({
      success: true,
      message: "User created and background task triggered!",
      user,
    });
  } catch (error) {
    console.error("Create user error:", error);

    return NextResponse.json(
      { success: false, message: "Failed to create user." },
      { status: 500 }
    );
  }
}
