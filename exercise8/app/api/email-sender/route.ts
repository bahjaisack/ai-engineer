import { NextResponse } from "next/server";
import { inngest } from "@/app/inngest/client";

export async function POST(req: Request) {
  try {
    const { emails } = await req.json();

    if (
      !Array.isArray(emails) ||
      emails.length === 0 ||
      !emails.every(
        (email) =>
          typeof email === "string" &&
          /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Enter at least one valid email address.",
        },
        { status: 400 }
      );
    }

    const result = await inngest.send({
      name: "email/send",
      data: { emails },
    });

    return NextResponse.json({
      success: true,
      message: "Email workflow triggered successfully!",
      eventIds: result.ids,
    });
  } catch (error) {
    console.error("Email sender error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to trigger email workflow.",
      },
      { status: 500 }
    );
  }
}
