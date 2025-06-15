
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
  // Reference colors
  const neonPink = "#ff2ec6";
  const neonBlue = "#2edbff";
  const neonMid = "#b56cff"; // purple-violet
  const neonShadow = "#0fffc3";
  const neonCore = "#fff";
  const backgroundGlow = "#34114b";
  // For minimal/nearly invisible dots:
  const dotGlow = "rgba(255,255,255,0.12)";

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
        {/* Neon SVG filters & gradient */}
        <svg width="0" height="0">
          <defs>
            {/* Strong neon colored glow */}
            <filter id="neon-glow" x="-60%" y="-60%" width="220%" height="220%">
              <feDropShadow dx="0" dy="0" stdDeviation="1.5" floodColor={neonPink} />
              <feDropShadow dx="0" dy="0" stdDeviation="2.5" floodColor={neonBlue} />
              <feDropShadow dx="0" dy="0" stdDeviation="5" floodColor={neonShadow} />
              <feDropShadow dx="0" dy="0" stdDeviation="13" floodColor={backgroundGlow} />
            </filter>
            {/* Laser neon multi-stop gradient */}
            <linearGradient id="neon-gradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor={neonBlue} />
              <stop offset="48%" stopColor={neonMid} />
              <stop offset="95%" stopColor={neonPink} />
            </linearGradient>
            {/* Extra-wide for blurred base: used if desired */}
            <linearGradient id="glow-gradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor={neonBlue} stopOpacity="0.12" />
              <stop offset="48%" stopColor={neonMid} stopOpacity="0.11" />
              <stop offset="95%" stopColor={neonPink} stopOpacity="0.13" />
            </linearGradient>
          </defs>
        </svg>
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
                stroke="rgba(91,208,245,0.11)" 
                vertical={false}
                horizontal={true}
              />
              <XAxis
                dataKey="day"
                stroke="#E5E7EB"
                tick={{
                  fill: "#a8ebff",
                  fontWeight: 700,
                  fontSize: 13,
                  filter: "drop-shadow(0 0 2px #9ee7fa88)",
                }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                stroke="#E5E7EB"
                tick={{
                  fill: "#a8ebff",
                  fontWeight: 700,
                  fontSize: 13,
                  filter: "drop-shadow(0 0 2px #9ee7fa88)",
                }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#160823",
                  border: `2px solid ${neonPink}`,
                  borderRadius: "14px",
                  boxShadow: `0 0 20px 2px ${neonBlue}`,
                  color: "#ffd6fa"
                }}
                labelStyle={{
                  color: neonPink,
                  fontWeight: "bold"
                }}
                itemStyle={{
                  color: neonBlue
                }}
                cursor={{
                  stroke: neonMid,
                  strokeWidth: 1,
                  opacity: 0.18
                }}
              />
              {/* Optional, add a blurred "shadow" line (experimental neon "glow base") */}
              <Line
                type="monotone"
                dataKey="jobs"
                stroke="url(#glow-gradient)"
                strokeWidth={10}
                dot={false}
                activeDot={false}
                opacity={0.23}
                isAnimationActive={false}
                style={{ filter: "url(#neon-glow)" }}
              />
              {/* The main slim laser neon line */}
              <Line
                type="monotone"
                dataKey="jobs"
                stroke="url(#neon-gradient)"
                strokeWidth={1}
                dot={false} // No visible dots (laser line only)
                activeDot={{
                  fill: neonCore,
                  stroke: neonPink,
                  strokeWidth: 7,
                  r: 12,
                  style: {
                    filter: "url(#neon-glow)"
                  }
                }}
                name="Created Jobs"
                isAnimationActive={true}
                animationDuration={1800}
                className="neon-laser-stroke"
                style={{
                  filter: "url(#neon-glow)"
                }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
      {/* Extra CSS for line glow */}
      <style>
        {`
          .neon-laser-stroke {
            filter: url(#neon-glow) drop-shadow(0 0 10px #21f6ff) drop-shadow(0 0 22px #ff2ec6) !important;
          }
        `}
      </style>
    </Card>
  );
}
