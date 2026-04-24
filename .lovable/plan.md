
## Plan: Reduce Supabase Egress (300-400 MB → ~60-100 MB target)

**Constraint honored:** No `supabase.channel()` or `.on('postgres_changes', ...)` code is touched. Realtime stays exactly as-is.

### Where the egress is going (root causes)

After auditing the code, the top bandwidth offenders are:

1. **`repairMissingJobs()` runs on every app load** — fetches every `id` from `job_orders` then re-fetches any "missing" rows with `select('*')`. With thousands of jobs, this alone can be ~500 KB–2 MB per session start.
2. **`syncReferenceData()` runs on initial sync AND every 30-second delta** — re-pulls all customers, all profiles, all job titles every half minute even when nothing changed.
3. **`select('*')` on `job_orders`** — the table has ~30 columns including `description` (rich-text HTML) and `description_plain`, often several KB per row. A 1000-row batch can be 3-5 MB. Used in `performInitialSync`, `performDeltaSync`, `repairMissingJobs`, `updateJobInCache`, `fetchJobOrders`, `fetchJobOrdersPaginated`.
4. **`fetchJobOrders()` in `jobOrdersApi.ts`** — duplicates the Dexie initial sync (same data, fetched twice on first paint via `useJobOrdersQuery`).
5. **`fetchJobOrdersPaginated()`** — does an N+1 lookup: one `profiles` request per row for designer + salesman. 50 rows = 100 extra round trips.
6. **`useActivities`, `useJobImages`, `JobChat`, `notificationsSync`, `aiSync`, `companies`** — all use `select('*')`.
7. **TanStack Query has no `staleTime`** — every component remount re-fetches.

### Changes (file-by-file)

**`src/App.tsx`** — Add global QueryClient defaults:
```text
staleTime: 5 * 60_000   (5 min — most data doesn't change that fast)
gcTime:    30 * 60_000  (30 min)
refetchOnWindowFocus: false
refetchOnReconnect: 'always'
```

**`src/services/syncService.ts`** — biggest wins:
- Replace every `select('*')` on `job_orders` with an explicit column list (drop `description` from the list-level sync; keep only `description_plain` truncated isn't possible, so just exclude `description` entirely from list sync — fetch on demand in `JobDetails`).
  Columns kept: `id, job_order_number, customer_id, job_title_id, designer_id, salesman_id, status, priority, branch, assignee, due_date, estimated_hours, actual_hours, total_value, invoice_number, job_order_details, client_name, delivered_at, approval_status, approval_notes, approved_by, approved_at, created_by, created_at, updated_at, description_plain`.
- **Gate `syncReferenceData()`** behind a 10-minute timestamp check (store `lastRefSync` in `db.syncMeta`). Reference data rarely changes — running it every 30 s is wasteful.
- **Throttle `repairMissingJobs()`**: only run if last repair was > 1 hour ago (store `lastRepair` in `db.syncMeta`). Currently runs on every page load.
- **Replace the repair query** `select('id')` with `select('id, updated_at')` and ALSO check Dexie `updated_at` to skip rows already in sync (avoids a second fetch when ids exist but are stale — no extra cost).
- `updateJobInCache` and `addJobToCache`: keep as-is (single-row, called only after a write).

**`src/services/jobOrdersApi.ts`**:
- `fetchJobOrders()`: this duplicates the Dexie sync — **deprecate it**. Change `useJobOrdersQuery` to read from Dexie via `useDexieJobs` instead (the dashboard already uses Dexie elsewhere, per the offline-first memory). Removes a full duplicate full-table fetch on first load.
- `fetchJobOrdersPaginated()`:
  - Replace `select('*')` with explicit columns.
  - Replace the N+1 designer/salesman lookup with a single `profiles.select('id, full_name, email, phone').in('id', [...allIds])` after the page loads.

**`src/hooks/useActivities.tsx`**: `select('id, action, description, entity_type, entity_id, user_id, created_at')` + add `staleTime: 60_000`.

**`src/hooks/useJobImages.tsx`**: `select('id, file_path, file_name, file_type, file_size, image_width, image_height, alt_text, created_at, uploaded_by')` (drop `is_image` from selection — already filtered in WHERE).

**`src/components/JobChat.tsx`**: `select('id, comment, created_by, created_at')`.

**`src/services/notificationsSync.ts`**: `select('id, message, type, job_id, read, snoozed_until, payload, created_at')`. Realtime `.on()` subscriptions in this file stay untouched.

**`src/services/aiSync.ts`**: `select('id, date, items, created_at')`.

**`src/services/companies.ts`**: `select('id, name, phone, address, email, letterhead_url')`.

**`src/components/dropdowns/JobTitleDropdown.tsx`**: `select('id, job_title_id')` + wrap in `useQuery` with `staleTime: 10 * 60_000`.

**`src/components/settings/DataManagement.tsx`** — CSV export uses `select('*')` for full export. **Leave the CSV `*` calls alone** (export needs everything by design), but limit the profile exports to `select(<headers>)` since headers are already explicit.

### Caching strategy (TanStack Query `staleTime`)

| Hook | staleTime | Why |
|------|-----------|-----|
| `useJobOrdersQuery` (now Dexie-backed) | n/a — Dexie | Already cached locally |
| `useActivities` | 60 s | Activity feed |
| `useUsers` | 10 min | Profiles change rarely |
| `useDropdownData` (customers/jobtitles) | 10 min | Reference data |
| `useNotifications` query path | 30 s | Realtime fills gaps |
| `useJobImages` | 5 min | Images don't churn |
| Companies | 30 min | Almost static |

### Filter optimization

`fetchJobOrdersPaginated` currently fetches the page then filters salesman/customer **in JS** by name. Change both to server-side `.eq('salesman_id', id)` / `.eq('customer_id', id)` — requires the UI to pass IDs (it already has them via the dropdown options, just needs threading through). This avoids over-fetching when a single salesman is selected.

### What is NOT changed

- All `supabase.channel(...)` and `.on('postgres_changes', ...)` blocks — left exactly as written.
- Realtime subscription targets, filters, table names, callbacks — untouched.
- Database schema, RLS policies, edge functions — no changes.
- The 30-second sync interval — unchanged (just made cheaper per tick).

### Expected egress impact

| Source | Before | After |
|--------|--------|-------|
| `repairMissingJobs` per session | ~1-2 MB | ~50 KB (throttled, smaller select) |
| `syncReferenceData` per 30 s | ~100-300 KB | ~0 (skipped 95% of ticks) |
| `performDeltaSync` | varies, big rows | ~40% smaller (no `description`) |
| `fetchJobOrders` duplicate | full-table (~3-5 MB) | 0 (removed) |
| Paginated admin page | 50 rows × 2 profile fetches | 1 batched fetch |
| Refetch on remount | every mount | once per `staleTime` window |

Conservative estimate: **60-75% egress reduction**, landing in the 80-150 MB/month range.

### Files touched

| File | Change |
|------|--------|
| `src/App.tsx` | QueryClient defaults |
| `src/services/syncService.ts` | Explicit columns, throttle ref-sync + repair |
| `src/services/jobOrdersApi.ts` | Drop full-table fetch, batch profile lookups, explicit columns |
| `src/hooks/useJobOrdersQuery.tsx` | Read from Dexie instead of network |
| `src/hooks/useActivities.tsx` | Explicit columns + staleTime |
| `src/hooks/useJobImages.tsx` | Explicit columns + staleTime |
| `src/hooks/useDropdownData.tsx` | staleTime |
| `src/hooks/useUsers.tsx` | staleTime |
| `src/components/JobChat.tsx` | Explicit columns (Realtime untouched) |
| `src/services/notificationsSync.ts` | Explicit columns (Realtime untouched) |
| `src/services/aiSync.ts` | Explicit columns |
| `src/services/companies.ts` | Explicit columns |
| `src/components/dropdowns/JobTitleDropdown.tsx` | Explicit columns + cache |

No DB migrations. No Realtime changes. Single implementation pass on approval.
