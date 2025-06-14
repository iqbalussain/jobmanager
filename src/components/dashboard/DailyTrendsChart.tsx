
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface DailyTrendsChartProps {
  dailyJobData: Array<{ day: string; jobs: number }>;
  isLoading: boolean;
}

export function DailyTrendsChart({ dailyJobData, isLoading }: DailyTrendsChartProps) {
  const isDark = document.body.classList.contains("dark");
  const axisColor = isDark ? "#F0F0F0" : "#22223B";
  const chartBg = isDark ? "hsl(var(--card))" : "#fff";
  const lineColor = isDark ? "#FF0099" : "#8B5CF6";
  const tooltipBg = isDark ? "#111827" : "#fff";
  const tooltipText = isDark ? "#F0F0F0" : "#2D2D2D";

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
            <LineChart data={dailyJobData}>
              <CartesianGrid strokeDasharray="3 3" stroke={axisColor} />
              <XAxis dataKey="day" stroke={axisColor} />
              <YAxis stroke={axisColor} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: tooltipBg, 
                  border: '1px solid var(--border)',
                  borderRadius: '12px',
                  color: tooltipText
                }} 
              />
              <Line 
                type="monotone" 
                dataKey="jobs" 
                stroke={lineColor} 
                strokeWidth={4}
                dot={{ fill: lineColor, strokeWidth: 3, r: 6 }}
                name="Created Jobs"
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}

