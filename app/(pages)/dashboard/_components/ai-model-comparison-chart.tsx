"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "@/app/(pages)/dashboard/_components/chart";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { format } from "date-fns";

// Define types for our data
interface ModelUsageData {
  date: Date;
  formattedDate: string;
  [modelName: string]: any;
}

export function AIModelComparisonChart() {
  const [chartData, setChartData] = useState<ModelUsageData[]>([]);
  const [isUsingSampleData, setIsUsingSampleData] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const modelUsageData = useQuery(api.modelUsage.getModelUsageData);

  useEffect(() => {
    console.log("modelUsageData:", modelUsageData);
    if (modelUsageData?.success && modelUsageData.data) {
      console.log("modelUsageData.data:", modelUsageData.data);
      // Process and organize data for the chart
      const processModelData = (modelMetrics: any[]) => {
        try {
          // Check if we have any real data
          const hasRealData = modelMetrics.length > 0;

          // If no real data, return empty array
          if (!hasRealData) {
            return [];
          }

          // Group data by date and model
          const groupedByDate = modelMetrics.reduce(
            (acc: any, metric: any) => {
              const date = new Date(metric.timestamp);
              const dateKey = format(date, "yyyy-MM-dd");

              if (!acc[dateKey]) {
                acc[dateKey] = {
                  date,
                  formattedDate: format(date, "MMM d"),
                };
              }

              // Add or increment the model count
              const modelName = metric.modelName;
              acc[dateKey][modelName] =
                (acc[dateKey][modelName] || 0) + metric.imageCount;

              return acc;
            },
            {} as Record<string, ModelUsageData>
          );

          // Convert to array and sort by date
          return Object.values(groupedByDate).sort(
            (a: any, b: any) => a.date.getTime() - b.date.getTime()
          );
        } catch (error) {
          console.error("Error processing model data:", error);
          return [];
        }
      };

      const processedData = processModelData(modelUsageData.data);
      setChartData(processedData.length > 0 ? processedData as ModelUsageData[] : []);
      setIsUsingSampleData(processedData.length === 0);
      setIsLoading(false);
    } else if (modelUsageData?.error) {
      setError(modelUsageData.error);
      setIsLoading(false);
    } else {
      setIsLoading(true);
    }
  }, [modelUsageData]);

  // Get unique model names from the data
  const modelNames =
    chartData.length > 0
      ? Object.keys(chartData[0]).filter(
          (key) => key !== "date" && key !== "formattedDate"
        )
      : [];

  // Generate a color for each model
  const getModelColor = (index: number) => {
    const colors = [
      "#ffffff",
      "#888888",
      "#aaaaaa",
      "#666666",
      "#cccccc",
      "#444444",
    ];
    return colors[index % colors.length];
  };

  return (
    <div className="w-full">
      {/* Status indicators */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {isLoading ? (
            <Badge
              variant="outline"
              className="bg-blue-500/10 text-blue-500 border-blue-500/20"
            >
              Loading...
            </Badge>
          ) : isUsingSampleData ? (
            <Badge
              variant="outline"
              className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
            >
              No Data Available
            </Badge>
          ) : (
            <Badge
              variant="outline"
              className="bg-green-500/10 text-green-500 border-green-500/20"
            >
              Using Real Data
            </Badge>
          )}

          {error && (
            <Badge
              variant="outline"
              className="bg-red-500/10 text-red-500 border-red-500/20"
            >
              Error: {error}
            </Badge>
          )}
        </div>
      </div>

      {/* Chart */}
      <div className="h-[300px] relative">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/50 z-10">
            <div className="flex flex-col items-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
              <div className="mt-2 text-sm text-muted-foreground">
                Loading data...
              </div>
            </div>
          </div>
        )}
        <Card className="h-[300px] relative p-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <XAxis
                dataKey="formattedDate"
                stroke="#888888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                padding={{ left: 10, right: 10 }}
                interval={4}
              />
              <YAxis
                stroke="#888888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `${value}`}
                width={30}
              />
              {modelNames.map((modelName, index) => (
                <Line
                  key={modelName}
                  type="monotone"
                  dataKey={modelName}
                  stroke={getModelColor(index)}
                  strokeWidth={2}
                  dot={{ r: 3, strokeWidth: 2 }}
                  activeDot={{ r: 5, strokeWidth: 2 }}
                />
              ))}
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    // Find the data point to get the full date
                    const dataPoint = chartData.find(
                      (d) => d.formattedDate === label
                    );
                    const fullDate =
                      dataPoint && dataPoint.date instanceof Date
                        ? format(dataPoint.date, "MMMM d, yyyy")
                        : label;

                    return (
                      <div className="bg-black/80 border border-gray-800 p-2">
                        <div className="text-sm text-white font-medium">
                          {fullDate}
                        </div>
                        {payload.map((entry, index) => (
                          <div
                            key={`item-${index}`}
                            className="flex items-center gap-2"
                          >
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: entry.color }}
                            />
                            <span className="text-gray-300">{entry.name}:</span>
                            <span className="text-white font-medium">
                              {entry.value} images
                            </span>
                          </div>
                        ))}
                      </div>
                    );
                  }
                  return null;
                }}
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </div>
  );
}
