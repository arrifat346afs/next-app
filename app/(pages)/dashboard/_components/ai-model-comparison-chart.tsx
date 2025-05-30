"use client";

import React, { useState, useEffect } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";

// Define types for our data
interface ModelUsageData {
  date: Date;
  formattedDate: string;
  [modelName: string]: any;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
}

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className=" rounded-lg  shadow-xl">
        <Card className="p-4">
          <p className="text-sm text-gray-400 mb-2">{label}</p>
          <div className="space-y-2">
            {payload.map((entry, index) => (
              <div key={index} className="flex items-center gap-2">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-sm text-gray-300">
                  {entry.name}: {entry.value} images
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    );
  }
  return null;
};

// Function to generate consistent colors based on model name
const getModelColor = (modelName: string) => {
  // Pre-defined color palette
  const colorPalette = [
    "#77b8a1", // Sage Green
    "#a995c9", // Lavender
    "#f4a261", // Sandy Brown
    "#e76f51", // Burnt Sienna
    "#2a9d8f", // Persian Green
    "#e9c46a", // Orange Yellow Crayola
    "#264653", // Charcoal
    "#bc6c25", // Brown
  ];

  // Get a consistent index for the model name by summing char codes
  const charSum = modelName.split("").reduce(
    (sum, char) => sum + char.charCodeAt(0),
    0
  );
  const colorIndex = charSum % colorPalette.length;

  return colorPalette[colorIndex];
};

export function AIModelComparisonChart() {
  const [chartData, setChartData] = useState<ModelUsageData[]>([]);
  const [modelNames, setModelNames] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const modelUsageData = useQuery(api.modelUsage.getModelUsageData);

  useEffect(() => {
    if (modelUsageData?.success && modelUsageData.data) {
      const processModelData = (modelMetrics: any[]) => {
        try {
          if (!modelMetrics || modelMetrics.length === 0) {
            setError("No data available");
            return [];
          }

          const uniqueModelNames = new Set<string>();
          modelMetrics.forEach((metric) => {
            uniqueModelNames.add(metric.modelName);
          });

          const groupedByDate = modelMetrics.reduce((acc: any, metric: any) => {
            const date = new Date(metric.timestamp);
            const dateKey = format(date, "yyyy-MM-dd");

            if (!acc[dateKey]) {
              acc[dateKey] = {
                date,
                formattedDate: format(date, "MMM d"),
                ...Array.from(uniqueModelNames).reduce((obj, name) => {
                  return {
                    ...obj,
                    [name]: 0,
                  };
                }, {}),
              };
            }

            acc[dateKey][metric.modelName] += metric.imageCount;
            return acc;
          }, {});

          const sortedData = (
            Object.values(groupedByDate) as ModelUsageData[]
          ).sort((a, b) => a.date.getTime() - b.date.getTime());

          setModelNames(Array.from(uniqueModelNames));
          return sortedData;
        } catch (error) {
          console.error("Error processing model data:", error);
          setError("Error processing data");
          return [];
        }
      };

      const processedData = processModelData(modelUsageData.data);
      setChartData(processedData);
      setIsLoading(false);
    } else if (modelUsageData?.error) {
      setError(modelUsageData.error);
      setIsLoading(false);
    }
  }, [modelUsageData]);

  if (isLoading) {
    return (
      <Card className="col-span-4">
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-[400px]">
            <p className="text-gray-400">Loading data...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="col-span-4">
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-[400px]">
            <p className="text-red-400">Error: {error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Calculate the maximum value from the data for the YAxis domain
  const maxValue = Math.max(
    ...chartData.flatMap((data) =>
      Object.entries(data)
        .filter(([key]) => key !== "date" && key !== "formattedDate")
        .map(([, value]) => value)
    )
  );

  // Round up to the nearest multiple of 55 for nice tick values
  const yAxisMax = Math.ceil(maxValue / 55) * 55;

  return (
    <Card>
      <CardHeader>
        <CardTitle>AI Model Usage Comparison</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
            >
              <defs>
                {modelNames.map((name) => (
                  <linearGradient
                    key={`gradient-${name}`}
                    id={`gradient-${name}`}
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="5%"
                      stopColor={getModelColor(name)}
                      stopOpacity={0.3}
                    />
                    <stop
                      offset="95%"
                      stopColor={getModelColor(name)}
                      stopOpacity={0}
                    />
                  </linearGradient>
                ))}
              </defs>
              <XAxis
                dataKey="formattedDate"
                stroke="#4a4b4d"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="#4a4b4d"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `${value}`}
                domain={[0, yAxisMax]}
                ticks={Array.from({ length: 5 }, (_, i) => (i * yAxisMax) / 4)}
              />
              <Tooltip content={<CustomTooltip />} />
              {modelNames.map((modelName) => (
                <Area
                  key={modelName}
                  type="linear"
                  dataKey={modelName}
                  name={modelName}
                  stroke={getModelColor(modelName)}
                  fill={`url(#gradient-${modelName})`}
                  strokeWidth={2}
                  fillOpacity={1}
                  dot={{
                    r: 4,
                    fill: getModelColor(modelName),
                    strokeWidth: 0,
                  }}
                />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
