# User management API integration

The login and user management screens use `VITE_API_BASE_URL` as the API
prefix. It defaults to `/api`; the Vite development server proxies that prefix
to `http://localhost:3007`. To connect directly, set
`VITE_API_BASE_URL=http://localhost:3007` or
`VITE_API_BASE_URL=http://localhost:3007/api`; the `/api` suffix is added when
it is missing.

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
| `GET` | `/projects` | Load project assignment options |

List responses may be arrays or wrap results in `data`, `users`, or `items`.
Project lists may be returned as `projects` at the response root or under
`data`; project options may be strings or objects with `id`/`projectId` and
`name`/`projectName` fields.
Pagination metadata may include `total`, `totalCount`, `totalItems`, `page`,
`limit`, or `pageSize`. User records may use `id` or `_id`, `name` or
`fullName`, and `isActive` or `status`.

Create requests send `name`, `email`, `password`, `phoneNumber`, `role`,
`projectIds`, and `isActive: true`. Update requests send `name`, `email`,
`phoneNumber`, `role`, and `projectIds`. Status requests send
`{ "isActive": boolean }`. Role names are sent as displayed in the role
dropdown.
