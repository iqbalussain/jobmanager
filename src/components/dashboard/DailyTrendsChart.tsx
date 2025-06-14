import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, ArrowDown, ArrowUp } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface DailyTrendsChartProps {
  dailyJobData: Array<{ day: string; jobs: number }>;
  isLoading: boolean;
}

export function DailyTrendsChart({ dailyJobData, isLoading }: DailyTrendsChartProps) {
  return (
    <Card className="shadow-xl border-0 bg-gradient-to-br from-yellow-200 to-blue-200 text-gray-900">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-blue-800">
          <ArrowUp className="w-5 h-5 text-green-500" />
          Daily Job Creation Trends
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center">
            <div className="text-blue-900">Loading chart data...</div>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={dailyJobData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#fb7185" />
              <XAxis dataKey="day" stroke="#3b82f6" />
              <YAxis stroke="#22c55e" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#f4f4f5', 
                  border: '1px solid #fecaca',
                  borderRadius: '12px',
                  color: '#0f172a'
                }} 
              />
              <Line 
                type="monotone" 
                dataKey="jobs" 
                stroke="#3b82f6"
                strokeWidth={4}
                dot={{ fill: '#fbbf24', strokeWidth: 3, r: 6 }}
                name="Created Jobs"
                style={{
                  filter: 'drop-shadow(0 0 8px #a21caf)',
                }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
