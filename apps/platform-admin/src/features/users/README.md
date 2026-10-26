# User management API contract

The user screens use `VITE_API_BASE_URL` as the API prefix. It defaults to
`/api` when the variable is not set. The module expects these endpoints:

| Method | Endpoint | Purpose |
|---|---|---|
| `GET` | `/users?page=&limit=&search=&role=&status=` | List and filter users |
| `GET` | `/users/:id` | Load a user's full details |
| `POST` | `/users` | Create a user |
| `PATCH` | `/users/:id` | Update editable user fields |
| `PATCH` | `/users/:id/status` | Update account status |
| `GET` | `/roles` | Load backend-supported roles |
| `GET` | `/projects` | Load project assignment options |

List endpoints may return an array directly or a `{ data: [...] }`,
`{ users: [...] }`, or `{ items: [...] }` response. User-list pagination
metadata may include `total`, `totalCount`, `totalItems`, `page`, `limit`, or
`pageSize`. User records include an identifier, `fullName`, `email`, `role`,
`status`, and `createdAt`; phone, projects, and update date are optional.
Role and project options use an identifier and a display name.

Create and update requests send `fullName`, `email`, `phoneNumber`, `role`, and
`assignedProjects`. Status updates send `{ "status": "active" | "inactive" }`.
The UI intentionally does not set initial account status during creation or
expose password fields; the backend remains responsible for defaults,
authorization, and validation.
