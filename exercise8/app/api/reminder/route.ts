import { NextResponse } from "next/server";
import { inngest } from "@/app/inngest/client";

export async function POST(request: Request) {
  try {
    const { message, delayMinutes } = await request.json();

    if (
      typeof message !== "string" ||
      !message.trim() ||
      typeof delayMinutes !== "number" ||
      !Number.isFinite(delayMinutes) ||
      delayMinutes < 0
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Enter a reminder message and a valid delay.",
        },
        { status: 400 }
      );
    }

    const result = await inngest.send({
      name: "reminder/schedule",
      data: { message: message.trim(), delayMinutes },
    });

    return NextResponse.json({
      success: true,
      message: `Reminder scheduled with a delay of ${delayMinutes} minute(s).`,
      eventIds: result.ids,
    });
  } catch (error) {
    console.error("Reminder API error:", error);

    return NextResponse.json(
      { success: false, message: "Failed to schedule reminder." },
      { status: 500 }
    );
  }
}
