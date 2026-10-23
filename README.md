# DBMS Super Admin — Frontend

## 1. Project Overview

DBMS Super Admin is the central administration frontend for managing the platform and its connected applications.

The platform is intended to provide a centralized interface for managing users, projects, roles, permissions, and access across multiple applications.

### Key Modules

- Authentication and Login
- Admin Dashboard
- User Management
- Project Management
- Roles and Permissions (RBAC)
- Application Access Management

*Note: Modules will be implemented incrementally as development progresses.*

## 2. Technology Stack

| Technology | Purpose |
|---|---|
| React | Frontend UI |
| TypeScript | Type safety |
| Vite | Development server and build tool |
| npm | Package management |
| Node.js + Express | Backend API |
| MongoDB | Database |
| Git + GitHub | Version control and collaboration |

## 3. Project Structure

```text
DBMS_SuperAdmin_FE/
├── apps/
│   └── platform-admin/
│       ├── public/
│       ├── src/
│       │   ├── assets/
│       │   ├── components/
│       │   ├── features/
│       │   │   └── auth/
│       │   ├── layouts/
│       │   ├── services/
│       │   ├── App.tsx
│       │   ├── App.css
│       │   ├── index.css
│       │   └── main.tsx
│       ├── package.json
│       └── vite.config.ts
├── packages/
│   ├── ui/
│   ├── api-client/
│   ├── auth/
│   ├── permissions/
│   └── types/
├── package.json
├── package-lock.json
└── README.md
```

The shared packages are planned for reusable UI components, API integration, authentication, permissions, and common TypeScript types.

## 4. Prerequisites

Install the following before starting development:

- Node.js (LTS version recommended)
- npm
- Git
- Visual Studio Code (recommended)

Verify your installation:

```bash
node -v
npm -v
git --version
```

## 5. Local Setup

### Step 1: Clone the repository

```bash
git clone https://github.com/Github-codes24/DBMS_SuperAdmin_FE.git
cd DBMS_SuperAdmin_FE
```

### Step 2: Install dependencies

```bash
npm install
```

### Step 3: Start the development server

```bash
npm run dev:platform
```

Open the local URL shown in the terminal. The default Vite URL is usually:

`http://localhost:5173/`

### Step 4: Build for production

```bash
npm run build:platform
```

### Step 5: Run lint checks

```bash
npm run lint:platform
```

## 6. Development Workflow

The project uses Git branches to separate stable code, integration work, and individual tasks.

- `main` — stable code intended for releases.
- `develop` — integration branch for completed features.
- `feature/<feature-name>` — branch for an individual feature or task.

### Feature Development

1. Start from the latest `develop` branch.
2. Create a feature branch.
3. Implement and test the assigned feature.
4. Commit your changes with a meaningful message.
5. Push the feature branch to GitHub.
6. Create a Pull Request targeting `develop`.
7. Request code review before merging.

Example:

```bash
git switch develop
git pull origin develop
git switch -c feature/project-a-login
```

Commit and push:

```bash
git add .
git commit -m "feat: implement login UI"
git push -u origin feature/project-a-login
```

## 7. Coding Guidelines

- Use TypeScript for new React components.
- Keep components small and reusable.
- Organize code by feature where practical.
- Place shared UI components in the appropriate shared package when ready.
- Keep API calls separate from presentation components.
- Do not commit secrets, passwords, API keys, or `.env` files.
- Validate changes and run lint/build checks before creating a Pull Request.
- Do not merge directly into protected branches when a Pull Request is required.

## 8. Environment Configuration

Environment variables may be used for backend API URLs and other environment-specific configuration.

For Vite, frontend environment variables exposed to the application generally use the `VITE_` prefix.

Example `.env.example`:

```env
VITE_API_BASE_URL=http://localhost:3007/api
```

Update the URL to match the actual backend configuration.

Do not put database connection strings, private API secrets, JWT signing secrets, or other server-only credentials in frontend environment variables. Frontend variables can be exposed to users in the built application.

## 9. Current Development Status

- [x] React + TypeScript + Vite application scaffold
- [x] npm workspace structure initialized
- [x] Shared package directories created
- [ ] Login UI
- [ ] Backend authentication integration
- [ ] Admin dashboard
- [ ] User management
- [ ] Project management
- [ ] Roles and permissions
- [ ] Automated testing and CI checks

Update this checklist as modules are completed.

## 10. Contributing

Before submitting a Pull Request:

1. Ensure the application runs locally.
2. Run the applicable lint and build commands.
3. Review your changes for accidental secrets or unrelated files.
4. Push your feature branch.
5. Create a Pull Request with a clear description and testing notes.

## 11. Repository

GitHub: https://github.com/Github-codes24/DBMS_SuperAdmin_FE.git
