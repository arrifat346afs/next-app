import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";
export const runtime = 'nodejs';

// Define types
interface ModelUsageData {
  modelName: string;
  imageCount: number;
  timestamp?: number;
}

// Create a Convex client for API routes
const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL || "");

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
 * Enhanced with better debugging and error handling
 */
export async function GET(request: NextRequest) {
  try {
    // Check if a userId is provided in the query parameters
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get("userId");

    console.log(`API GET request received with userId: ${userId || "none"}`);
    console.log(`Request URL: ${request.url}`);
    console.log(
      `Request headers:`,
      Object.fromEntries(request.headers.entries())
    );

    let result;

    if (userId) {
      // If userId is provided, get user-specific data
      console.log(
        `Querying Convex for user-specific data with userId: ${userId}`
      );

      try {
        result = await convex.query(api.modelUsage.getUserModelUsageData, {
          userId: userId,
        });

        // Log the result for debugging
        console.log(`Convex query result for user ${userId}:`, {
          success: result.success,
          dataCount: result.data?.length || 0,
          message: result.message || "",
          error: result.error,
        });

        // If no data was found for this user, log it but don't create test data automatically
        if (!result.data || result.data.length === 0) {
          console.log(`No data found for user ${userId}`);

          // Check if the request has a special query parameter to force test data
          const forceTestData = searchParams.get("forceTestData") === "true";

          if (forceTestData) {
            console.log(`ForceTestData parameter detected, creating test data`);

            // Create test data for common AI models
            const testModels = ["Stable Diffusion", "DALL-E", "Midjourney"];
            const now = Date.now();

            // Create test data for the last 7 days
            const testData: {
              modelName: string; imageCount: number; // 5-25 images
              timestamp: number; userId: string;
            }[] = [];
            for (let day = 0; day < 7; day++) {
              const timestamp = now - day * 24 * 60 * 60 * 1000;

              testModels.forEach((modelName) => {
                testData.push({
                  modelName,
                  imageCount: Math.floor(Math.random() * 20) + 5, // 5-25 images
                  timestamp,
                  userId,
                });
              });
            }

            console.log(
              `Created ${testData.length} test data points for user ${userId}`
            );

            // Return the test data
            return NextResponse.json(
              {
                success: true,
                data: testData,
                message: "Using generated test data for this user",
              },
              {
                headers: corsHeaders(),
              }
            );
          }

          // Otherwise, return empty data array
          return NextResponse.json(
            {
              success: true,
              data: [],
              message: "No data found for this user",
            },
            {
              headers: corsHeaders(),
            }
          );
      }
    } catch (convexError: any) {
      console.error(`Error querying Convex for user ${userId}:`, convexError);

      // Check if the request has a special query parameter to force test data
      const forceTestData = searchParams.get("forceTestData") === "true";

        if (forceTestData) {
          // Create fallback test data if Convex query fails and test data is forced
          console.log(
            `Creating fallback test data for user ${userId} (forced)`
          );
          const testModels = ["Stable Diffusion", "DALL-E", "Midjourney"];
          const now = Date.now();

          const fallbackData = testModels.flatMap((modelName) => [
            {
              modelName,
              imageCount: Math.floor(Math.random() * 20) + 5,
              timestamp: now,
              userId,
            },
            {
              modelName,
              imageCount: Math.floor(Math.random() * 15) + 3,
              timestamp: now - 24 * 60 * 60 * 1000,
              userId,
            },
          ]);

          return NextResponse.json(
            {
              success: true,
              data: fallbackData,
              message: "Using fallback test data due to error",
            },
            {
              headers: corsHeaders(),
            }
          );
        }

        // Return error information instead of fallback data
        return NextResponse.json(
          {
            success: false,
            data: [],
            error: `Error querying database: ${convexError.message || "Unknown error"}`,
          },
          {
            headers: corsHeaders(),
            status: 500,
          }
        );
      }
    } else {
      // Otherwise, get all data
      console.log("Querying Convex for all model usage data");
      result = await convex.query(api.modelUsage.getModelUsageData);
    }

    // Log a sample of the data being returned
    if (result.data && result.data.length > 0) {
      console.log("Sample data being returned:", result.data.slice(0, 2));
    }

    return NextResponse.json(
      {
        success: result.success,
        data: result.data || [],
        message: 'message' in result ? result.message : "",
        error: result.error,
      },
      {
        headers: corsHeaders(),
      }
    );
  } catch (error) {
    console.error("Error retrieving model usage data:", error);

    // Check if the request has a special query parameter to force test data
    const searchParams = request.nextUrl.searchParams;
    const forceTestData = searchParams.get("forceTestData") === "true";

    if (forceTestData) {
      // Create emergency fallback data only if test data is forced
      console.log("Creating emergency fallback data (forced)");
      const fallbackData = [
        {
          modelName: "Stable Diffusion",
          imageCount: 15,
          timestamp: Date.now(),
          userId: "emergency_fallback",
        },
        {
          modelName: "DALL-E",
          imageCount: 8,
          timestamp: Date.now() - 24 * 60 * 60 * 1000,
          userId: "emergency_fallback",
        },
      ];

      return NextResponse.json(
        {
          success: true,
          data: fallbackData,
          message: "Using emergency fallback data due to error",
          error:
            "Original error: " +
            (error instanceof Error ? error.message : String(error)),
        },
        {
          status: 200, // Return 200 with fallback data instead of 500
          headers: corsHeaders(),
        }
      );
    }

    // Return error information instead of fallback data
    return NextResponse.json(
      {
        success: false,
        data: [],
        error:
          "Error retrieving model usage data: " +
          (error instanceof Error ? error.message : String(error)),
      },
      {
        status: 500,
        headers: corsHeaders(),
      }
    );
  }
}

/**
 * POST handler to add new model usage data from the Electron app
 * This endpoint receives data from the local Electron app and stores it in the database
 */
export async function POST(request: NextRequest) {
  try {
    // Get the raw request body for debugging
    const rawBody = await request.text();
    console.log("Raw request body from Electron app:", rawBody);

    // Parse the JSON body
    let body;
    try {
      body = JSON.parse(rawBody);
    } catch (parseError) {
      console.error(
        "Error parsing request body from Electron app:",
        parseError
      );
      return NextResponse.json(
        { success: false, error: "Invalid JSON in request body" },
        { status: 400, headers: corsHeaders() }
      );
    }

    // Handle different possible data formats from the Electron app
    let modelName, imageCount, userId;

    // Check for standard format
    if (body.modelName && body.imageCount) {
      modelName = body.modelName;
      imageCount = body.imageCount;
    }
    // Check for alternative format that might be used by the Electron app
    else if (body.model && body.count) {
      modelName = body.model;
      imageCount = body.count;
    }
    // Check for array format (multiple entries)
    else if (Array.isArray(body)) {
      // Process each item in the array
      const results = [];
      let hasErrors = false;

      for (const item of body) {
        try {
          // Extract data from the item
          const itemModelName = item.modelName || item.model;
          const itemImageCount = item.imageCount || item.count;
          const itemUserId = item.userId || item.user_id || item.email;

          if (!itemModelName || !itemImageCount) {
            console.error("Invalid item in array:", item);
            results.push({
              success: false,
              error: "Invalid model data in array item",
              item,
            });
            hasErrors = true;
            continue;
          }

          // Add data to Convex
          const result = await convex.mutation(
            api.modelUsage.addModelUsageData,
            {
              modelName: itemModelName,
              imageCount: itemImageCount,
              userId:
                itemUserId ||
                request.headers.get("x-user-id") ||
                "unknown_user",
            }
          );

          results.push({
            success: true,
            data: result.data,
          });
        } catch (itemError) {
          console.error("Error processing array item:", itemError);
          results.push({
            success: false,
            error:
              itemError instanceof Error
                ? itemError.message
                : String(itemError),
          });
          hasErrors = true;
        }
      }

      // Return the results of processing the array
      return NextResponse.json(
        {
          success: !hasErrors,
          data: results,
        },
        {
          headers: corsHeaders(),
          status: 200,
        }
      );
    }
    // If we can't determine the format, return an error
    else {
      console.error("Unknown data format from Electron app:", body);
      return NextResponse.json(
        {
          success: false,
          error:
            "Unknown data format. Expected {modelName, imageCount} or {model, count} or an array of these formats.",
          receivedFormat: Object.keys(body),
        },
        { status: 400, headers: corsHeaders() }
      );
    }

    // Validate the extracted data
    if (!modelName || typeof modelName !== "string") {
      return NextResponse.json(
        { success: false, error: "Invalid model name" },
        { status: 400, headers: corsHeaders() }
      );
    }

    if (!imageCount || typeof imageCount !== "number" || imageCount <= 0) {
      return NextResponse.json(
        { success: false, error: "Invalid image count" },
        { status: 400, headers: corsHeaders() }
      );
    }

    // Get the user ID from various possible sources
    userId = body.userId || body.user_id || body.email;

    // If no userId in the body, try to get from headers
    if (!userId) {
      userId =
        request.headers.get("x-user-id") ||
        request.headers.get("x-email") ||
        request.headers.get("authorization");

      if (userId && userId.startsWith("Bearer ")) {
        // Extract user ID from token if available
        console.log("Found authorization header, trying to extract userId");
        // This is just a placeholder - in a real app you would decode the token
        userId = userId.replace("Bearer ", "");
      }
    }

    // If still no userId, use a default
    if (!userId) {
      userId = "unknown_user";
      console.log("No userId found, using default:", userId);
    }

    console.log("Processing model usage data from Electron app:", {
      modelName,
      imageCount,
      userId,
    });

    try {
      // Add data to Convex
      const result = await convex.mutation(api.modelUsage.addModelUsageData, {
        modelName,
        imageCount,
        userId,
      });

      // Log the result
      console.log("Successfully stored Electron app data in Convex:", {
        success: result.success,
        data: result.data,
      });

      return NextResponse.json(
        {
          success: result.success,
          data: result.data,
          message: 'message' in result ? result.message : "Data from Electron app successfully stored",
        },
        {
          headers: corsHeaders(),
          status: result.success ? 200 : 400,
        }
      );
    } catch (convexError: any) {
      console.error("Error storing Electron app data in Convex:", convexError);

      return NextResponse.json(
        {
          success: false,
          error:
            "Failed to store data: " +
            (convexError instanceof Error
              ? convexError.message
              : String(convexError)),
        },
        {
          headers: corsHeaders(),
          status: 500,
        }
      );
    }
  } catch (error) {
    console.error("Error processing Electron app request:", error);

    return NextResponse.json(
      {
        success: false,
        error:
          "Server error processing request: " +
          (error instanceof Error ? error.message : String(error)),
      },
      {
        headers: corsHeaders(),
        status: 500,
      }
    );
  }
}

/**
 * DELETE handler to clear all model usage data
 */
export async function DELETE() {
  try {
    // Clear data from Convex
    const result = await convex.mutation(api.modelUsage.clearModelUsageData);

    return NextResponse.json(
      {
        success: result.success,
        message: result.message || "All model usage data cleared",
        error: result.error,
      },
      {
        headers: corsHeaders(),
        status: result.success ? 200 : 400,
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