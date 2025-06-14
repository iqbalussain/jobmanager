
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useEffect, useState } from "react";

interface DailyTrendsChartProps {
  dailyJobData: Array<{ day: string; jobs: number }>;
  isLoading: boolean;
}

export function DailyTrendsChart({ dailyJobData, isLoading }: DailyTrendsChartProps) {
  const [chartTheme, setChartTheme] = useState({
    axisColor: "#22223B",
    chartBg: "#fff",
    lineColor: "#8B5CF6",
    tooltipBg: "#fff",
    tooltipText: "#2D2D2D"
  });

  useEffect(() => {
    // Extract computed theme vars
    const computed = getComputedStyle(document.body);
    const isDark = document.body.classList.contains("dark");
    // Use palette neon or jewel for theme colors when active
    let lineColor = isDark ? computed.getPropertyValue("--primary") || "#00FF85" : "#8B5CF6";
    lineColor = lineColor.trim() ? `hsl(${lineColor.trim()})` : (isDark ? "#00FF85" : "#8B5CF6");

    setChartTheme({
      axisColor: isDark ? "#F0F0F0" : "#22223B",
      chartBg: isDark ? computed.getPropertyValue("--card") || "#0D0D0D" : "#fff",
      lineColor,
      tooltipBg: isDark ? "#111827" : "#fff",
      tooltipText: isDark ? "#F0F0F0" : "#2D2D2D",
    });
  }, [typeof window !== "undefined" && document.body.className]);

  return (
    <Card className="shadow-xl border-0 bg-card text-card-foreground">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-primary" />
          Daily Job Creation Trends
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center">
            <div className="text-muted-foreground">Loading chart data...</div>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <LineChart
              data={dailyJobData}
              style={{ background: chartTheme.chartBg, borderRadius: "12px" }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.axisColor} />
              <XAxis dataKey="day" stroke={chartTheme.axisColor} />
              <YAxis stroke={chartTheme.axisColor} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: chartTheme.tooltipBg, 
                  border: '1px solid var(--border)',
                  borderRadius: '12px',
                  color: chartTheme.tooltipText
                }} 
              />
              <Line 
                type="monotone" 
                dataKey="jobs" 
                stroke={chartTheme.lineColor}
                strokeWidth={4}
                dot={{ fill: chartTheme.lineColor, strokeWidth: 3, r: 6 }}
                name="Created Jobs"
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
