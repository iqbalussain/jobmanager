

## Plan: Fix Job Order Number Generation Race Condition

### Root Cause

The `generateJobOrderNumber` function in `useCreateJobOrder.tsx` queries `job_orders` client-side to find the latest number. But due to RLS policies, non-admin users (designers, salesmen) can only see **their own** jobs. So when a designer queries for the latest `HO%` number, they miss higher numbers created by other users, generating a duplicate -- which then fails on the unique constraint and exhausts all 5 retry attempts.

### Fix (2 steps)

**1. Create a SECURITY DEFINER database function** that generates the next job order number, bypassing RLS so it sees ALL job orders:

```sql
CREATE OR REPLACE FUNCTION public.generate_next_job_order_number(p_branch text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  prefix text;
  start_num int;
  next_num int;
BEGIN
  -- Map branch to prefix
  prefix := CASE p_branch
    WHEN 'Wadi Kabeer' THEN 'WK'
    WHEN 'Wajihat Ruwi' THEN 'WR'
    WHEN 'Ruwi Branch' THEN 'RB'
    WHEN 'Ghubra Branch' THEN 'GB'
    WHEN 'Nizwa Branch' THEN 'NZ'
    WHEN 'Al Khoud Branch' THEN 'AK'
    ELSE 'HO'
  END;

  start_num := CASE prefix
    WHEN 'WK' THEN 20001
    WHEN 'WR' THEN 30001
    WHEN 'RB' THEN 40001
    WHEN 'GB' THEN 50001
    WHEN 'NZ' THEN 60001
    WHEN 'AK' THEN 70001
    ELSE 10001
  END;

  SELECT COALESCE(
    MAX(CAST(SUBSTRING(job_order_number FROM LENGTH(prefix)+1) AS int)) + 1,
    start_num
  ) INTO next_num
  FROM job_orders
  WHERE job_order_number LIKE prefix || '%';

  RETURN prefix || next_num;
END;
$$;
```

**2. Update `useCreateJobOrder.tsx`** -- Replace the client-side `generateJobOrderNumber` function with a simple RPC call:

```typescript
const jobOrderNumber = await supabase.rpc('generate_next_job_order_number', {
  p_branch: data.branch
});
```

This eliminates the race condition entirely since the DB function sees all rows regardless of the user's role. The existing retry loop for duplicate keys is kept as a safety net for concurrent inserts.

### Files Changed

| File | Action |
|------|--------|
| SQL migration | Create `generate_next_job_order_number` SECURITY DEFINER function |
| `src/hooks/useCreateJobOrder.tsx` | Replace client-side number generation with RPC call |

