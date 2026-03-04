
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
