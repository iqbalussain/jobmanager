
-- Create daily tasbi scores table
CREATE TABLE public.daily_tasbi (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  dhikr TEXT NOT NULL,
  count INTEGER NOT NULL DEFAULT 0,
  goal INTEGER NOT NULL DEFAULT 100,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, date, dhikr)
);

ALTER TABLE public.daily_tasbi ENABLE ROW LEVEL SECURITY;

-- Users can view all tasbi scores (leaderboard)
CREATE POLICY "Anyone authenticated can view tasbi scores"
ON public.daily_tasbi FOR SELECT
USING (auth.uid() IS NOT NULL);

-- Users can insert their own scores
CREATE POLICY "Users can insert own tasbi"
ON public.daily_tasbi FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own scores
CREATE POLICY "Users can update own tasbi"
ON public.daily_tasbi FOR UPDATE
USING (auth.uid() = user_id);
