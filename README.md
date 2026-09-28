# Job Manager

An offline-aware job-order management application for managing customers, assignments,
approvals, statuses, notifications, reports, and role-based administration.

All monetary amounts use Omani rials (OMR), displayed with the `ر.ع.` symbol and
three decimal places.

## Project structure

- `src/pages/Index.tsx` provides the authenticated application shell.
- `src/types/jobOrder.ts` contains the canonical job-domain types.
- `src/utils/jobOrderTransforms.ts` contains database/cache-to-UI transformations.
- `src/services/` contains Supabase APIs and synchronization services.
- `src/lib/dexieDb.ts` defines the offline IndexedDB cache.
- `supabase/migrations/` contains database schema and RLS changes.
- `supabase/functions/` contains authenticated Edge Functions.

## Application routes

Authenticated views are available at:

- `/dashboard`
- `/jobs/approved`
- `/settings`
- `/reports`
- `/admin/jobs`
- `/admin/users`
- `/admin/access`

Access is enforced by both the application and Supabase policies. Users without the
required role are shown the unauthorized page.

## Local development

Create a `.env` file with the public Supabase settings:

```sh
VITE_SUPABASE_URL=...
VITE_SUPABASE_PROJECT_ID=...
VITE_SUPABASE_PUBLISHABLE_KEY=...
```

Then install dependencies and start the application:

```sh
npm install
npm run dev
```

Useful checks:

```sh
npm run lint
npm run build
```

The browser cache is powered by Dexie, isolated per signed-in user, and synchronized
with Supabase in the background. Sync work is serialized, retried on failure, and
reconciles hard-deleted jobs during cache repair. Production deployments should apply
Supabase migrations and deploy the Edge Functions before exposing the frontend.

Workflow alerts query only job orders changed since the previous 20-second poll for
newly created and approved jobs (designers, salesmen, and admins) and completed jobs
(admins). Poll pages and report pages are processed incrementally rather than loading
the full result set into memory. Unread alerts are kept in browser local storage so
they survive tab closure and synchronize between tabs without adding database
fields or tables. The legacy full-table alert snapshot is removed on startup.
Admin completion alerts stay open until an invoice number is saved and the job is
marked invoiced. Desktop alerts are optional and can be enabled from the dashboard
notification menu; sound and desktop delivery depend on browser permission and
autoplay policies. The dashboard groups cached active jobs into design, approval,
execution, and invoicing queues. Queue items animate in with a short stagger; browsers
using a reduced-motion preference intentionally skip the animation.
If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/095e06d9-c491-47ec-9d35-0647fb9fe1de) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)
