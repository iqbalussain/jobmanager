
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import React from "react";
import { useTheme } from "@/components/ui/ThemeContext";
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
  const neonPink = "#ff00ff";
  const chartBg = "#0f0f0f";
  const { theme } = useTheme();

  const noData = !isLoading && (!dailyJobData || dailyJobData.length === 0);
  const isDark = theme === "dark";

  return (
    <Card className={
      isDark
        ? "shadow-xl border-0 bg-gradient-to-br from-violet-900 to-violet-800 text-white neon-trace-card"
        : "shadow-xl border-0 bg-white text-gray-900"
    }>
      <CardHeader>
        <CardTitle className={`flex items-center gap-2 ${isDark ? "text-white" : "text-gray-800"} text-base sm:text-lg md:text-2xl`}>
          <Activity className={`w-5 h-5 ${isDark ? "text-yellow-400" : "text-primary"}`} />
          Daily Job Creation Trends
        </CardTitle>
      </CardHeader>
      <CardContent className="h-[320px] md:-bottom-100relative">
        <div style={{
          backgroundColor: isDark ? chartBg : "#fff",
          borderRadius: 18,
          padding: 2,
          height: 300
        }}>
          {isLoading ? (
            <div className="flex items-center justify-center h-[300px]">
              <div className={isDark ? "text-white" : "text-gray-800"}>Loading chart data...</div>
            </div>
          ) : noData ? (
            <div className="flex items-center justify-center h-[300px]">
              <div className={isDark ? "text-white opacity-80" : "text-gray-600 opacity-80"} style={{ textAlign: "center" }}>
                No job order data found for the past week.
                <br />
                <span className="text-xs opacity-70">Please check if job orders exist in your database.</span>
              </div>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={dailyJobData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke={isDark ? "#13003d" : "#e0e0e0"}
                  vertical={false}
                  horizontal={true}
                />
                <XAxis
                  dataKey="day"
                  stroke={isDark ? "#E5E7EB" : "#444"}
                  tick={{
                    fill: isDark ? "#fc7fff" : "#1e293b",
                    fontWeight: 700,
                    fontSize: 13,
                    filter: isDark ? "drop-shadow(0 0 1px #ff00ffdd)" : undefined,
                  }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  stroke={isDark ? "#E5E7EB" : "#444"}
                  tick={{
                    fill: isDark ? "#fc7fff" : "#1e293b",
                    fontWeight: 700,
                    fontSize: 13,
                    filter: isDark ? "drop-shadow(0 0 1px #ff00ffdd)" : undefined,
                  }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: isDark ? "#100015" : "#fff",
                    border: `2px solid ${isDark ? neonPink : "#ddd"}`,
                    borderRadius: "14px",
                    boxShadow: isDark ? `0 0 20px 2px ${neonPink}` : undefined,
                    color: isDark ? "#ffd9fa" : "#222"
                  }}
                  labelStyle={{
                    color: isDark ? neonPink : "#a855f7",
                    fontWeight: "bold"
                  }}
                  itemStyle={{
                    color: isDark ? neonPink : "#818cf8"
                  }}
                  cursor={{
                    stroke: isDark ? neonPink : "#ddd",
                    strokeWidth: 1,
                    opacity: isDark ? 0.18 : 0.12
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="jobs"
                  stroke={isDark ? neonPink : "#3730a3"}
                  strokeWidth={isDark ? 3 : 2}
                  dot={isDark
                    ? { stroke: neonPink, strokeWidth: 2, fill: chartBg, r: 6, className: "neon-dot-shadow" }
                    : { stroke: "#818cf8", strokeWidth: 1, fill: "#fff", r: 4 }
                  }
                  activeDot={isDark
                    ? { r: 10, fill: chartBg, stroke: neonPink, strokeWidth: 3, className: "neon-dot-shadow" }
                    : { r: 7, fill: "#fff", stroke: "#818cf8", strokeWidth: 2 }
                  }
                  className={isDark ? "recharts-line neon-shadow" : "recharts-line"}
                  isAnimationActive={true}
                  animationDuration={1600}
                  name="Created Jobs"
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
        {isDark && (
          <style>
            {`
              .recharts-line,
              .neon-shadow {
                filter: drop-shadow(0 0 10px #ff00ff) drop-shadow(0 0 22px #ff00ff);
                transition: filter 0.2s;
              }
              .neon-dot-shadow {
                filter: drop-shadow(0 0 10px #ff00ff);
              }
            `}
          </style>
        )}
      </CardContent>
    </Card>
  );
}
