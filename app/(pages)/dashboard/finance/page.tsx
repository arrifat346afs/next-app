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
  Users, BarChart
} from "lucide-react";
import { UserModelUsageChart } from "../_components/user-model-usage-chart";

export default function FinancePage() {
  const { user } = useUser();

  const userData = useQuery(api.users.getUserByToken,
    user?.id ? { tokenIdentifier: user.id } : "skip"
  );

  const subscription = useQuery(api.subscriptions.getUserSubscription);
  const getDashboardUrl = useAction(api.subscriptions.getUserDashboardUrl);

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
                <div className="space-y-1">
                  <span className="text-muted-foreground">User ID:</span>
                  <span className="block font-medium text-sm break-all">{user?.id}</span>
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