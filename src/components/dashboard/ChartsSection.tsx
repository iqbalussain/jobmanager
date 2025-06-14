import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Activity } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { useEffect, useState } from "react";

interface ChartsSectionProps {
  dailyJobData: Array<{ day: string; jobs: number }>;
  gaugeData: Array<{ name: string; value: number; color: string }>;
  chartLoading: boolean;
}

export function ChartsSection({ dailyJobData, gaugeData, chartLoading }: ChartsSectionProps) {
  const [chartTheme, setChartTheme] = useState({
    cardBg: "#fff",
    axisColor: "#22223B",
    lineColor: "#3B82F6",
    tooltipBg: "#fff",
    tooltipText: "#2D2D2D"
  });

  useEffect(() => {
    const computed = getComputedStyle(document.body);
    const isDark = document.body.classList.contains("dark");
    // Support palette colors
    let lineColor = isDark ? computed.getPropertyValue("--primary") || "#00FF85" : "#3B82F6";
    lineColor = lineColor.trim() ? `hsl(${lineColor.trim()})` : (isDark ? "#00FF85" : "#3B82F6");

    setChartTheme({
      cardBg: isDark ? `hsl(${computed.getPropertyValue("--card").trim()})` : "#fff",
      axisColor: isDark ? "#F0F0F0" : "#22223B",
      lineColor,
      tooltipBg: isDark ? "#22223B" : "#fff",
      tooltipText: isDark ? "#F0F0F0" : "#2D2D2D"
    });
  }, [typeof window !== "undefined" && document.body.className]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Line Chart */}
      <Card className="lg:col-span-2 shadow-lg border-0 bg-card text-card-foreground backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            Daily Job Creation Trends
          </CardTitle>
        </CardHeader>
        <CardContent>
          {chartLoading ? (
            <div className="h-[300px] flex items-center justify-center">
              <div className="text-muted-foreground">Loading chart data...</div>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart
                data={dailyJobData}
                style={{ background: chartTheme.cardBg, borderRadius: "12px" }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.axisColor} />
                <XAxis dataKey="day" stroke={chartTheme.axisColor} />
                <YAxis stroke={chartTheme.axisColor} />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: chartTheme.tooltipBg, 
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                    color: chartTheme.tooltipText
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="jobs" 
                  stroke={chartTheme.lineColor}
                  strokeWidth={3}
                  dot={{ fill: chartTheme.lineColor, strokeWidth: 2, r: 4 }}
                  name="Jobs Created"
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
      {/* Pie Chart */}
      <Card className="shadow-lg border-0 bg-card text-card-foreground backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary" />
            Job Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={gaugeData}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
                startAngle={90}
                endAngle={450}
              >
                {gaugeData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={{
                background: chartTheme.tooltipBg,
                color: chartTheme.tooltipText
              }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 space-y-2">
            {gaugeData.map((item, index) => (
              <div key={index} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: item.color }}
                  />
                  <span>{item.name}</span>
                </div>
                <span className="font-semibold">{item.value}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
