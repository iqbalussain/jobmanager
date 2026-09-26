# Job Manager

An offline-aware job-order management application for managing customers, assignments,
approvals, statuses, notifications, reports, and role-based administration.

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

The browser cache is powered by Dexie and is synchronized with Supabase in the
background. Production deployments should apply Supabase migrations and deploy the
Edge Functions before exposing the frontend.

## Lovable project

**URL**: https://lovable.dev/projects/095e06d9-c491-47ec-9d35-0647fb9fe1de

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/095e06d9-c491-47ec-9d35-0647fb9fe1de) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

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

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

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
