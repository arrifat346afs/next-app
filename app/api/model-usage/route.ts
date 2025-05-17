import { NextRequest, NextResponse } from "next/server";

// Define types
interface ModelUsageData {
  modelName: string;
  imageCount: number;
  timestamp?: number;
}

// In-memory cache for development/demo purposes
// In a real application, you would use a database
let modelUsageCache: ModelUsageData[] = [];

// Helper function to add CORS headers
function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };
}

// Handle OPTIONS requests for CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: corsHeaders(),
  });
}

/**
 * GET handler to retrieve model usage data
 */
export async function GET(request: NextRequest) {
  try {
    // Filter out data older than a month
    const oneMonthAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
    modelUsageCache = modelUsageCache.filter(
      (item) => (item.timestamp || 0) > oneMonthAgo
    );

    return NextResponse.json(
      {
        success: true,
        data: modelUsageCache,
      },
      {
        headers: corsHeaders(),
      }
    );
  } catch (error) {
    console.error("Error retrieving model usage data:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to retrieve model usage data",
      },
      {
        status: 500,
        headers: corsHeaders(),
      }
    );
  }
}

/**
 * POST handler to add new model usage data
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request body
    if (!body.modelName || typeof body.modelName !== "string") {
      return NextResponse.json(
        { success: false, error: "Invalid model name" },
        { status: 400, headers: corsHeaders() }
      );
    }

    if (
      !body.imageCount ||
      typeof body.imageCount !== "number" ||
      body.imageCount <= 0
    ) {
      return NextResponse.json(
        { success: false, error: "Invalid image count" },
        { status: 400, headers: corsHeaders() }
      );
    }

    // Create new model usage data entry
    const newEntry: ModelUsageData = {
      modelName: body.modelName,
      imageCount: body.imageCount,
      timestamp: Date.now(),
    };

    // Add to cache
    modelUsageCache.push(newEntry);

    // Filter out data older than a month
    const oneMonthAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
    modelUsageCache = modelUsageCache.filter(
      (item) => (item.timestamp || 0) > oneMonthAgo
    );

    return NextResponse.json(
      {
        success: true,
        data: newEntry,
      },
      {
        headers: corsHeaders(),
      }
    );
  } catch (error) {
    console.error("Error adding model usage data:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to add model usage data",
      },
      {
        status: 500,
        headers: corsHeaders(),
      }
    );
  }
}

/**
 * DELETE handler to clear all model usage data
 */
export async function DELETE() {
  try {
    modelUsageCache = [];

    return NextResponse.json(
      {
        success: true,
        message: "All model usage data cleared",
      },
      {
        headers: corsHeaders(),
      }
    );
  } catch (error) {
    console.error("Error clearing model usage data:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to clear model usage data",
      },
      {
        status: 500,
        headers: corsHeaders(),
      }
    );
  }
}
