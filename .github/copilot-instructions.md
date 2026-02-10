# ASI Codebase Instructions for AI Agents

## Project Overview
Alliance Street Accounting website — a full-stack TypeScript application serving a corporate B2B website with contact forms, dark theme (near-black with red accents), and PostgreSQL persistence. Single Express server handles both API and frontend serving.

## Architecture Essentials

### Three-Layer Structure
- **`client/src/`** — React 18 frontend (Vite, Wouter routing, Tailwind CSS v4)
- **`server/`** — Express v5 backend (REST API under `/api/` prefix)
- **`shared/schema.ts`** — Single source of truth for data types (Drizzle tables + Zod schemas)

### Key Data Flow
1. **Frontend → Backend**: React Hook Form sends POST to `/api/contact`
2. **Validation**: Zod schema from `shared/schema.ts` validates both client-side (form) and server-side (request)
3. **Persistence**: Drizzle ORM writes to PostgreSQL `contact_submissions` table
4. **Type Safety**: Same schema used everywhere prevents type mismatches

### Dev vs Prod Modes
- **Development** (`npm run dev`): Vite middleware integrated into Express, HMR at `/vite-hmr`
- **Production** (`npm run build && npm start`): Vite builds to `dist/public/`, Express serves static files + API routes

## Critical Commands & Workflows

| Command | Purpose | Notes |
|---------|---------|-------|
| `npm run dev:client` | Vite dev server only (port 5000) | Useful for frontend-only work |
| `npm run dev` | Full stack dev (Express + Vite middleware) | Standard development |
| `npm run build` | Compile client (Vite) + server (esbuild to `dist/index.cjs`) | Runs custom `script/build.ts` |
| `npm run check` | TypeScript type checking | Run before commits |
| `npm run db:push` | Sync Drizzle schema to PostgreSQL | Required after schema changes |
| `npm start` | Run production bundle | Expects `NODE_ENV=production` and `dist/` built |

**Build Chain**: `script/build.ts` → (1) Vite client build → (2) esbuild server bundle → both output to `dist/`

## Project-Specific Patterns

### 1. Shared Schema & Type Safety
```typescript
// shared/schema.ts defines everything once
export const contactSubmissionsTable = pgTable("contact_submissions", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  // ...
});

export const createContactSubmissionSchema = createInsertSchema(contactSubmissionsTable);
```
- **Client** uses schema for React Hook Form validation
- **Server** uses same schema for request validation (`storage.ts`)
- **Never duplicate schemas** — update `shared/schema.ts` only

### 2. Storage Interface Pattern
```typescript
// server/storage.ts defines IStorage interface
interface IStorage {
  createContactSubmission(data: CreateContactSubmission): Promise<void>;
}
```
- `DatabaseStorage` class implements operations
- Simplifies testing and future implementation swaps
- **All DB operations go through storage interface**, never direct Drizzle calls in routes

### 3. Component Conventions
- shadcn/ui components in `client/src/components/ui/` (auto-generated, don't manually edit)
- Domain components in `client/src/components/` (layout, contact-form, service-card)
- Custom hooks in `client/src/hooks/`
- Utilities in `client/src/lib/` (includes `cn()` helper for Tailwind class merging)

### 4. Styling & Theming
- Tailwind CSS v4 with CSS variables (configured in `components.json`)
- Dark theme: near-black background (`#000000` or `#0d0d0d`), white text, red accents
- **No inline styles** — use Tailwind classes or shadows via CSS custom properties
- Icons via Lucide React

### 5. Form Handling
- **Client**: React Hook Form + `@hookform/resolvers` (Zod validation)
- **Server**: Manual Zod schema validation in routes
- **Error feedback**: Sonner toast notifications for user-facing messages

## Environment & Dependencies

### Required
- **PostgreSQL** database (via `DATABASE_URL`)
- **Node.js** ≥18 (uses ESM, TypeScript)
- **tsx** for TypeScript execution in dev

### Key Packages
- **Database**: drizzle-orm + drizzle-kit + pg
- **Backend**: express v5, express-session
- **Frontend**: react 19, wouter (routing), framer-motion (animations)
- **Styling**: tailwindcss v4, shadcn/ui (Radix primitives)
- **Forms**: react-hook-form + zod
- **State**: @tanstack/react-query (server state)

## Common Modification Patterns

### Adding a New API Endpoint
1. Create table in `shared/schema.ts` + derive Zod schema
2. Add method to `IStorage` interface in `server/storage.ts`
3. Implement in `DatabaseStorage` class
4. Create route in `server/routes.ts` → validate input → call storage
5. Run `npm run db:push` to migrate schema

### Adding a New Page
1. Create page component in `client/src/pages/`
2. Add route in page component using `<Link>` from Wouter
3. Update navigation in `client/src/components/layout/` if needed
4. Use shared types from `@shared/schema` for data contracts

### Modifying Contact Form
- Field definitions: `shared/schema.ts` (`createContactSubmissionSchema`)
- UI: `client/src/components/` (contact-form component)
- Submission logic: `server/routes.ts` (POST handler)
- Always sync all three places

## Known Constraints & Notes
- Single server serves both frontend + API (simplifies deployment but tight coupling)
- PostgreSQL session store (`connect-pg-simple`) is available but not yet active
- Replit-specific plugins (`@replit/vite-plugin-*`) disable in non-Replit environments
- CSS variables used for theming — avoid hard-coded color values

## Advanced Topics

### Vite Meta Images Plugin
The custom `vite-plugin-meta-images.ts` automatically injects OpenGraph and Twitter image meta tags during build:
- **Detection**: Looks for `client/public/opengraph.{png,jpg,jpeg}`
- **URL Construction**: Uses Replit environment variables (`REPLIT_INTERNAL_APP_DOMAIN` or `REPLIT_DEV_DOMAIN`)
- **Transformation**: Rewrites `<meta property="og:image">` and `<meta name="twitter:image">` tags in build output
- **Scope**: Only active when deployment URL is available (skips silently in non-Replit environments)

### Database Schema Details
Located in `shared/schema.ts`:
```typescript
// Current tables:
- users: id (UUID), username, password, created_at
- contact_submissions: id (serial), name, email, company, service, message, created_at

// Derived Zod schemas for validation:
- insertUserSchema / selectUserSchema
- createContactSubmissionSchema / selectContactSubmissionSchema
```
- **Schema Authority**: Single source of truth — Zod schemas generated from Drizzle table definitions via `drizzle-zod`
- **Type Generation**: Types automatically derived, preventing schema duplication
- **Migration Command**: `npm run db:push` syncs schema to PostgreSQL

### Authentication Flow (Planned)
Infrastructure available but not yet fully implemented:
- **Strategy**: Passport.js with `passport-local` for username/password auth
- **Sessions**: Express sessions with `connect-pg-simple` (PostgreSQL store) configured but defaulting to memory store
- **User Model**: `users` table in schema (id, username, password fields)
- **When Implementing**: Add hash middleware (bcrypt), session middleware, `/api/auth/login` and `/api/auth/signup` routes

### Deployment Specifics

**Replit Autoscale Deployment**:
- **Build**: `npm run build` → outputs to `dist/`
- **Run Command**: `node ./dist/index.cjs` (production bundle)
- **Environment**: Expects `NODE_ENV=production`, `DATABASE_URL`, `PORT` (default 5000)
- **Ports**: Web traffic on port 80 (external) → 5000 (internal)
- **Infrastructure**: Node.js 20, PostgreSQL 16 provisioned

**Build Output Structure**:
```
dist/
  index.cjs       ← Bundled server (esbuild output)
  public/         ← Client build (Vite output)
    index.html
    assets/
    opengraph.{png,jpg,jpeg}
```

**Environment Variables Required**:
- `DATABASE_URL` — PostgreSQL connection string
- `NODE_ENV` — "development" or "production"
- `PORT` — Server port (optional, defaults to 5000)
- `REPLIT_INTERNAL_APP_DOMAIN` / `REPLIT_DEV_DOMAIN` — Auto-set by Replit for OpenGraph meta

## File Reference
See the following files in the workspace root:
- `package.json` — Scripts and dependencies
- `replit.md` — Extended architecture documentation
- `vite.config.ts` — Build and dev server config
- `vite-plugin-meta-images.ts` — Custom OpenGraph image plugin
- `drizzle.config.ts` — Database schema location and connection
- `tsconfig.json` — Path aliases (`@/*`, `@shared/*`)
- `components.json` — shadcn/ui configuration
