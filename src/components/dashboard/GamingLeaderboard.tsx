import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Trophy, Medal, Star, Zap } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface LeaderboardEntry {
  userId: string;
  name: string;
  completedCount: number;
  totalCount: number;
}

export function GamingLeaderboard() {
  const { user } = useAuth();

  const { data: leaderboard = [] } = useQuery({
    queryKey: ['gaming-leaderboard'],
    queryFn: async (): Promise<LeaderboardEntry[]> => {
      const { data: jobs, error } = await supabase
        .from('job_orders')
        .select('created_by, status');

      if (error) throw error;

      const userMap = new Map<string, { completed: number; total: number }>();
      jobs.forEach(job => {
        const entry = userMap.get(job.created_by) || { completed: 0, total: 0 };
        entry.total++;
        if (job.status === 'completed' || job.status === 'invoiced') entry.completed++;
        userMap.set(job.created_by, entry);
      });

      const userIds = Array.from(userMap.keys());
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name')
        .in('id', userIds);

      const profileMap = new Map(profiles?.map(p => [p.id, p.full_name || 'Unknown']) || []);

      return Array.from(userMap.entries())
        .map(([userId, stats]) => ({
          userId,
          name: profileMap.get(userId) || 'Unknown',
          completedCount: stats.completed,
          totalCount: stats.total,
        }))
        .sort((a, b) => b.completedCount - a.completedCount)
        .slice(0, 5);
    },
    enabled: !!user,
    staleTime: 60000,
  });

  const getRankIcon = (rank: number) => {
    if (rank === 0) return <Trophy className="w-5 h-5 text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.8)]" />;
    if (rank === 1) return <Medal className="w-5 h-5 text-gray-300 drop-shadow-[0_0_8px_rgba(209,213,219,0.8)]" />;
    if (rank === 2) return <Medal className="w-5 h-5 text-amber-600 drop-shadow-[0_0_8px_rgba(217,119,6,0.8)]" />;
    return <Star className="w-4 h-4 text-cyan-400 drop-shadow-[0_0_6px_rgba(34,211,238,0.6)]" />;
  };

  const getRankGlow = (rank: number) => {
    if (rank === 0) return "border-yellow-400/60 shadow-[0_0_20px_rgba(250,204,21,0.4)]";
    if (rank === 1) return "border-gray-300/60 shadow-[0_0_15px_rgba(209,213,219,0.3)]";
    if (rank === 2) return "border-amber-600/60 shadow-[0_0_15px_rgba(217,119,6,0.3)]";
    return "border-cyan-400/30 shadow-[0_0_10px_rgba(34,211,238,0.2)]";
  };

  const getProgressColor = (rank: number) => {
    if (rank === 0) return "bg-gradient-to-r from-yellow-400 to-amber-500";
    if (rank === 1) return "bg-gradient-to-r from-gray-300 to-gray-400";
    if (rank === 2) return "bg-gradient-to-r from-amber-500 to-amber-700";
    return "bg-gradient-to-r from-cyan-400 to-green-400";
  };

  if (leaderboard.length === 0) return null;

  const maxCompleted = leaderboard[0]?.completedCount || 1;

  return (
    <div className="rounded-2xl border border-green-400/30 bg-gray-900/80 backdrop-blur-xl p-6 shadow-[0_0_40px_rgba(0,255,150,0.1)]">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-gradient-to-br from-yellow-400/20 to-amber-500/20 border border-yellow-400/30">
          <Zap className="w-5 h-5 text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.6)]" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-green-400 font-mono tracking-wider drop-shadow-[0_0_10px_rgba(0,255,150,0.5)]">
            TOP OPERATORS
          </h3>
          <p className="text-xs text-cyan-400/60 font-mono">PERFORMANCE RANKINGS</p>
        </div>
      </div>

      <div className="space-y-3">
        {leaderboard.map((entry, index) => (
          <div
            key={entry.userId}
            className={`flex items-center gap-3 p-3 rounded-xl border bg-gray-800/60 backdrop-blur-sm transition-all duration-300 hover:scale-[1.02] hover:bg-gray-800/80 ${getRankGlow(index)}`}
          >
            {/* Hex rank badge */}
            <div className="hex-badge w-10 h-10 flex items-center justify-center shrink-0">
              {getRankIcon(index)}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-semibold text-green-300 font-mono truncate">
                  {entry.name}
                </span>
                <span className="text-xs text-cyan-400 font-mono">
                  {entry.completedCount}/{entry.totalCount}
                </span>
              </div>
              <div className="w-full h-2 bg-gray-700/80 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${getProgressColor(index)}`}
                  style={{ width: `${(entry.completedCount / maxCompleted) * 100}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
