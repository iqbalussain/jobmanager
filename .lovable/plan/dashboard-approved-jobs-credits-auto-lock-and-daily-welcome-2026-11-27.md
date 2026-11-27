# Dashboard, Approved Jobs, credits, auto-lock and daily welcome

Presentation and session changes only. No database, sync, workflow or job logic changes.

## 1. Dashboard order
Directly under the four KPI cards: Revenue overview, Jobs by status, Production pipeline, Quick invoice update. Priority Work Center, Selected job panel and Recent jobs follow below.

## 2. Approvals inside the selected-job card
- Remove "Approvals" from the dashboard tab buttons.
- When a job awaiting approval is selected, the right-side detail card shows the existing Approve / Reject controls (same actions and permissions as today).

## 3. Approved Jobs fits one screen
- Page fills exactly the window height; no page-level scrolling.
- Job list becomes its own scrolling list with smooth, eased scrolling; detail area stays visible beside it.

## 4. Cleaner chrome and credit line
- Remove the repeated page title headers on each page (top bar stays).
- Small footer on every page: "Design & Developed by Seyed Ussain", name links to https://amitynode.com in a new tab.
- Same credit line (with link) at the bottom of generated PDFs.

## 5. Auto-lock and daily welcome
- After 15 minutes with no mouse, keyboard or touch activity, the portal locks: a full-screen lock asks for the user's password to continue (or sign out). Data is not cleared.
- First sign-in of each day shows a welcome popup: "Job Portal 2.0 — by Seyed Ussain", a good-day greeting from Amity Node, with a × close in the top-right. Shown once per day per browser.

## Technical details
- Files: `ModernDashboard.tsx` (reorder, tabs, approval controls reuse ApprovalBox handlers), `ApprovedJobsSlider.tsx`/`ApprovedJobsList.tsx` (h-[100dvh] flex shell, `overflow-y-auto` list with `scroll-behavior: smooth` + wheel easing via requestAnimationFrame, reduced-motion respected), page header removal in `src/pages` views, new `src/components/layout/AppFooter.tsx`, `src/utils/pdf/pdfGenerator.ts` footer with `doc.textWithLink`.
- New `src/hooks/useIdleLock.ts` (throttled activity listeners, 15 min timer) + `LockScreen.tsx` re-auth via `supabase.auth.signInWithPassword` with the current email.
- New `DailyWelcomeModal.tsx` using localStorage key `welcome-shown-<userId>` = YYYY-MM-DD.
- Verify with build log; test job creation/edit unaffected.
