"use client";

import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";
import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "@/app/(pages)/dashboard/_components/chart";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL || "");
// import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { useEffect, useState, useRef, useCallback } from "react";

// Define types for our data
interface ModelUsageData {
  date: Date;
  formattedDate: string;
  [modelName: string]: any;
}

// Standard format for model metrics
interface ModelMetric {
  modelName: string;
  imageCount: number;
  timestamp: number; // Unix timestamp
  userId?: string;
}

// Alternative format that might be used by the Electron app
interface ElectronAppModelMetric {
  model?: string; // Alternative to modelName
  count?: number; // Alternative to imageCount
  date?: string | number; // Alternative to timestamp
  user_id?: string; // Alternative to userId
  email?: string; // Alternative user identifier
}

// Combined type to handle both formats
type AnyModelMetric = ModelMetric | ElectronAppModelMetric;

interface ApiResponse {
  success: boolean;
  data?: AnyModelMetric[] | AnyModelMetric;
  message?: string;
  error?: string;
}

interface UserModelUsageChartProps {
  userId: string;
}

export function UserModelUsageChart({ userId }: UserModelUsageChartProps) {
  const [chartData, setChartData] = useState<ModelUsageData[]>([]);
  const [isUsingSampleData, setIsUsingSampleData] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [modelNames, setModelNames] = useState<string[]>([]);
  const hasInitializedRef = useRef(false);

  // Process and organize data for the chart - enhanced with better debugging and data format handling
  const processModelData = useCallback((modelMetrics: ModelMetric[]) => {
    try {
      console.log("Processing model metrics, count:", modelMetrics.length);

      // Log the first few metrics for debugging
      if (modelMetrics.length > 0) {
        console.log("Sample metrics:", modelMetrics.slice(0, 3));
      }

      // If no data, return empty array
      if (!modelMetrics || modelMetrics.length === 0) {
        console.log("No data to process");
        return [];
      }

      // Create a map to store data by date
      const dataByDate: Record<string, ModelUsageData> = {};

      // Track all model names we encounter
      const allModelNames = new Set<string>();

      // Process each metric
      modelMetrics.forEach((metric) => {
        // Handle different possible data formats
        let modelName = metric.modelName;
        let imageCount = metric.imageCount;
        let timestamp = metric.timestamp;

        // Check if the data might be in a different format (from your application)
        if (!modelName && "model" in metric) {
          // @ts-ignore - Handle potential different format from your application
          modelName = metric.model;
        }

        if (!imageCount && "count" in metric) {
          // @ts-ignore - Handle potential different format from your application
          imageCount = metric.count;
        }

        if (!timestamp && "date" in metric) {
          // @ts-ignore - Handle potential different format from your application
          timestamp = new Date(metric.date).getTime();
        }

        // Skip invalid metrics
        if (!modelName || !timestamp || !imageCount) {
          console.log("Skipping invalid metric:", metric);
          return;
        }

        // Add this model name to our set
        allModelNames.add(modelName);

        // Convert timestamp to date
        const date = new Date(timestamp);
        const dateKey = format(date, "yyyy-MM-dd");

        // Create entry for this date if it doesn't exist
        if (!dataByDate[dateKey]) {
          dataByDate[dateKey] = {
            date,
            formattedDate: format(date, "MMM d"),
          };
        }

        // Add or increment the count for this model on this date
        const currentCount = dataByDate[dateKey][modelName] || 0;
        dataByDate[dateKey][modelName] = currentCount + imageCount;
      });

      // Convert to array and sort by date
      const sortedData = Object.values(dataByDate).sort(
        (a, b) => a.date.getTime() - b.date.getTime()
      );

      // Convert model names set to array
      const modelNamesArray = Array.from(allModelNames);

      console.log("Processed data:", {
        dateCount: sortedData.length,
        modelCount: modelNamesArray.length,
        models: modelNamesArray,
        firstDate: sortedData[0]?.formattedDate,
        lastDate: sortedData[sortedData.length - 1]?.formattedDate,
      });

      // Log the processed data structure for debugging
      if (sortedData.length > 0) {
        console.log("First processed data entry:", sortedData[0]);
      }

      // Set model names state
      setModelNames(modelNamesArray);

      return sortedData;
    } catch (error) {
      console.error("Error processing model data:", error);
      return [];
    }
  }, []);

  // Generate empty data for the chart when no real data is available
  const generateEmptyData = useCallback((): ModelUsageData[] => {
    const emptyData: ModelUsageData[] = [];
    const today = new Date();

    // Generate data for the last 7 days
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      emptyData.push({
        date,
        formattedDate: format(date, "MMM d"),
      });
    }

    return emptyData;
  }, []);

  // Fetch data from the API - enhanced with better debugging and error handling
  const fetchModelData = useCallback(async () => {
    // Prevent multiple fetches
    if (isLoading) return;

    try {
      setIsLoading(true);
      setError(null);

      console.log("Fetching user data directly from Convex with userId:", userId);

      const result = await convex.query(api.modelUsage.getUserModelUsageData, {
        userId: userId,
      });

      console.log("Convex query result:", result);

      if (!result.success) {
        throw new Error(result.error || "Failed to fetch model data");
      }

      // Ensure we have an array of data
      const data = Array.isArray(result.data) ? result.data : [];
      console.log(`Received ${data.length} data points from Convex`);

      // Log first few items if available
      if (data.length > 0) {
        console.log("Sample data items:", data.slice(0, 3));
        console.log(
          "Data structure check - first item properties:",
          Object.keys(data[0])
        );
      }

      // If no data, use empty data
      if (data.length === 0) {
        console.log("No data received from Convex, using empty data");
        setChartData(generateEmptyData());
        setIsUsingSampleData(true);
        setLastUpdated(new Date());
        return [];
      }

      // Convert ElectronAppModelMetric to ModelMetric
      const convertedData: ModelMetric[] = data.map((item: AnyModelMetric) => {
        if ("model" in item && "count" in item && "date" in item) {
          return {
            modelName: item.model || "unknown",
            imageCount: item.count || 0,
            timestamp: typeof item.date === 'string' ? new Date(item.date).getTime() : (typeof item.date === 'number' ? item.date : 0),
          };
        }
        return item as ModelMetric;
      });

      // Process the data
      const processedData = processModelData(convertedData);

      // Check if we have valid processed data
      if (processedData.length > 0) {
        console.log(
          `Using real data: ${processedData.length} data points for ${modelNames.length} models`
        );
        setChartData(processedData);
        setIsUsingSampleData(false);
      } else {
        console.log("Processed data invalid, using empty data");
        setChartData(generateEmptyData());
        setIsUsingSampleData(true);
      }

      setLastUpdated(new Date());

      return processedData;
    } catch (error) {
      console.error("Error fetching user model data from Convex:", error);
      setError(error instanceof Error ? error.message : "Unknown error");
      setChartData(generateEmptyData());
      setIsUsingSampleData(true);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [generateEmptyData, processModelData, isLoading, userId, modelNames]);

  // Get color for model line
  const getModelColor = useCallback((index: number) => {
    const colors = [
      "#2563eb", // blue-600
      "#16a34a", // green-600
      "#dc2626", // red-600
      "#9333ea", // purple-600
      "#ea580c", // orange-600
      "#0891b2", // cyan-600
      "#4f46e5", // indigo-600
      "#db2777", // pink-600
    ];
    return colors[index % colors.length];
  }, []);

  // Set up initial data fetch - only once
  useEffect(() => {
    // Only fetch data once when the component mounts or userId changes
    if (!hasInitializedRef.current) {
      hasInitializedRef.current = true;

      // Initial data fetch
      fetchModelData();

      // Expose refresh function to window for manual refresh
      // @ts-ignore
      window.refreshUserModelData = fetchModelData;

      return () => {
        // Clean up
        // @ts-ignore
        delete window.refreshUserModelData;
      };
    }
  }, [fetchModelData]);



  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">

          {lastUpdated && !isUsingSampleData && (
            <span className="text-xs text-muted-foreground">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </span>
          )}
        </div>
      </div>

      <div className="relative h-[300px] w-full">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/50 z-10">
            <div className="text-sm text-muted-foreground">Loading data...</div>
          </div>
        )}

        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/50 z-10">
            <div className="text-sm text-red-500">Error: {error}</div>
          </div>
        )}



        <ResponsiveContainer width="100%" height="100%">
          {modelNames.length > 0 && chartData.length > 0 ? (
            <LineChart
              data={chartData}
              onMouseEnter={() => {
                console.log("Chart data being rendered:", chartData);
                console.log("Model names being rendered:", modelNames);

                // Additional debugging to check if data has the expected properties
                if (chartData.length > 0) {
                  const firstItem = chartData[0];
                  console.log(
                    "First chart data item keys:",
                    Object.keys(firstItem)
                  );

                  // Check if model names exist as properties in the data
                  modelNames.forEach((model) => {
                    console.log(
                      `Model ${model} exists in data:`,
                      model in firstItem
                    );
                  });
                }
              }}
            >
              <XAxis
                dataKey="formattedDate"
                stroke="#888888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                padding={{ left: 10, right: 10 }}
              />
              <YAxis
                stroke="#888888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `${value}`}
                width={30}
              />
              {/* Render a line for each model */}
              {modelNames.map((modelName, index) => {
                // Check if any data point has this model
                const hasData = chartData.some(
                  (item) => item[modelName] !== undefined
                );

                if (!hasData) {
                  console.warn(`No data points found for model: ${modelName}`);
                }

                return (
                  <Line
                    key={modelName}
                    type="monotone"
                    dataKey={modelName}
                    name={modelName}
                    stroke={getModelColor(index)}
                    strokeWidth={2}
                    dot={{ r: 3, strokeWidth: 2 }}
                    activeDot={{ r: 5, strokeWidth: 2 }}
                  />
                );
              })}
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    // Find the date object for this label
                    const dateItem = chartData.find(
                      (d) => d.formattedDate === label
                    );
                    const fullDate = dateItem
                      ? new Date(dateItem.date).toLocaleDateString()
                      : label;

                    return (
                      <div className="bg-black/80 border border-gray-800 p-2 rounded">
                        <div className="text-sm text-white font-medium mb-1">
                          {fullDate}
                        </div>
                        {payload.map((entry, index) => (
                          <div
                            key={`item-${index}`}
                            className="flex items-center gap-2 py-1"
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
          ) : (
            <div className="flex items-center justify-center h-full w-full text-gray-400">
              No data available to display
            </div>
          )}
        </ResponsiveContainer>
      </div>

      {isUsingSampleData && (
        <div className="mt-2 text-xs text-muted-foreground text-center">
          No model usage data available for your account.
        </div>
      )}

    </div>
  );
}
