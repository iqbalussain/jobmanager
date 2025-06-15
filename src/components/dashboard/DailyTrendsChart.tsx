
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
  const neonPink = "#ff00ff";
  const chartBg = "#0f0f0f";

  const noData = !isLoading && (!dailyJobData || dailyJobData.length === 0);

  return (
    <Card className="shadow-xl border-0 bg-gradient-to-br from-violet-900 to-violet-800 text-white">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white text-base sm:text-lg md:text-2xl">
          <Activity className="w-5 h-5 text-yellow-400" />
          Daily Job Creation Trends
        </CardTitle>
      </CardHeader>
      <CardContent className="h-[320px] md:-bottom-100relative">
        <div style={{ backgroundColor: chartBg, borderRadius: 18, padding: 2, height: 300 }}>
          {isLoading ? (
            <div className="flex items-center justify-center h-[300px]">
              <div className="text-white">Loading chart data...</div>
            </div>
          ) : noData ? (
            <div className="flex items-center justify-center h-[300px]">
              <div className="text-white opacity-80 text-center">
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
                  stroke="#13003d" 
                  vertical={false}
                  horizontal={true}
                />
                <XAxis
                  dataKey="day"
                  stroke="#E5E7EB"
                  tick={{
                    fill: "#fc7fff",
                    fontWeight: 700,
                    fontSize: 13,
                    filter: "drop-shadow(0 0 1px #ff00ffdd)",
                  }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  stroke="#E5E7EB"
                  tick={{
                    fill: "#fc7fff",
                    fontWeight: 700,
                    fontSize: 13,
                    filter: "drop-shadow(0 0 1px #ff00ffdd)",
                  }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#100015",
                    border: `2px solid ${neonPink}`,
                    borderRadius: "14px",
                    boxShadow: `0 0 20px 2px ${neonPink}`,
                    color: "#ffd9fa"
                  }}
                  labelStyle={{
                    color: neonPink,
                    fontWeight: "bold"
                  }}
                  itemStyle={{
                    color: neonPink
                  }}
                  cursor={{
                    stroke: neonPink,
                    strokeWidth: 1,
                    opacity: 0.18
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="jobs"
                  stroke={neonPink}
                  strokeWidth={3}
                  dot={{
                    stroke: neonPink,
                    strokeWidth: 2,
                    fill: chartBg,
                    r: 6,
                    className: "neon-dot-shadow"
                  }}
                  activeDot={{
                    r: 10,
                    fill: chartBg,
                    stroke: neonPink,
                    strokeWidth: 3,
                    className: "neon-dot-shadow"
                  }}
                  className="recharts-line neon-shadow"
                  isAnimationActive={true}
                  animationDuration={1600}
                  name="Created Jobs"
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
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
      </CardContent>
    </Card>
  );
}

