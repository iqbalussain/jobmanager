import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import React from "react";
interface DailyTrendsChartProps {
  dailyJobData: Array<{
    day: string;
    jobs: number;
  }>;
  isLoading: boolean;
}
export function DailyTrendsChart({
  dailyJobData,
  isLoading
}: DailyTrendsChartProps) {
  console.log("[DailyTrendsChart] dailyJobData:", dailyJobData, "isLoading:", isLoading);
  const noData = !isLoading && (!dailyJobData || dailyJobData.length === 0);

  // Neon Laser Colors
  const neonColor = "#21f6ff";
  const neonShadow = "#0fffc3";
  const dotGlow = "#8ef9db";
  return <Card className="shadow-xl border-0 bg-gradient-to-br from-violet-900 to-violet-800 text-white">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white text-base sm:text-lg md:text-2xl">
          <Activity className="w-5 h-5 text-yellow-400" />
          Daily Job Creation Trends
        </CardTitle>
      </CardHeader>
      <CardContent className="h-[320px] md:-bottom-100relative">
        {/* Neon SVG filter */}
        <svg width="0" height="0">
          <filter id="neon-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor={neonShadow} />
            <feDropShadow dx="0" dy="0" stdDeviation="7" floodColor={neonColor} />
          </filter>
        </svg>
        {isLoading ? <div className="flex items-center justify-center h-[300px]">
            <div className="text-white">Loading chart data...</div>
          </div> : noData ? <div className="flex items-center justify-center h-[300px]">
            <div className="text-white opacity-80 text-center">
              No job order data found for the past week.
              <br />
              <span className="text-xs opacity-70">Please check if job orders exist in your database.</span>
            </div>
          </div> : <ResponsiveContainer width="100%" height={300}>
            <LineChart data={dailyJobData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#5eead4" />
              <XAxis dataKey="day" stroke="#E5E7EB" tick={{
            fill: "#23f4ff",
            fontWeight: 600
          }} />
              <YAxis stroke="#E5E7EB" tick={{
            fill: "#23f4ff",
            fontWeight: 600
          }} />
              <Tooltip contentStyle={{
            backgroundColor: "#072726",
            border: `1.5px solid ${neonColor}`,
            borderRadius: "12px",
            boxShadow: `0 0 40px 4px ${neonShadow}`,
            color: "#21f6ff"
          }} labelStyle={{
            color: neonColor,
            fontWeight: "bold"
          }} itemStyle={{
            color: neonColor
          }} cursor={{
            stroke: neonColor,
            strokeWidth: 2,
            opacity: 0.5
          }} />
              <Line
                type="monotone"
                dataKey="jobs"
                stroke="none" // Remove the line, keep the neon dots
                strokeWidth={2}
                dot={{
                  fill: dotGlow,
                  stroke: neonColor,
                  strokeWidth: 3.5,
                  r: 8,
                  filter: "url(#neon-glow)"
                }}
                activeDot={{
                  fill: "#fff",
                  stroke: neonColor,
                  strokeWidth: 7,
                  r: 12,
                  style: {
                    filter: "url(#neon-glow)"
                  }
                }}
                name="Created Jobs"
                isAnimationActive={true}
                animationDuration={1700}
                // No line style since we're hiding the line
                className="neon-laser-stroke"
              />
            </LineChart>
          </ResponsiveContainer>}
      </CardContent>
      {/* Inline style for extra glow (just in case) */}
      <style>
        {`
          .neon-laser-stroke {
            filter: url(#neon-glow) drop-shadow(0 0 8px #21f6ff) drop-shadow(0 0 18px #0fffc3) !important;
          }
        `}
      </style>
    </Card>;
}
