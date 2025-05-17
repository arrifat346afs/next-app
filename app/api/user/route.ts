import { auth } from "@clerk/nextjs/server";
import { api } from "@/convex/_generated/api";
import { fetchQuery } from "convex/nextjs";
import { getAuthToken } from "@/lib/auth";

export async function GET(_request: Request) {
  try {
    // Get the user ID from Clerk auth
    const { userId } = await auth();

    if (!userId) {
      return new Response(
        JSON.stringify({
          error: "unauthorized",
          message: "User is not authenticated",
        }),
        {
          status: 401,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    try {
      // Get the Convex auth token
      const token = await getAuthToken();

      if (!token) {
        return new Response(
          JSON.stringify({
            error: "token_error",
            message: "Failed to generate Convex authentication token",
          }),
          {
            status: 401,
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
      }

      // Fetch user subscription data from Convex
      const subscription = await fetchQuery(
        api.subscriptions.getUserSubscription,
        {},
        {
          token,
        }
      );

      // Fetch user data from Convex
      const userData = await fetchQuery(
        api.users.getUserByToken,
        {
          tokenIdentifier: userId,
        },
        {
          token,
        }
      );

      // Return the combined data
      return new Response(
        JSON.stringify({
          userId,
          user: userData,
          subscription,
          hasActiveSubscription: subscription?.status === "active",
        }),
        {
          status: 200,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    } catch (convexError: any) {
      console.error("Convex API error:", convexError);

      return new Response(
        JSON.stringify({
          error: "convex_api_error",
          message: "Error fetching data from Convex",
          details: convexError.message || "Unknown error",
        }),
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }
  } catch (error: any) {
    console.error("Error in user API route:", error);

    return new Response(
      JSON.stringify({
        error: "server_error",
        message: "An unexpected error occurred",
        details: error.message || "Unknown error",
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    console.log("Received data:", data);

    return new Response(
      JSON.stringify({ message: "Data received successfully" }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error: any) {
    console.error("Error processing POST request:", error);
    return new Response(
      JSON.stringify({
        error: "server_error",
        message: "Failed to process data",
        details: error.message || "Unknown error",
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
}
