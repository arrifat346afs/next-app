"use client";

import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "@/app/(pages)/dashboard/_components/chart";
// import { ChartTooltip } from "@/components/ui/chart";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { useEffect, useState, useRef } from "react";

// Define types for our data
interface ModelUsageData {
  date: Date;
  formattedDate: string;
  [modelName: string]: any;
}

interface ModelMetric {
  modelName: string;
  imageCount: number;
  timestamp: number; // Unix timestamp
}

interface ApiResponse {
  success: boolean;
  data?: ModelMetric[];
  error?: string;
}

export function AIModelComparisonChart() {
  const [chartData, setChartData] = useState<ModelUsageData[]>([]);
  const [isUsingSampleData, setIsUsingSampleData] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [dataReceived, setDataReceived] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const notificationTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch data from the API
  const fetchModelData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Use the full URL with localhost for development
      const apiUrl =
        process.env.NODE_ENV === "development"
          ? "http://localhost:3000/api/model-usage"
          : "/api/model-usage";

      console.log("Fetching data from:", apiUrl);

      const response = await fetch(apiUrl, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        // Include credentials for cookies if needed
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      const result: ApiResponse = await response.json();

      if (!result.success || !result.data) {
        throw new Error(result.error || "Failed to fetch model data");
      }

      console.log("Received data:", result.data);

      // Process the data for the chart
      const processedData = processModelData(result.data);
      setChartData(
        processedData.length > 0 ? processedData : generateEmptyData()
      );
      setIsUsingSampleData(processedData.length === 0);
      setLastUpdated(new Date());

      return processedData;
    } catch (error) {
      console.error("Error fetching model data:", error);
      setError(error instanceof Error ? error.message : "Unknown error");
      setChartData(generateEmptyData());
      setIsUsingSampleData(true);
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  // Process and organize data for the chart
  const processModelData = (modelMetrics: ModelMetric[]) => {
    try {
      // Check if we have any real data
      const hasRealData = modelMetrics.length > 0;

      // If no real data, return empty array
      if (!hasRealData) {
        return [];
      }

      // Group data by date and model
      const groupedByDate = modelMetrics.reduce(
        (acc, metric) => {
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
        (a, b) => a.date.getTime() - b.date.getTime()
      );
    } catch (error) {
      console.error("Error processing model data:", error);
      return [];
    }
  };

  // Generate empty data with a message
  const generateEmptyData = () => {
    return [
      {
        date: new Date(),
        formattedDate: "No Data",
        "No Data Available": 0,
      },
    ];
  };

  // Function to add new data via API
  const addModelData = async (modelName: string, imageCount: number) => {
    try {
      // Use the full URL with localhost for development
      const apiUrl =
        process.env.NODE_ENV === "development"
          ? "http://localhost:3000/api/model-usage"
          : "/api/model-usage";

      console.log("Sending data to:", apiUrl, { modelName, imageCount });

      // Send data to API
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          modelName,
          imageCount,
        }),
        // Include credentials for cookies if needed
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || "Failed to add model data");
      }

      console.log("Data added successfully:", result.data);

      // Update states
      setLastUpdated(new Date());
      setDataReceived(true);
      setIsUsingSampleData(false);

      // Show notification for a few seconds
      if (notificationTimeoutRef.current) {
        clearTimeout(notificationTimeoutRef.current);
      }

      notificationTimeoutRef.current = setTimeout(() => {
        setDataReceived(false);
      }, 3000);

      // Refresh data from API
      fetchModelData();
    } catch (error) {
      console.error("Error adding model data:", error);
      setError(error instanceof Error ? error.message : "Unknown error");
    }
  };

  // Clear all data (for testing purposes)
  const clearAllData = async () => {
    try {
      // Use the full URL with localhost for development
      const apiUrl =
        process.env.NODE_ENV === "development"
          ? "http://localhost:3000/api/model-usage"
          : "/api/model-usage";

      console.log("Clearing data from:", apiUrl);

      const response = await fetch(apiUrl, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        // Include credentials for cookies if needed
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || "Failed to clear model data");
      }

      console.log("Data cleared successfully");

      setChartData(generateEmptyData());
      setIsUsingSampleData(true);
      setLastUpdated(null);
      setError(null);
    } catch (error) {
      console.error("Error clearing model data:", error);
      setError(error instanceof Error ? error.message : "Unknown error");
    }
  };

  // Set up polling and expose API functions
  useEffect(() => {
    // Expose functions to window object for external applications
    // @ts-ignore
    window.addAIModelData = addModelData;
    // @ts-ignore
    window.clearAIModelData = clearAllData;

    // Initial data fetch
    fetchModelData();

    // 60minits
    pollingIntervalRef.current = setInterval(() => {
      fetchModelData();
    }, 300000);

    // Set up event listener for messages from desktop app
    const handleExternalData = (event: MessageEvent) => {
      if (event.data && event.data.type === "ai-model-data") {
        const { modelName, imageCount } = event.data;
        addModelData(modelName, imageCount);
      }
    };

    window.addEventListener("message", handleExternalData);

    return () => {
      // Clean up
      // @ts-ignore
      delete window.addAIModelData;
      // @ts-ignore
      delete window.clearAIModelData;
      window.removeEventListener("message", handleExternalData);

      if (notificationTimeoutRef.current) {
        clearTimeout(notificationTimeoutRef.current);
      }

      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, []);

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

          {dataReceived && (
            <Badge
              variant="outline"
              className="bg-blue-500/10 text-blue-500 border-blue-500/20 animate-pulse"
            >
              New Data Received!
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

        {lastUpdated && (
          <div className="text-xs text-muted-foreground">
            Last updated: {format(lastUpdated, "MMM d, yyyy HH:mm:ss")}
          </div>
        )}
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
      </div>



      {/* Testing controls - only visible in development */}
      {process.env.NODE_ENV === "development" && (
        <div className="mt-4 p-2 border border-dashed rounded-md">
          <div className="text-xs font-medium mb-2">
            Development Testing Controls
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() =>
                addModelData("DALL-E", Math.floor(Math.random() * 30) + 1)
              }
              className="px-2 py-1 text-xs bg-blue-500 text-white rounded-md"
            >
              Add DALL-E Data
            </button>
            <button
              onClick={() =>
                addModelData("Midjourney", Math.floor(Math.random() * 40) + 1)
              }
              className="px-2 py-1 text-xs bg-blue-500 text-white rounded-md"
            >
              Add Midjourney Data
            </button>
            <button
              onClick={clearAllData}
              className="px-2 py-1 text-xs bg-red-500 text-white rounded-md"
            >
              Clear All Data
            </button>
            <button
              onClick={fetchModelData}
              className="px-2 py-1 text-xs bg-green-500 text-white rounded-md"
            >
              Refresh Data
            </button>
          </div>

          <div className="mt-2 text-xs">
            <p>API Endpoints:</p>
            <ul className="list-disc pl-5">
              <li>
                <code>GET /api/model-usage</code> - Fetch all model usage data
              </li>
              <li>
                <code>POST /api/model-usage</code> - Add new model usage data
              </li>
              <li>
                <code>DELETE /api/model-usage</code> - Clear all model usage
                data
              </li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
