import { NextResponse } from "next/server";
import { inngest } from "@/app/inngest/client";

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (typeof email !== "string" || !email.trim()) {
      return NextResponse.json(
        { success: false, message: "Please enter an email address." },
        { status: 400 }
      );
    }

    const result = await inngest.send({
      name: "data/validate",
      data: { email: email.trim() },
    });

    return NextResponse.json({
      success: true,
      message: "Email validation event triggered! Check Inngest for the result.",
      eventIds: result.ids,
    });
  } catch (error) {
    console.error("Validation API error:", error);

    return NextResponse.json(
      { success: false, message: "Failed to trigger email validation." },
      { status: 500 }
    );
  }
}
