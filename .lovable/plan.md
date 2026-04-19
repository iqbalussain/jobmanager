

## Plan: Production-Grade Refactor — Strip Themes, Reorganize, Polish UI

This is a large, destructive refactor. Before I execute, I need a few decisions so I don't delete things you actually want.

### What I'll do (high-level)

**Phase 1 — Remove non-business features**
- Delete Gaming Mode entirely: `GamingParticles.tsx`, `GamingBootScreen.tsx`, `GamingLeaderboard.tsx`, `useGamingSound.ts`, `CursorGlow.tsx`, `ParticleBackground.tsx`, the `GamingModeContext`, all `useGamingMode()` calls and `gamingMode` conditional branches, the sidebar toggle, the Orbitron font import in `index.html`, and all related CSS in `index.css` (`.gaming-mode`, `.cyber-card`, `.hex-badge`, `.holographic-*`, `.dialer-*`, `.data-stream*`, `.scanline-overlay`, neon keyframes).
- Delete Ramadan theme entirely: `RamadanFrame.tsx`, `RamadanThemeContext`, `useAdhanNotifications.ts`, `TasbiCounter.tsx`, related CSS, sidebar toggle, Aladhan integration. (Keep the `daily_tasbi` table in the DB but stop reading/writing it.)
- Revert `ApprovedJobsSlider` from the dialer/holographic version back to a clean list/detail layout.
- Strip decorative gradients from `ModernDashboard`, `JobCard`, dashboard widgets — replace with neutral shadcn `Card` styling.

**Phase 2 — Reorganize structure** (optional, see Q4)
```text
src/
  components/
    jobs/         JobList, JobCard, JobDetails, JobForm, job-form/*, job-details/*, job-management/*
    customers/    admin/CustomerManagement, SecureCustomerManagement, dropdowns/CustomerDropdown
    branches/     BranchJobQueue, BranchLogoUploader
    dashboard/    existing minus Gaming/Ramadan widgets
    shared/      FloatingCreateButton, ProtectedRoute, UserProfile, etc.
    ui/           shadcn — unchanged
  pages/  hooks/  services/  lib/  types/  utils/
```
Update every import. Keep `@/` alias.

**Phase 3 — Code cleanup**
- Find and remove unused npm packages from `package.json`.
- Delete orphaned files (no importers).
- Consolidate duplicate hooks (e.g. two `use-toast.ts` copies — one in `components/ui/`, one in `hooks/`).
- Move inline Supabase queries into the `services/` layer.
- Remove dead `console.log`s and commented-out blocks.

**Phase 4 — UI polish**
- Neutral, corporate shadcn theme.
- Clean sidebar (no theme toggles, no sound toggle).
- Consistent `Card` / `Table` / `Form` patterns across pages.
- Fix the build error in `ProjectDetailsSection.tsx:202` (status type cast).

### Risk notes

- Touches ~60+ files, deletes ~15+.
- Folder reorganization breaks every import — done module-by-module with a build check between phases.
- Single implementation pass, tracked via task tracker.

### Questions I need answered before I start

**Q1 — Quotation module**
Your request says to keep "Quotation Management", but project memory says quotations were intentionally removed and `job_order_items` was archived.
- (a) Skip — don't rebuild quotations *(safest)*
- (b) Rebuild a minimal quotations page + table from scratch
- (c) Restore from the deprecated archive *(risky — schema may have drifted)*

**Q2 — Which existing features to KEEP** (multi-select)
- In-app notifications (`DashboardNotifications` + `notifications` table + edge function)
- Job chat / comments (`JobChat` + `job_order_comments`)
- AI checklist panel (`AIChecklistPanel` + `daily-gemini-analyze` edge function)
- Calendar view (`CalendarView` page)
- Reports page (`ReportsPage` with charts/exports)
- Job edit audit log (`JobEditLog` + `job_edit_audit`)

**Q3 — Visual style**
- (a) Neutral slate + single blue accent, light mode only *(classic ERP)*
- (b) Keep current brand HSL tokens but strip all gradients/glows/animations
- (c) Standard shadcn light + dark toggle, neutral palette

**Q4 — Folder reorganization**
Renaming ~50 files and rewriting every import is high-risk.
- (a) Yes — do it now as part of this pass
- (b) Defer — just remove themes + clean dead code in place; reorganize later

Please answer these (you can reply with letters: e.g. "1a, 2: notifications + reports + audit, 3b, 4b") and I'll proceed.

