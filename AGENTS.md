# Architecture rules

- Signup creates a profile only; the profile role-sync trigger owns writes to `user_roles`, preventing duplicate role assignments during account creation.
- Admin-created users are pre-confirmed (no confirmation email), so email/SMTP problems never block or roll back account creation.
- The dashboard scrolls as one natural page (no inner card scrollbars); only the Jobs/Kanban view fills the viewport with per-column scrolling, to avoid nested scrollbars.
- Job data is read from the local Dexie cache; Supabase is hit once for the first full sync, then only by delta sync and realtime, so opening the portal never refetches every job.
- The floating dock auto-hides on fine-pointer devices and reappears when the pointer nears the bottom edge; touch devices keep it visible.
- Dashboard promotional videos use CDN asset pointers with muted looping inline previews and an enlarged dialog; previews stay mounted to keep playback uninterrupted and advertising independent of job queries and sync.
