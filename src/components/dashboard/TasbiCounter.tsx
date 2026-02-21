import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { RotateCcw, Target, Users, Star } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

const DHIKR_OPTIONS = [
  { label: "سبحان الله", english: "SubhanAllah" },
  { label: "الحمد لله", english: "Alhamdulillah" },
  { label: "الله أكبر", english: "Allahu Akbar" },
];

interface LeaderboardEntry {
  user_id: string;
  full_name: string;
  total: number;
}

export function TasbiCounter() {
  const { user } = useAuth();
  const userId = user?.id || "anon";
  const [selectedDhikr, setSelectedDhikr] = useState(0);
  const [count, setCount] = useState(0);
  const [goal, setGoal] = useState(100);
  const [isEditing, setIsEditing] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);

  const currentDhikr = DHIKR_OPTIONS[selectedDhikr];
  const today = new Date().toISOString().split("T")[0];

  // Load count from Supabase
  useEffect(() => {
    if (!user) return;
    const loadCount = async () => {
      const { data } = await supabase
        .from("daily_tasbi" as any)
        .select("count, goal")
        .eq("user_id", userId)
        .eq("date", today)
        .eq("dhikr", currentDhikr.english)
        .maybeSingle();
      if (data) {
        setCount((data as any).count || 0);
        setGoal((data as any).goal || 100);
      } else {
        setCount(0);
      }
    };
    loadCount();
  }, [userId, selectedDhikr, currentDhikr.english, today, user]);

  const syncToDb = useCallback(async (newCount: number, newGoal?: number) => {
    if (!user) return;
    const payload: any = {
      user_id: userId,
      date: today,
      dhikr: currentDhikr.english,
      count: newCount,
      goal: newGoal ?? goal,
      updated_at: new Date().toISOString(),
    };
    await supabase.from("daily_tasbi" as any).upsert(payload, { onConflict: "user_id,date,dhikr" });
  }, [userId, today, currentDhikr.english, goal, user]);

  const increment = () => {
    const newCount = count + 1;
    setCount(newCount);
    syncToDb(newCount);
  };

  const reset = () => {
    setCount(0);
    syncToDb(0);
  };

  const updateGoal = (newGoal: number) => {
    const g = Math.max(1, newGoal);
    setGoal(g);
    setIsEditing(false);
    syncToDb(count, g);
  };

  const fetchLeaderboard = async () => {
    const { data } = await supabase
      .from("daily_tasbi" as any)
      .select("user_id, count")
      .eq("date", today);
    
    if (!data) return;

    // Aggregate totals per user
    const totals: Record<string, number> = {};
    (data as any[]).forEach((r: any) => {
      totals[r.user_id] = (totals[r.user_id] || 0) + (r.count || 0);
    });

    // Fetch names
    const userIds = Object.keys(totals);
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, full_name")
      .in("id", userIds);

    const nameMap: Record<string, string> = {};
    (profiles || []).forEach((p: any) => { nameMap[p.id] = p.full_name || "User"; });

    const entries: LeaderboardEntry[] = userIds
      .map(uid => ({ user_id: uid, full_name: nameMap[uid] || "User", total: totals[uid] }))
      .sort((a, b) => b.total - a.total);

    setLeaderboard(entries);
  };

  const toggleLeaderboard = () => {
    if (!showLeaderboard) fetchLeaderboard();
    setShowLeaderboard(!showLeaderboard);
  };

  const progress = Math.min((count / goal) * 100, 100);
  const completed = count >= goal;

  return (
    <Card className="border-2 border-primary/20 bg-card shadow-lg relative overflow-hidden">
      {/* Decorative crescents */}
      <span className="absolute top-2 right-2 text-primary/20 text-xl pointer-events-none">☪</span>
      <span className="absolute bottom-2 left-2 text-accent/20 text-lg pointer-events-none">✦</span>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold flex items-center gap-2 text-primary">
          📿 Tasbi Counter
          {completed && <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">✓ Goal!</span>}
          <button onClick={toggleLeaderboard} className="ml-auto text-muted-foreground hover:text-primary transition-colors">
            <Users className="w-4 h-4" />
          </button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {showLeaderboard ? (
          <div className="space-y-2">
            <p className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
              <Star className="w-3 h-3 text-accent" /> Today's Leaderboard
            </p>
            {leaderboard.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-2">No scores yet today</p>
            ) : (
              leaderboard.slice(0, 5).map((entry, i) => (
                <div key={entry.user_id} className={`flex items-center justify-between text-xs px-2 py-1.5 rounded-lg ${
                  entry.user_id === userId ? "bg-primary/10 font-semibold" : "bg-muted/50"
                }`}>
                  <span className="flex items-center gap-1.5">
                    {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `${i + 1}.`}
                    <span className="truncate max-w-[100px]">{entry.full_name}</span>
                  </span>
                  <span className="text-primary font-bold">{entry.total}</span>
                </div>
              ))
            )}
            <Button variant="ghost" size="sm" onClick={toggleLeaderboard} className="w-full text-xs">
              Back to Counter
            </Button>
          </div>
        ) : (
          <>
            {/* Dhikr selector */}
            <div className="flex gap-1">
              {DHIKR_OPTIONS.map((d, i) => (
                <button
                  key={d.english}
                  onClick={() => setSelectedDhikr(i)}
                  className={`text-xs px-2 py-1 rounded-md transition-all ${
                    i === selectedDhikr
                      ? "bg-primary text-primary-foreground font-medium shadow-sm"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  {d.english}
                </button>
              ))}
            </div>

            <p className="text-center text-2xl font-bold text-primary/80 font-serif">{currentDhikr.label}</p>

            <button
              onClick={increment}
              className="w-full py-4 rounded-xl bg-gradient-to-br from-primary/90 to-accent/80 text-primary-foreground text-3xl font-bold shadow-lg hover:shadow-xl active:scale-95 transition-all duration-150"
            >
              {count}
            </button>

            <div className="space-y-1">
              <div className="flex justify-between items-center text-xs text-muted-foreground">
                <span>{count} / {goal}</span>
                <div className="flex items-center gap-1">
                  {isEditing ? (
                    <input
                      type="number"
                      className="w-16 text-xs border rounded px-1 py-0.5 bg-background"
                      defaultValue={goal}
                      autoFocus
                      onBlur={(e) => updateGoal(parseInt(e.target.value, 10) || 100)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") updateGoal(parseInt((e.target as HTMLInputElement).value, 10) || 100);
                      }}
                    />
                  ) : (
                    <button onClick={() => setIsEditing(true)} className="flex items-center gap-0.5 hover:text-primary">
                      <Target className="w-3 h-3" /> Goal
                    </button>
                  )}
                </div>
              </div>
              <Progress value={progress} className="h-2" />
            </div>

            <Button variant="ghost" size="sm" onClick={reset} className="w-full text-xs text-muted-foreground">
              <RotateCcw className="w-3 h-3 mr-1" /> Reset
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}
