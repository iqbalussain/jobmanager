

## Plan: Animated Falling Stars + Designer Job Creation (1 credit)

### 1. Animated Falling Stars/Lanterns Background

Add floating/falling star and lantern particles behind the content when Ramadan theme is active.

**Changes:**

- **`src/index.css`** -- Add CSS keyframe animations:
  - `@keyframes falling-star` -- Slow vertical drift with slight horizontal sway and fade
  - `@keyframes lantern-float` -- Gentle floating upward motion with slight swing
  - `.falling-star` and `.floating-lantern` utility classes

- **`src/components/RamadanFrame.tsx`** -- Add a particle layer behind the content:
  - 15-20 falling star elements (using star unicode characters) scattered randomly with varying sizes, delays, and durations
  - 8-10 floating lantern elements (using lantern unicode) drifting gently
  - All particles are `pointer-events-none` and low `z-index` so they stay behind content
  - Uses `useMemo` to generate random positions only once (no re-renders)

### 2. Enable Designers to Create Job Orders

Two changes needed -- one in the database RLS policy and one in the frontend permissions config.

**Changes:**

- **SQL Migration** -- Update the `job_orders_insert_policy` to include `designer` role:
  ```sql
  DROP POLICY "job_orders_insert_policy" ON job_orders;
  CREATE POLICY "job_orders_insert_policy" ON job_orders
    FOR INSERT WITH CHECK (
      (EXISTS (
        SELECT 1 FROM user_roles ur
        WHERE ur.user_id = auth.uid()
        AND ur.role IN ('admin','manager','job_order_manager','salesman','designer')
      ))
      AND created_by = auth.uid()
    );
  ```

- **`src/utils/roleValidation.ts`** -- Add `"designer"` to the `canCreateJobOrders` array so the UI doesn't hide the create button from designers.

### Summary of Files

| File | Action |
|------|--------|
| `src/index.css` | Add falling-star and lantern keyframes + classes |
| `src/components/RamadanFrame.tsx` | Add particle layer with stars and lanterns |
| `src/utils/roleValidation.ts` | Add "designer" to canCreateJobOrders |
| SQL migration | Update insert policy to include designer role |

