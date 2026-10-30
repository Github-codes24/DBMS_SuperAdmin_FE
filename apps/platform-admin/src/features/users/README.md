# User management API integration

The login and user management screens use `VITE_API_BASE_URL` as the API
prefix. It defaults to `/api` in development (proxied by Vite to
`https://dbms-superadmin-be.onrender.com`) and
`https://dbms-superadmin-be.onrender.com/api` in production. To proxy to a
local or different backend, set `VITE_API_PROXY_TARGET` in the repository-root
`.env` file to its reachable origin, for example `http://localhost:3007`.

To call a backend directly from the browser instead, set `VITE_API_BASE_URL`
to its origin or API prefix; the `/api` suffix is added when it is missing.
Direct browser requests require the backend to allow the frontend origin via
CORS. Restart the development server after changing the root `.env` file.

Login uses `POST /auth/login` relative to the API prefix.
User Management HTTP requests, response normalization, and mapping are
implemented in `services/userService.ts`.

Authentication is handled by the existing login experience. It must store
the returned Bearer access token in browser `localStorage` under the key
`accessToken`; protected user requests read that token. A `401` response
clears the stored token.

| Method | Endpoint | Purpose |
|---|---|---|
| `GET` | `/users?page=&limit=&search=&role=&isActive=&sortBy=&sortOrder=` | List and filter users |
| `GET` | `/users/:id` | Load a user's full details |
| `POST` | `/users` | Create a user |
| `PUT` | `/users/:id` | Update editable user fields |
| `PATCH` | `/users/:id/status` | Update account status |
| `POST` | `/users/:id/reset-password` | Reset a user's password |
| `DELETE` | `/users/:id` | Delete a user |

The backend accepts the roles `superadmin`, `admin`, `manager`, and `user`.
The role filters and form submit only these values. User create/update requests
use strict schemas and accept `name`, `email`, `role`, and `projectIds`; create
also accepts `password` and `isActive`. Phone numbers are not supported by the
backend user schemas.

The page currently uses local project choices because the backend does not
provide a projects endpoint. The backend accepts string values in `projectIds`.
List responses may be arrays or wrap results in `data`, `users`, or `items`.
Pagination metadata may include `total`, `totalCount`, `totalItems`, `page`,
`limit`, or `pageSize`. User records may use `id` or `_id`, `name` or
`fullName`, and `isActive` or `status`.

Create requests send `name`, `email`, `password`, `role`, `projectIds`, and
`isActive: true`. Update requests send `name`, `email`, `role`, and
`projectIds`. Names must contain 2–100 characters, emails at most 254
characters, and passwords 8–128 characters. Status requests send
`{ "isActive": boolean }`.
