import type React from "react"
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, type TooltipProps } from "recharts"

export { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis }

interface ChartTooltipProps extends TooltipProps<any, any> {
  className?: string
  children?: React.ReactNode
}

export function ChartTooltip({ className, children }: ChartTooltipProps) {
  return <div className={className}>{children}</div>
}
