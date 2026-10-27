import { NextResponse } from "next/server";
import { inngest } from "@/app/inngest/client";

export async function POST() {
  try {
    const result = await inngest.send({
      name: "api/fetch",
      data: {},
    });

    return NextResponse.json({
      success: true,
      message: "API Fetcher event triggered! Check Inngest to see the execution and retries.",
      eventIds: result.ids,
    });
  } catch (error) {
    console.error("API Fetcher error:", error);

    return NextResponse.json(
      { success: false, message: "Failed to trigger API Fetcher." },
      { status: 500 }
    );
  }
}
