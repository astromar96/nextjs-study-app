# Senior Frontend Next.js Interview Questions

---

## 1. Next.js Core Concepts

### Q: What are the differences between SSR, SSG, and ISR in Next.js?

- **SSR (Server-Side Rendering):** HTML is generated on every request. Use when data changes frequently and must be fresh on each page load. In the App Router, this is the default for dynamic routes or when using `cookies()`, `headers()`, or `searchParams`.
- **SSG (Static Site Generation):** HTML is generated at build time and reused for every request. Best for pages with data that rarely changes (marketing pages, blog posts). Achieved via `generateStaticParams` in the App Router.
- **ISR (Incremental Static Regeneration):** A hybrid — pages are statically generated but can be revalidated after a set time interval. Configured with `revalidate` in the fetch options or route segment config. Gives the performance of static with near-real-time freshness.

### Q: What is the difference between the App Router and the Pages Router?

| Feature | Pages Router | App Router |
|---|---|---|
| Routing | File-based in `/pages` | File-based in `/app` with nested layouts |
| Data Fetching | `getServerSideProps`, `getStaticProps` | `async` Server Components, `fetch` with caching |
| Layouts | Custom `_app.tsx`, `_document.tsx` | Native nested `layout.tsx` files |
| Server Components | Not supported | Default behavior |
| Streaming | Limited | Built-in with `loading.tsx` and Suspense |
| Middleware | Supported | Supported (same) |

The App Router is the recommended approach for all new projects since Next.js 13+.

### Q: What is the `"use client"` directive and when should you use it?

`"use client"` marks a component (and its entire import subtree) as a Client Component. You need it when:

- Using React hooks (`useState`, `useEffect`, `useRef`, etc.)
- Adding event handlers (`onClick`, `onChange`, etc.)
- Using browser-only APIs (`window`, `localStorage`, `IntersectionObserver`)
- Using third-party libraries that depend on client-side features

**Best practice:** Keep `"use client"` boundaries as low as possible in the component tree. Extract only the interactive parts into Client Components and keep the rest as Server Components.

### Q: What is the purpose of `next.config.js` (or `next.config.mjs`)?

It configures Next.js behavior at build and runtime. Common options include:

- `images.remotePatterns` — allowed external image domains
- `redirects` / `rewrites` — URL redirection and rewriting rules
- `env` — public environment variables
- `experimental` — opt-in to experimental features
- `webpack` — custom webpack configuration
- `headers` — custom HTTP headers for routes
- `output: 'standalone'` — for Docker deployments

---

## 2. Rendering & Data Fetching

### Q: How does data fetching work in the App Router?

In the App Router, Server Components are `async` by default, so you fetch data directly at the component level:

```tsx
// app/users/page.tsx — this is a Server Component
export default async function UsersPage() {
  const users = await fetch('https://api.example.com/users', {
    next: { revalidate: 60 }, // ISR: revalidate every 60s
  }).then(res => res.json());

  return <UserList users={users} />;
}
```

Key points:
- Next.js **automatically deduplicates** identical `fetch` requests in the same render pass.
- You can control caching with `{ cache: 'force-cache' }` (default/static), `{ cache: 'no-store' }` (dynamic), or `{ next: { revalidate: N } }` (ISR).
- For non-fetch data sources (databases, ORMs), use `unstable_cache` or the `revalidate` segment config.

### Q: What is the difference between Server Components and Client Components?

| Aspect | Server Components | Client Components |
|---|---|---|
| Rendering | Server only | Server (initial) + Client (hydration) |
| JavaScript shipped | None | Yes (adds to bundle size) |
| Access to backend | Direct (DB, filesystem, secrets) | No (must go through API) |
| Interactivity | None (no hooks, no events) | Full (hooks, events, browser APIs) |
| Default in App Router | Yes | Must opt in with `"use client"` |

**Key insight for interviews:** Server Components can import Client Components, but Client Components cannot import Server Components directly — they can only receive them as `children` or props (the "donut pattern").

### Q: What is Streaming and how does `loading.tsx` work?

Streaming allows the server to progressively send HTML to the client as it becomes available, rather than waiting for all data to load.

- `loading.tsx` — Automatically wraps the page in a `<Suspense>` boundary. The loading UI shows instantly while the page's async data loads.
- You can also use `<Suspense>` manually for more granular streaming of individual components.
- This dramatically improves Time to First Byte (TTFB) and First Contentful Paint (FCP).

### Q: What is `generateStaticParams` and how does it replace `getStaticPaths`?

```tsx
// app/blog/[slug]/page.tsx
export async function generateStaticParams() {
  const posts = await getPosts();
  return posts.map((post) => ({ slug: post.slug }));
}
```

It tells Next.js which dynamic route segments to pre-render at build time. Differences from `getStaticPaths`:
- No `fallback` property — use `dynamicParams` segment config instead.
- Can be defined at any layout or page level, not just pages.
- Params from parent segments are passed automatically.

---

## 3. Routing

### Q: How does the App Router file convention work?

Each folder in `/app` represents a route segment. Special files:

| File | Purpose |
|---|---|
| `page.tsx` | The route's UI — makes the segment publicly accessible |
| `layout.tsx` | Shared UI that wraps child segments (persists across navigations) |
| `loading.tsx` | Instant loading UI (Suspense boundary) |
| `error.tsx` | Error boundary for the segment |
| `not-found.tsx` | UI for `notFound()` calls |
| `template.tsx` | Like layout but re-mounts on every navigation |
| `route.ts` | API endpoint (cannot coexist with `page.tsx`) |
| `default.tsx` | Fallback for parallel routes |

### Q: What are Parallel Routes and Intercepting Routes?

**Parallel Routes** (`@folder` convention) render multiple pages simultaneously in the same layout:

```
app/
  layout.tsx          ← receives {children, modal, sidebar} as props
  @modal/
    page.tsx
  @sidebar/
    page.tsx
  page.tsx
```

Use cases: dashboards with independent panels, modals alongside main content.

**Intercepting Routes** (`(.)`, `(..)`, `(...)` conventions) allow a route to be "intercepted" and shown in a different context (e.g., a modal) while preserving the URL:

```
app/
  feed/
    page.tsx
    @modal/
      (..)photo/[id]/page.tsx   ← intercepts /photo/[id] and shows as modal
  photo/[id]/
    page.tsx                     ← direct navigation shows full page
```

Classic use case: Instagram-style photo modals.

### Q: What is Middleware in Next.js and what are its limitations?

Middleware runs **before** a request is completed, on the Edge Runtime. Defined in `middleware.ts` at the project root.

```tsx
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token');
  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/api/protected/:path*'],
};
```

**Limitations:**
- Runs on the Edge Runtime — no Node.js APIs (no `fs`, limited `crypto`, no native modules).
- Cannot modify the response body directly (only headers, redirects, rewrites).
- Should be fast and lightweight — no heavy computation or database queries.

### Q: What are Route Groups and how are they useful?

Route Groups (`(folderName)`) organize routes without affecting the URL structure:

```
app/
  (marketing)/
    about/page.tsx      → /about
    contact/page.tsx    → /contact
  (dashboard)/
    settings/page.tsx   → /settings
    layout.tsx          ← separate layout for dashboard routes
```

Use cases:
- Applying different layouts to different sections.
- Organizing code logically without impacting URLs.
- Separating auth vs. public route layouts.

---

## 4. Performance Optimization

### Q: How does `next/image` optimize images?

- **Lazy loading** by default — images below the fold load only when near the viewport.
- **Automatic resizing** — serves the right image size for the device via `srcSet`.
- **Format conversion** — automatically serves WebP/AVIF when the browser supports it.
- **Prevents CLS** — requires `width`/`height` or `fill` to reserve space.
- **Caching** — optimized images are cached and served from `/_next/image`.

```tsx
import Image from 'next/image';

<Image
  src="/hero.jpg"
  alt="Hero"
  width={1200}
  height={600}
  priority          // disables lazy loading for above-the-fold images
  placeholder="blur" // shows blurred preview while loading
/>
```

### Q: What strategies do you use to reduce bundle size in Next.js?

1. **Dynamic imports** — `next/dynamic` or `React.lazy` for code splitting.
2. **Tree shaking** — import only what you need: `import { Button } from 'ui'` not `import * as UI from 'ui'`.
3. **Server Components** — zero JS shipped to the client by default.
4. **`next/bundle-analyzer`** — visualize what's in the bundle.
5. **External packages** — move heavy deps to `serverExternalPackages` in `next.config.js`.
6. **Barrel file awareness** — avoid re-exporting entire modules; use `optimizePackageImports` config.

### Q: How do you handle fonts in Next.js?

`next/font` automatically self-hosts fonts with zero layout shift:

```tsx
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({ children }) {
  return (
    <html className={inter.className}>
      <body>{children}</body>
    </html>
  );
}
```

- Fonts are downloaded at build time and self-hosted — no requests to Google.
- CSS `size-adjust` is applied automatically to eliminate CLS.
- Works with Google Fonts and local/custom fonts via `next/font/local`.

---

## 5. Caching & Revalidation

### Q: Explain the four caching layers in Next.js.

| Cache | Where | What | Invalidation |
|---|---|---|---|
| **Request Memoization** | Server | Deduplicates identical `fetch` calls in a single render | Per-request (automatic) |
| **Data Cache** | Server | Caches `fetch` responses across requests | `revalidate`, `revalidateTag`, `revalidatePath` |
| **Full Route Cache** | Server | Caches the rendered HTML and RSC payload of static routes | Revalidation or redeployment |
| **Router Cache** | Client | Caches RSC payloads of visited routes in the browser | Time-based (30s dynamic, 5min static) or `router.refresh()` |

### Q: How do you revalidate cached data?

**Time-based:**
```tsx
fetch('https://api.example.com/data', { next: { revalidate: 3600 } }); // every hour
```

**On-demand:**
```tsx
import { revalidatePath, revalidateTag } from 'next/cache';

// In a Server Action or Route Handler:
revalidatePath('/blog');            // revalidate a specific path
revalidateTag('blog-posts');        // revalidate all fetches tagged 'blog-posts'
```

**Tag-based fetching:**
```tsx
fetch('https://api.example.com/posts', { next: { tags: ['blog-posts'] } });
```

### Q: How do you opt out of caching entirely?

- `export const dynamic = 'force-dynamic'` at the segment level.
- `fetch(url, { cache: 'no-store' })` per request.
- Using dynamic functions like `cookies()`, `headers()`, or `searchParams` automatically makes a route dynamic.
- `export const revalidate = 0` at the segment level.

---

## 6. Server Actions & Mutations

### Q: What are Server Actions and how do they work?

Server Actions are async functions that run on the server, invoked directly from Client or Server Components. They replace traditional API routes for mutations.

```tsx
// app/actions.ts
'use server';

export async function createPost(formData: FormData) {
  const title = formData.get('title') as string;
  await db.post.create({ data: { title } });
  revalidatePath('/posts');
}
```

```tsx
// app/posts/new/page.tsx
import { createPost } from '../actions';

export default function NewPost() {
  return (
    <form action={createPost}>
      <input name="title" />
      <button type="submit">Create</button>
    </form>
  );
}
```

Key points:
- Marked with `"use server"` directive.
- Work with progressive enhancement — forms work even without JavaScript.
- Can be called from `form action`, `button formAction`, `startTransition`, or event handlers.
- Arguments are serialized and sent as a POST request.

### Q: How do you handle loading and optimistic updates with Server Actions?

```tsx
'use client';

import { useFormStatus } from 'react-dom';
import { useOptimistic } from 'react';

function SubmitButton() {
  const { pending } = useFormStatus();
  return <button disabled={pending}>{pending ? 'Saving...' : 'Save'}</button>;
}

function TodoList({ todos, addTodo }) {
  const [optimisticTodos, addOptimistic] = useOptimistic(
    todos,
    (state, newTodo) => [...state, { ...newTodo, pending: true }]
  );

  async function handleAdd(formData: FormData) {
    const title = formData.get('title');
    addOptimistic({ title, id: Date.now() });
    await addTodo(formData);
  }

  return (
    <form action={handleAdd}>
      {optimisticTodos.map(todo => (
        <p key={todo.id} style={{ opacity: todo.pending ? 0.5 : 1 }}>{todo.title}</p>
      ))}
      <input name="title" />
      <SubmitButton />
    </form>
  );
}
```

### Q: How do you validate data in Server Actions?

Always validate server-side — never trust client input:

```tsx
'use server';

import { z } from 'zod';

const schema = z.object({
  email: z.string().email(),
  name: z.string().min(2).max(100),
});

export async function updateProfile(formData: FormData) {
  const result = schema.safeParse({
    email: formData.get('email'),
    name: formData.get('name'),
  });

  if (!result.success) {
    return { errors: result.error.flatten().fieldErrors };
  }

  await db.user.update({ data: result.data });
  revalidatePath('/profile');
}
```

---

## 7. Authentication & Authorization

### Q: How do you implement authentication in a Next.js App Router project?

Common patterns:

1. **Middleware for route protection:**
```tsx
// middleware.ts
export function middleware(request: NextRequest) {
  const session = request.cookies.get('session');
  if (!session && request.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
}
```

2. **Server Component auth checks:**
```tsx
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export default async function DashboardPage() {
  const session = await getSession(cookies());
  if (!session) redirect('/login');
  return <Dashboard user={session.user} />;
}
```

3. **Popular libraries:** NextAuth.js (Auth.js), Clerk, Supabase Auth, Lucia.

**Key principle:** Always verify auth on the server (middleware, Server Components, Server Actions). Never rely on client-side checks alone.

### Q: How do you handle role-based access control (RBAC)?

```tsx
// lib/auth.ts
export async function authorize(requiredRole: string) {
  const session = await getSession();
  if (!session) redirect('/login');
  if (session.user.role !== requiredRole) redirect('/unauthorized');
  return session;
}

// app/admin/page.tsx
export default async function AdminPage() {
  const session = await authorize('admin');
  return <AdminDashboard user={session.user} />;
}
```

For more granular control, check permissions in Server Actions before mutating data.

---

## 8. State Management

### Q: How do you manage state across Server and Client Components?

- **Server-to-Client:** Pass data as props from Server Components to Client Components. This is the primary data flow pattern.
- **Client-side state:** Use `useState`, `useReducer`, or external stores (Zustand, Jotai) inside Client Components.
- **URL state:** Use `searchParams` and `useSearchParams()` for state that should be shareable/bookmarkable.
- **React Context:** Must be used inside a Client Component provider. Wrap parts of the tree with `"use client"` providers.

```tsx
// providers.tsx
'use client';
export function ThemeProvider({ children }) {
  return <ThemeContext.Provider value={...}>{children}</ThemeContext.Provider>;
}

// layout.tsx (Server Component)
import { ThemeProvider } from './providers';
export default function Layout({ children }) {
  return <ThemeProvider>{children}</ThemeProvider>;
}
```

### Q: When would you use Zustand vs React Context in Next.js?

| Criteria | React Context | Zustand |
|---|---|---|
| Re-renders | All consumers re-render on any value change | Only components using changed slices re-render |
| Complexity | Simple, built-in | Minimal API, tiny bundle (~1KB) |
| DevTools | React DevTools | Dedicated Zustand DevTools |
| Server Components | Provider must be `"use client"` | Store must be accessed in `"use client"` |

**Use Context** for low-frequency updates (theme, locale, auth state).
**Use Zustand** for high-frequency updates (UI state, form state, real-time data) or when you need fine-grained subscriptions.

---

## 9. Testing

### Q: How do you test Server Components?

Server Components can be tested by:

1. **Rendering them directly** (since they are async functions that return JSX):
```tsx
import { render, screen } from '@testing-library/react';
import UsersPage from './page';

// Mock the fetch or database call
jest.mock('./data', () => ({
  getUsers: jest.fn().mockResolvedValue([{ id: 1, name: 'Alice' }]),
}));

test('renders user list', async () => {
  const page = await UsersPage(); // call the async component
  render(page);
  expect(screen.getByText('Alice')).toBeInTheDocument();
});
```

2. **E2E testing with Playwright** is often the most reliable approach for full Server Component flows.

### Q: How do you set up E2E testing with Playwright in Next.js?

```ts
// playwright.config.ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  webServer: {
    command: 'npm run dev',
    port: 3000,
    reuseExistingServer: !process.env.CI,
  },
  use: {
    baseURL: 'http://localhost:3000',
  },
});
```

```ts
// tests/navigation.spec.ts
import { test, expect } from '@playwright/test';

test('navigates to dashboard after login', async ({ page }) => {
  await page.goto('/login');
  await page.fill('input[name="email"]', 'user@test.com');
  await page.fill('input[name="password"]', 'password');
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL('/dashboard');
  await expect(page.getByRole('heading')).toHaveText('Dashboard');
});
```

### Q: What testing libraries do you recommend for Next.js?

- **Unit/Integration:** Jest + React Testing Library (or Vitest as a faster alternative)
- **E2E:** Playwright (recommended by Next.js team) or Cypress
- **API Routes:** Supertest or direct function invocation
- **Visual Regression:** Playwright screenshots, Chromatic, or Percy

---

## 10. Architecture & Patterns

### Q: How do you structure a large-scale Next.js application?

```
app/
  (auth)/
    login/page.tsx
    register/page.tsx
    layout.tsx              ← unauthenticated layout
  (dashboard)/
    overview/page.tsx
    settings/page.tsx
    layout.tsx              ← authenticated layout with sidebar
  api/
    webhooks/route.ts
lib/
  db.ts                     ← database client
  auth.ts                   ← auth utilities
  validators.ts             ← Zod schemas
components/
  ui/                       ← reusable UI primitives (Button, Input, Card)
  features/                 ← feature-specific components
hooks/                      ← custom React hooks
actions/                    ← Server Actions grouped by domain
types/                      ← shared TypeScript types
```

Principles:
- **Colocation:** Keep related files close (actions next to the pages that use them).
- **Separation of concerns:** `lib/` for pure logic, `components/` for UI, `actions/` for mutations.
- **Route Groups** to separate layout concerns without affecting URLs.

### Q: How do you handle error boundaries in the App Router?

```tsx
// app/dashboard/error.tsx
'use client'; // Error components MUST be Client Components

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div>
      <h2>Something went wrong!</h2>
      <p>{error.message}</p>
      <button onClick={() => reset()}>Try again</button>
    </div>
  );
}
```

- `error.tsx` catches errors in the segment and its children.
- It does NOT catch errors in `layout.tsx` of the same segment — you need `error.tsx` in the parent.
- For root-level errors, use `global-error.tsx` which replaces the root layout.

### Q: What is the "donut pattern" in Next.js?

The donut pattern keeps Server Components on the outside and pushes Client Components inward:

```tsx
// Server Component (outer donut)
export default async function ProductPage({ params }) {
  const product = await getProduct(params.id); // server-side data fetch

  return (
    <div>
      <h1>{product.name}</h1>
      <p>{product.description}</p>
      {/* Client Component (inner hole) - only the interactive part */}
      <AddToCartButton productId={product.id} price={product.price} />
    </div>
  );
}
```

Benefits: Minimizes client-side JavaScript, keeps data fetching on the server, and isolates interactivity to the smallest possible boundary.

---

## 11. TypeScript in Next.js

### Q: How do you type page props in the App Router?

```tsx
// app/blog/[slug]/page.tsx
type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ sort?: string; page?: string }>;
};

export default async function BlogPost({ params, searchParams }: Props) {
  const { slug } = await params;
  const { sort } = await searchParams;
  // ...
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  return { title: post.title };
}
```

### Q: How do you type API Route Handlers?

```tsx
// app/api/users/route.ts
import { NextRequest, NextResponse } from 'next/server';

type User = { id: string; name: string; email: string };

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const role = searchParams.get('role');

  const users: User[] = await db.user.findMany({ where: { role } });
  return NextResponse.json(users);
}

export async function POST(request: NextRequest) {
  const body: Omit<User, 'id'> = await request.json();
  const user = await db.user.create({ data: body });
  return NextResponse.json(user, { status: 201 });
}
```

### Q: How do you share types between client and server safely?

- Define shared types in a `types/` directory — types are erased at compile time and don't affect the client/server boundary.
- Never import server-only code (DB clients, secrets) into shared type files.
- Use `import type` to ensure only type information crosses boundaries:

```tsx
import type { User } from '@/types/user'; // safe — erased at build time
```

---

## 12. Deployment & Infrastructure

### Q: What is the difference between Edge Runtime and Node.js Runtime?

| Feature | Edge Runtime | Node.js Runtime |
|---|---|---|
| Cold start | ~0ms (instant) | 50-250ms |
| APIs available | Web APIs (fetch, Request, Response) | Full Node.js APIs |
| Max execution time | Varies by provider (typically 30s) | No hard limit |
| Use case | Middleware, lightweight routes | Heavy computation, database access |
| Size limit | ~1-4MB bundle | No practical limit |

```tsx
// Opt into Edge Runtime for a route
export const runtime = 'edge';
```

### Q: How do you deploy Next.js in a Docker container?

Use the `standalone` output mode:

```js
// next.config.js
module.exports = { output: 'standalone' };
```

```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY . .
RUN npm ci && npm run build

FROM node:20-alpine AS runner
WORKDIR /app
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

EXPOSE 3000
CMD ["node", "server.js"]
```

This produces a minimal self-contained server (~50MB vs ~500MB for full `node_modules`).

### Q: Vercel vs Self-Hosting — what are the trade-offs?

| Aspect | Vercel | Self-Hosted (Docker/Node) |
|---|---|---|
| Zero config | Yes | Manual setup required |
| Edge Functions | Native | Requires additional infra |
| ISR | Fully managed | Needs shared file cache or custom cache handler |
| Image Optimization | Built-in CDN | Must configure `sharp` + CDN |
| Cost | Can be expensive at scale | Predictable infrastructure cost |
| Vendor lock-in | Some (Vercel-specific features) | None |
| Middleware | Edge-native | Runs on Node.js |

---

## 13. Bonus: Common Behavioral / System Design Questions

### Q: How would you migrate a Pages Router app to the App Router?

1. Start with `app/layout.tsx` — migrate `_app.tsx` and `_document.tsx`.
2. Migrate routes incrementally — both routers can coexist.
3. Replace `getServerSideProps` / `getStaticProps` with async Server Components.
4. Move `getStaticPaths` to `generateStaticParams`.
5. Convert client-side data fetching (SWR/React Query) to Server Components where possible.
6. Update Middleware and API routes as needed.
7. Test thoroughly — caching behavior differs significantly.

### Q: How would you implement a real-time dashboard in Next.js?

- **Server Components** for the initial data load (fast TTFB, no JS).
- **Client Components** with WebSocket or Server-Sent Events (SSE) for live updates.
- **Parallel Routes** for independent dashboard panels that load/update independently.
- **SWR or React Query** for polling-based updates with stale-while-revalidate.
- **Server Actions** for user-triggered mutations (filters, settings).

### Q: How do you handle environment variables in Next.js?

- `NEXT_PUBLIC_*` — exposed to the browser (bundled into client JS). Use for public API URLs, analytics IDs.
- All other env vars — server-only. Use for database URLs, API secrets, auth keys.
- `.env.local` — local overrides (gitignored).
- `.env.development` / `.env.production` — environment-specific defaults.
- **Never** expose secrets with the `NEXT_PUBLIC_` prefix.

### Q: What are the most common performance pitfalls in Next.js?

1. Making everything a Client Component unnecessarily.
2. Not using `priority` on above-the-fold images (hurts LCP).
3. Importing large libraries into Client Components (barrel file problem).
4. Not leveraging the Data Cache — fetching the same data multiple times without caching.
5. Blocking rendering with sequential waterfalls instead of parallel data fetching.
6. Using `"use client"` too high in the tree — pushing interactivity boundaries down is key.
7. Not using `<Suspense>` boundaries for granular streaming.

---

> **Tip:** In senior interviews, interviewers value **depth of understanding** over memorized answers. Be ready to explain *why* Next.js made specific design decisions (e.g., why Server Components are the default, why caching is aggressive) and how you would make trade-off decisions in real projects.
