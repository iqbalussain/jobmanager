import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { RotateCcw, Target } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const DHIKR_OPTIONS = [
  { label: "سبحان الله", english: "SubhanAllah" },
  { label: "الحمد لله", english: "Alhamdulillah" },
  { label: "الله أكبر", english: "Allahu Akbar" },
];

function getStorageKey(userId: string, dhikr: string) {
  const today = new Date().toISOString().split("T")[0];
  return `tasbi_${userId}_${dhikr}_${today}`;
}

function getGoalKey(userId: string) {
  return `tasbi_goal_${userId}`;
}

export function TasbiCounter() {
  const { user } = useAuth();
  const userId = user?.id || "anon";
  const [selectedDhikr, setSelectedDhikr] = useState(0);
  const [count, setCount] = useState(0);
  const [goal, setGoal] = useState(100);
  const [isEditing, setIsEditing] = useState(false);

  const currentDhikr = DHIKR_OPTIONS[selectedDhikr];

  // Load count
  useEffect(() => {
    const key = getStorageKey(userId, currentDhikr.english);
    const saved = localStorage.getItem(key);
    setCount(saved ? parseInt(saved, 10) : 0);

    const goalKey = getGoalKey(userId);
    const savedGoal = localStorage.getItem(goalKey);
    if (savedGoal) setGoal(parseInt(savedGoal, 10));
  }, [userId, selectedDhikr, currentDhikr.english]);

  const increment = () => {
    const newCount = count + 1;
    setCount(newCount);
    localStorage.setItem(getStorageKey(userId, currentDhikr.english), String(newCount));
  };

  const reset = () => {
    setCount(0);
    localStorage.setItem(getStorageKey(userId, currentDhikr.english), "0");
  };

  const updateGoal = (newGoal: number) => {
    const g = Math.max(1, newGoal);
    setGoal(g);
    localStorage.setItem(getGoalKey(userId), String(g));
    setIsEditing(false);
  };

  const progress = Math.min((count / goal) * 100, 100);
  const completed = count >= goal;

  return (
    <Card className="border-2 border-primary/20 bg-card shadow-lg">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold flex items-center gap-2 text-primary">
          📿 Tasbi Counter
          {completed && <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">✓ Goal reached!</span>}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
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

        {/* Arabic label */}
        <p className="text-center text-2xl font-bold text-primary/80 font-serif">
          {currentDhikr.label}
        </p>

        {/* Counter button */}
        <button
          onClick={increment}
          className="w-full py-4 rounded-xl bg-gradient-to-br from-primary/90 to-accent/80 text-primary-foreground text-3xl font-bold shadow-lg hover:shadow-xl active:scale-95 transition-all duration-150"
        >
          {count}
        </button>

        {/* Progress */}
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

        {/* Reset */}
        <Button variant="ghost" size="sm" onClick={reset} className="w-full text-xs text-muted-foreground">
          <RotateCcw className="w-3 h-3 mr-1" /> Reset
        </Button>
      </CardContent>
    </Card>
  );
}
