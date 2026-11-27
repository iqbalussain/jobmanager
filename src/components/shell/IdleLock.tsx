import { useState, type FormEvent } from "react";
import { Lock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useIdleLock } from "@/hooks/useIdleLock";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

/** Locks the portal after 15 idle minutes; unlocking needs the user's password. */
export function IdleLock() {
  const { user, signOut } = useAuth();
  const { locked, unlock } = useIdleLock(Boolean(user));
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  if (!locked || !user?.email) return null;

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    const { error: authError } = await supabase.auth.signInWithPassword({ email: user.email!, password });
    setBusy(false);
    if (authError) { setError("Incorrect password. Try again."); return; }
    setPassword("");
    unlock();
  };

  return (
    <div role="dialog" aria-modal="true" aria-labelledby="lock-title" className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 p-4 backdrop-blur-xl">
      <form onSubmit={submit} className="w-full max-w-sm space-y-4 rounded-2xl border bg-card p-6 shadow-xl">
        <div className="flex flex-col items-center gap-2 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary"><Lock className="h-5 w-5" aria-hidden /></span>
          <h2 id="lock-title" className="text-lg font-semibold">Job Portal locked</h2>
          <p className="text-sm text-muted-foreground">Locked after 15 minutes of inactivity. Enter your password to continue.</p>
          <p className="text-xs text-muted-foreground">{user.email}</p>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="unlock-password">Password</Label>
          <Input id="unlock-password" type="password" autoFocus autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          {error && <p role="alert" className="text-xs text-destructive">{error}</p>}
        </div>
        <Button type="submit" className="w-full" disabled={busy}>{busy ? "Unlocking…" : "Unlock"}</Button>
        <Button type="button" variant="ghost" className="w-full" onClick={() => void signOut()}>Sign out</Button>
      </form>
    </div>
  );
}
