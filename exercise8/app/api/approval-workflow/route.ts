import { NextResponse } from "next/server";
import { inngest } from "@/app/inngest/client";

export async function POST(request: Request) {
  try {
    const { action, requestId, approved } = await request.json();

    if (action === "start") {
      if (!requestId) {
        return NextResponse.json(
          { success: false, message: "Request ID is required." },
          { status: 400 }
        );
      }

      await inngest.send({
        name: "workflow/start",
        data: { requestId },
      });

      return NextResponse.json({
        success: true,
        message: `Workflow started for request ${requestId}.`,
      });
    }

    if (action === "approve") {
      if (!requestId || typeof approved !== "boolean") {
        return NextResponse.json(
          {
            success: false,
            message: "Request ID and approval decision are required.",
          },
          { status: 400 }
        );
      }

      await inngest.send({
        name: "workflow/approval",
        data: { requestId, approved },
      });

      return NextResponse.json({
        success: true,
        message: approved
          ? `Request ${requestId} approved.`
          : `Request ${requestId} rejected.`,
      });
    }

    return NextResponse.json(
      { success: false, message: "Invalid action." },
      { status: 400 }
    );
  } catch (error) {
    console.error("Approval workflow API error:", error);

    return NextResponse.json(
      { success: false, message: "Failed to process workflow." },
      { status: 500 }
    );
  }
}
