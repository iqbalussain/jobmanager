import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface DailyTrendsChartProps {
  dailyJobData: Array<{ day: string; jobs: number }>;
  isLoading: boolean;
}

export function DailyTrendsChart({ dailyJobData, isLoading }: DailyTrendsChartProps) {
  console.log("[DailyTrendsChart] dailyJobData:", dailyJobData, "isLoading:", isLoading);

  const noData = !isLoading && (!dailyJobData || dailyJobData.length === 0);

  return (
    <Card className="shadow-xl border-0 bg-gradient-to-br from-violet-900 to-violet-800 text-white">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white text-base sm:text-lg md:text-2xl">
          <Activity className="w-5 h-5 text-yellow-400" />
          Daily Job Creation Trends
        </CardTitle>
      </CardHeader>
      <CardContent className="h-[320px] md:h-[100%]">
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
              <CartesianGrid strokeDasharray="3 3" stroke="#8B5CF6" />
              <XAxis dataKey="day" stroke="#E5E7EB" />
              <YAxis stroke="#E5E7EB" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#581C87', 
                  border: '1px solid #8B5CF6',
                  borderRadius: '12px',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3)',
                  color: '#F9FAFB'
                }} 
              />
              <Line 
                type="monotone" 
                dataKey="jobs" 
                stroke="#FEF08A" 
                strokeWidth={4}
                dot={{ fill: '#FEF08A', strokeWidth: 3, r: 6 }}
                name="Created Jobs"
                style={{
                  filter: 'drop-shadow(0 0 8px #FEF08A)',
                }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
