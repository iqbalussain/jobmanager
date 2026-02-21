

## Plan

### Issue 1: Rahul (and 12 other users) Can't See Jobs

**Root Cause:** The RLS policy `job_orders_view_policy` checks the `user_roles` table for role-based access. However, 9 designers (including Rahul) and 4 salesmen only have roles in the `profiles` table -- they are completely missing from `user_roles`. This means the RLS policy denies them access to all jobs.

**Affected users:**
- Designers (9): Hamid, Mubashir, Shabeeb, Irshad, Rahul, Imran Jamil, Hamza, Bilal, Adnan
- Salesmen (4): Ussain, Aqeeb, Mohsin, Razi

**Fix (1 step):**

1. **Insert missing `user_roles` rows** -- Sync all profiles that have a role in `profiles` but no matching entry in `user_roles`:

```sql
INSERT INTO user_roles (user_id, role)
SELECT p.id, p.role
FROM profiles p
WHERE NOT EXISTS (
  SELECT 1 FROM user_roles ur
  WHERE ur.user_id = p.id AND ur.role = p.role
)
AND p.role IS NOT NULL;
```

This single query fixes Rahul and all 12 other affected users immediately. No code changes needed.

---

### Issue 2: Ramadan Theme

Yes, a Ramadan theme is absolutely possible! Here's the plan:

1. **Add a Ramadan CSS theme** in `src/index.css` with warm gold/green/deep purple color palette:
   - Primary: Deep emerald green
   - Accent: Rich gold
   - Background: Warm dark tones with subtle crescent/star decorative elements

2. **Add a theme toggle** in `src/components/SettingsView.tsx` or the sidebar to switch to "Ramadan Mode"

3. **Add decorative elements:**
   - A crescent moon and stars SVG in the sidebar/header
   - "Ramadan Kareem" greeting in the dashboard header
   - Gold/green gradient accents replacing the current red/blue gradients

4. **Store preference** in localStorage so it persists across sessions

### Technical Details

**Files to modify:**
- `src/index.css` -- Add `.ramadan` theme CSS variables (green/gold palette)
- `src/components/MinimalistSidebar.tsx` -- Add Ramadan theme toggle button
- `src/components/dashboard/DashboardHeader.tsx` -- Show Ramadan greeting when theme is active
- `src/App.tsx` -- Add theme state management and apply class to root element

**Color palette:**
- Primary: `hsl(152, 69%, 31%)` (Emerald green)
- Accent: `hsl(43, 89%, 50%)` (Gold)
- Background gradient: Deep navy to dark green
- Card backgrounds: Warm dark tones with subtle gold borders

