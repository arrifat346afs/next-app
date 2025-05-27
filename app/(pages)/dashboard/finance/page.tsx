"use client"
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/clerk-react";
import { useAction, useQuery } from "convex/react";
import {
  CreditCard,
  Database, Settings,
  Users, BarChart,
  Image
} from "lucide-react";
import { UserModelUsageChart } from "../_components/user-model-usage-chart";
import { Progress } from "@/components/ui/progress";

export default function FinancePage() {
  const { user } = useUser();

  const userData = useQuery(api.users.getUserByToken,
    user?.id ? { tokenIdentifier: user.id } : "skip"
  );

  const subscription = useQuery(api.subscriptions.getUserSubscription);
  const getDashboardUrl = useAction(api.subscriptions.getUserDashboardUrl);

  // Check if user is on free tier:
  // - No subscription
  // - Subscription amount is 0
  // - Subscription status is not active
  const isFreeUser = !subscription ||
    subscription.amount === 0 ||
    subscription.status !== 'active';

  // Only free users have a limit
  const FREE_USER_LIMIT = 100;

  const currentImageCount = useQuery(api.modelUsage.getCurrentImageCount,
    user?.id ? { userId: user.id } : "skip"
  ) ?? 0;

  const handleManageSubscription = async () => {
    try {
      const result = await getDashboardUrl({
        customerId: subscription?.customerId!
      });
      if (result?.url) {
        window.location.href = result.url;
      }
    } catch (error) {
      console.error("Error getting dashboard URL:", error);
    }
  };

  // Helper function to format the usage display
  const formatUsageDisplay = () => {
    if (!isFreeUser) {
      return `${currentImageCount} / Unlimited`;
    }
    return `${currentImageCount} / ${FREE_USER_LIMIT}`;
  };

  // Helper function to calculate progress percentage for free users
  const calculateProgress = () => {
    if (!isFreeUser) return 0; // No progress bar for pro users
    return Math.min((currentImageCount / FREE_USER_LIMIT) * 100, 100);
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Account Overview</h1>
        <p className="text-muted-foreground mt-2">
          Manage your account and subscription details.
        </p>

      </div>

      {/* Account Information Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* User Information Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              User Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!user ? (
              <div className="space-y-4">
                <Skeleton className="h-4 w-[250px]" />
                <Skeleton className="h-4 w-[200px]" />
                <Skeleton className="h-4 w-[180px]" />
                <Skeleton className="h-4 w-[300px]" />
              </div>
            ) : (
              <div className="grid gap-4">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Name:</span>
                  <span className="font-medium">{user?.firstName} {user?.lastName}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Email:</span>
                  <span className="font-medium">{user?.primaryEmailAddress?.emailAddress}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Created:</span>
                  <span className="font-medium">{new Date(user?.createdAt || "").toLocaleDateString()}</span>
                </div>
                <div className="space-y-1 flex justify-between">
                  <span className="text-muted-foreground">User ID:</span>
                  <span className="block font-medium text-sm break-all">{user?.id}</span>
                </div>
                <div className="space-y-2 pt-2 border-t">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground flex items-center gap-2">
                      <Image className="h-4 w-4" />
                      Image Processing
                    </span>
                    <span className="font-medium">{formatUsageDisplay()}</span>
                  </div>
                  {isFreeUser && (
                    <>
                      <Progress
                        value={calculateProgress()}
                        className="h-2"
                      />
                      {currentImageCount >= FREE_USER_LIMIT && (
                        <p className="text-sm text-red-500">
                          You've reached your image processing limit. Upgrade to Pro for unlimited processing.
                        </p>
                      )}
                    </>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Subscription Details Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Subscription Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!subscription ? (
              <div className="space-y-4">
                <Skeleton className="h-4 w-[180px]" />
                <Skeleton className="h-4 w-[150px]" />
                <Skeleton className="h-4 w-[200px]" />
                <Skeleton className="h-4 w-[170px]" />
              </div>
            ) : isFreeUser ? (
              <div className="grid gap-4">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Plan:</span>
                  <span className="font-medium">Free Plan</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Status:</span>
                  <span className="font-medium">Active</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Features:</span>
                  <span className="font-medium">Basic Access</span>
                </div>
                <div className="border-t pt-4 mt-2">
                  <p className="text-sm text-muted-foreground mb-4">
                    Upgrade to Pro to unlock unlimited image processing, priority support, and advanced features.
                  </p>
                  <Button className="w-full" onClick={() => window.location.href = '/pricing'}>
                    Upgrade to Pro
                  </Button>
                </div>
              </div>
            ) : (
              <div className="grid gap-4">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Status:</span>
                  <span className="font-medium capitalize">{subscription?.status}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Plan Amount:</span>
                  <span className="font-medium">${(subscription?.amount! / 100).toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Billing Interval:</span>
                  <span className="font-medium capitalize">{subscription?.interval}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Next Billing:</span>
                  <span className="font-medium">{new Date(subscription?.currentPeriodEnd!).toLocaleDateString()}</span>
                </div>
                <Button className="mt-3" onClick={handleManageSubscription}>Manage Subscription</Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* User Model Usage Chart */}
      {user && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart className="h-5 w-5" />
              Your Model Usage
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[350px]">
            {!user ? (
              <div className="space-y-4 h-full flex items-center justify-center">
                <Skeleton className="h-[300px] w-full" />
              </div>
            ) : (
              <UserModelUsageChart userId={user.id} />
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}