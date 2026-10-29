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

The supplied Postman collection does not define a projects endpoint, so the
page currently uses its local project choices. The backend must accept those
values in `projectIds` or provide a projects endpoint with valid IDs.
List responses may be arrays or wrap results in `data`, `users`, or `items`.
Pagination metadata may include `total`, `totalCount`, `totalItems`, `page`,
`limit`, or `pageSize`. User records may use `id` or `_id`, `name` or
`fullName`, and `isActive` or `status`.

Create requests send `name`, `email`, `password`, optional `phoneNumber`, `role`,
`projectIds`, and `isActive: true`. Update requests send `name`, `email`,
optional `phoneNumber`, `role`, and `projectIds`. The displayed `Admin` role
is sent as `admin` to match the collection. Status requests send
`{ "isActive": boolean }`. Role names are sent as displayed in the role
dropdown.
