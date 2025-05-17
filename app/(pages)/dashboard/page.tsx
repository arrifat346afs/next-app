"use client";
import { AIModelComparisonChart } from "./_components/ai-model-comparison-chart";
import AppDownload from "./_components/app-download";


export const runtime = "edge";
export default function Dashboard() {
  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Welcome to your dashboard overview.
        </p>
      </div>
      <div>
        <AIModelComparisonChart />
      </div>

      <div className="flex items-center justify-center w-full">
        <AppDownload />
      </div>
    </div>
  );
}
