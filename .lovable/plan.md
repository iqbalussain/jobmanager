

## Plan: Ramadan Fairy Lights Frame, Adhan Notifications, and Tasbi Counter

This plan adds three Ramadan-themed features to your app when Ramadan mode is enabled.

---

### 1. Fairy Lights Border Frame (All Pages)

A decorative animated fairy lights border will appear around the entire app when Ramadan theme is active. This will be implemented as a CSS animation with small glowing dots along the page edges.

**How it works:**
- A new `RamadanFrame` component wraps the main app content
- Animated glowing dots (green and gold colors) run along all four edges
- Only visible when Ramadan theme is toggled ON
- Pure CSS animation -- no performance impact

**Files to create/modify:**
- `src/components/RamadanFrame.tsx` -- New component with fairy light dots
- `src/index.css` -- Add fairy light keyframe animations
- `src/App.tsx` -- Wrap content with `RamadanFrame`

---

### 2. Oman Adhan Time Notifications

Browser notifications will alert users at Adhan times based on Muscat, Oman prayer schedule. Uses the Aladhan API (free, no key needed) to fetch accurate daily prayer times.

**How it works:**
- Fetches daily prayer times from `api.aladhan.com` for Muscat, Oman (lat: 23.588, lng: 58.3829)
- A background timer checks every minute if current time matches any prayer time
- Shows a browser notification (with sound if permitted) and an in-app toast
- Requests browser notification permission on first load
- Only active when Ramadan theme is ON
- Prayer times: Fajr, Dhuhr, Asr, Maghrib, Isha

**Files to create/modify:**
- `src/hooks/useAdhanNotifications.ts` -- New hook that fetches prayer times and schedules alerts
- `src/App.tsx` -- Activate the hook when Ramadan mode is ON

---

### 3. Tasbi Counter with Goals (Dashboard)

A small, elegant tasbi (prayer bead) counter widget on the dashboard that lets users track dhikr with daily goals. Data is stored per-user in localStorage.

**How it works:**
- Compact card on the dashboard with a large tap/click counter button
- Shows current count, daily goal (default 100, customizable), and progress bar
- Three preset dhikr options: SubhanAllah, Alhamdulillah, Allahu Akbar
- Reset button and goal setter
- Progress persists in localStorage (per user, per day)
- Only visible when Ramadan theme is ON

**Files to create/modify:**
- `src/components/dashboard/TasbiCounter.tsx` -- New tasbi counter widget
- `src/components/ModernDashboard.tsx` -- Add TasbiCounter to the dashboard layout

---

### Technical Details

**New files (3):**
- `src/components/RamadanFrame.tsx`
- `src/hooks/useAdhanNotifications.ts`
- `src/components/dashboard/TasbiCounter.tsx`

**Modified files (3):**
- `src/index.css` -- Fairy light CSS animations
- `src/App.tsx` -- Add RamadanFrame wrapper and Adhan hook
- `src/components/ModernDashboard.tsx` -- Add TasbiCounter widget

**No database changes needed** -- tasbi counter uses localStorage, prayer times come from a free external API.

