import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";
export const runtime = 'nodejs';

// Create a Convex client for API routes
const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL || "");

// Helper function to add CORS headers
function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*", // You might want to restrict this to your app's domain in production
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, x-api-key",
    "Access-Control-Allow-Credentials": "true",
  };
}

// Function to verify API keys
async function verifyApiKey(request: Request) {
  const apiKey = request.headers.get("x-api-key");

  // Check against your stored API keys
  if (apiKey !== process.env.DESKTOP_API_KEY) {
    return false;
  }

  return true;
}

// Helper function to format date from timestamp
function formatDate(timestamp: number | undefined): string | null {
  if (!timestamp) return null;
  return new Date(timestamp).toISOString();
}

// Handle OPTIONS requests for CORS preflight
export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: corsHeaders(),
  });
}

export async function GET(request: NextRequest) {
  // Verify API key first
  if (!(await verifyApiKey(request))) {
    return NextResponse.json(
      {
        error: "unauthorized",
        message: "Invalid API key",
      },
      {
        status: 401,
        headers: corsHeaders(),
      }
    );
  }

  try {
    // Get email from query parameters
    const searchParams = request.nextUrl.searchParams;
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json(
        {
          error: "bad_request",
          message: "Email parameter is required",
        },
        {
          status: 400,
          headers: corsHeaders(),
        }
      );
    }

    try {
      // Find user by email in the database
      const users = await convex.query(api.users.getAllUsers);
      const user = users.find((u: any) => u.email === email);

      if (!user) {
        return NextResponse.json(
          {
            isAuthenticated: false,
            hasActiveSubscription: false,
            email: email,
            message: "User not found",
          },
          {
            status: 200,
            headers: corsHeaders(),
          }
        );
      }

      // Check if the user has an active subscription and get subscription details
      const subscriptions = await convex.query(
        api.subscriptions.getAllSubscriptions
      );
      const userSubscription = subscriptions.find(
        (s: any) => s.userId === user.tokenIdentifier
      );
      const hasActiveSubscription = userSubscription?.status === "active";

      // Prepare subscription details
      const subscriptionDetails = userSubscription
        ? {
            status: userSubscription.status,
            renewalDate: formatDate(userSubscription.currentPeriodEnd),
            amount: userSubscription.amount,
            currency: userSubscription.currency || "USD",
            interval: userSubscription.interval || "unknown", // monthly or yearly
            startedAt: formatDate(userSubscription.startedAt),
            cancelAtPeriodEnd: userSubscription.cancelAtPeriodEnd || false,
          }
        : null;

      // Prepare user profile information
      const userProfile = {
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
        image: user.image,
      };

      // Return enhanced user status with subscription details and profile
      return NextResponse.json(
        {
          isAuthenticated: true,
          hasActiveSubscription: hasActiveSubscription,
          email: user.email,
          userId: user.tokenIdentifier,
          subscription: subscriptionDetails,
          profile: userProfile,
        },
        {
          status: 200,
          headers: corsHeaders(),
        }
      );
    } catch (convexError: any) {
      console.error("Convex API error:", convexError);

      return NextResponse.json(
        {
          error: "convex_api_error",
          message: "Error fetching data from Convex",
          details: convexError.message || "Unknown error",
        },
        {
          status: 500,
          headers: corsHeaders(),
        }
      );
    }
  } catch (error: any) {
    console.error("Error checking session:", error);

    return NextResponse.json(
      {
        error: "server_error",
        message: "Failed to check session",
        details: error.message || "Unknown error",
      },
      {
        status: 500,
        headers: corsHeaders(),
      }
    );
  }
}