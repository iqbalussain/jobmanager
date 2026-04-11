

## Plan: Gaming Mode Leaderboard + Full Cyberpunk Dashboard Styling

### 1. Gaming Leaderboard Widget (New Component)

**`src/components/dashboard/GamingLeaderboard.tsx`** (new)
- Query `job_orders` grouped by `created_by` to rank users by jobs completed/created
- Show top 5 performers with neon rank badges (#1 gold glow, #2 silver, #3 bronze, rest cyan)
- Glassmorphism card with `.cyber-card` styling, hexagonal rank indicators
- Animated progress bars with neon fill
- Only renders when gaming mode is active

### 2. ApprovalBox Gaming Mode Styling

**`src/components/dashboard/ApprovalBox.tsx`**
- Detect `gamingMode` via `useGamingMode()`
- Card: swap white gradients for `cyber-card` dark glassmorphism
- Header: neon green/cyan gradient instead of blue/purple
- Pending job items: dark bg with neon yellow border instead of yellow-50
- Buttons: neon-styled approve (green glow), reject (red glow), view (cyan glow)
- Badge: neon yellow pulse instead of static yellow
- Text colors: green-400/cyan-400 instead of gray-900/gray-600

### 3. JobStatusOverview Gaming Mode Styling

**`src/components/dashboard/JobStatusOverview.tsx`**
- Detect `gamingMode` via `useGamingMode()`
- Outer container: dark glassmorphism with grid background overlay
- Status cards: replace solid color gradients with dark cards + neon-colored borders and glow matching each status (blue=total, orange=active, purple=pending, yellow=in-progress, indigo=designing, green=completed, emerald=invoiced, red=cancelled)
- Hover: neon glow intensifies + scale
- Text: neon-colored with text-shadow glow
- Icons: matching neon color with drop-shadow

### 4. HighPriorityReminder Gaming Mode Styling

**`src/components/dashboard/HighPriorityReminder.tsx`**
- Detect `gamingMode`
- Background: dark with red neon border and scanline overlay
- Text: neon red/orange with glow
- OVERDUE badge: red neon pulse

### 5. DashboardNotifications Gaming Mode Styling

**`src/components/dashboard/DashboardNotifications.tsx`**
- Detect `gamingMode`
- Dropdown panel: dark glassmorphism background
- Items: dark hover states with neon accents
- Bell icon: neon green glow when gaming mode active

### 6. Additional CSS

**`src/index.css`**
- Add `.gaming-mode .cyber-card-header` for neon gradient headers
- Add `.hex-badge` for hexagonal rank indicators (clip-path)
- Add `@keyframes rank-glow` for leaderboard rank animation
- Add `.gaming-mode .scanline-overlay` pseudo-element

### 7. ModernDashboard Integration

**`src/components/ModernDashboard.tsx`**
- Import and render `GamingLeaderboard` below the existing grid when gaming mode is active

### Summary of Files

| File | Action |
|------|--------|
| `src/components/dashboard/GamingLeaderboard.tsx` | New -- leaderboard widget |
| `src/components/dashboard/ApprovalBox.tsx` | Add gaming mode conditional styling |
| `src/components/dashboard/JobStatusOverview.tsx` | Add gaming mode conditional styling |
| `src/components/dashboard/HighPriorityReminder.tsx` | Add gaming mode conditional styling |
| `src/components/dashboard/DashboardNotifications.tsx` | Add gaming mode conditional styling |
| `src/components/ModernDashboard.tsx` | Add GamingLeaderboard |
| `src/index.css` | Add hex-badge, rank-glow, scanline CSS |

