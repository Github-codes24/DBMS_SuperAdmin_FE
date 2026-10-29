# User management persistence

The user directory currently stores demo user records in browser `localStorage`
under `platform-admin.users`. The initial demo users are used when this key
does not exist. Create, edit, status, and delete operations save the updated
directory, so it remains available after a page refresh in the same browser.

Passwords are never stored in `localStorage`. Password reset continues to use
the protected `/users/:id/reset-password` API endpoint and requires the
existing authentication token.

The user service retains API helpers for a future backend integration. The
directory CRUD currently uses browser storage; replace that persistence layer
with the API when the backend is ready.
