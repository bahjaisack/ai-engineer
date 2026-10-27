import { NextResponse } from "next/server";
import { inngest } from "@/app/inngest/client";

export async function POST() {
  try {
    const result = await inngest.send({
      name: "data/process",
      data: {},
    });

    return NextResponse.json({
      success: true,
      message: "Data processing event triggered!",
      eventIds: result.ids,
    });
  } catch (error) {
    console.error("Data processing error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to trigger data processing.",
      },
      { status: 500 }
    );
  }
}
