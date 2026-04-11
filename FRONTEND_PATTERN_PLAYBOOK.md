# Frontend Pattern Playbook

Use this document as a blueprint to generate a frontend with the same structure and coding style as this project.

## 1. Project Goal

Build a production-ready Next.js frontend with:

- App Router route groups
- strict separation of server and client responsibilities
- reusable module + shared + UI layers
- centralized API client and service layer
- validated server actions using Zod
- React Query hydration pattern
- URL-driven tables with server-managed sorting/filter/pagination

## 2. Core Stack

- Next.js 16 (App Router)
- React 19
- TypeScript
- Tailwind CSS + shadcn-style UI primitives
- TanStack React Query
- TanStack React Form
- TanStack React Table
- Axios
- Zod
- date-fns
- sonner (toast)
- recharts

## 3. High-Level Architecture

Use this layered architecture:

1. app: routing, layouts, route-level data prefetch, server actions
2. components/modules: domain-specific UI and feature orchestration
3. components/shared: reusable business UI patterns (table, form wrappers, charts, cells)
4. components/ui: low-level reusable UI primitives
5. services: all backend API calls, no UI code
6. lib: auth, token, cookie, route ownership, helpers, http client
7. hooks: reusable state/URL/table logic
8. types: API and domain contracts
9. zod: input validation for forms and server actions

## 4. Directory Blueprint

```txt
src/
  proxy.ts
  app/
    layout.tsx
    error.tsx
    loading.tsx
    not-found.tsx
    _actions/
    (commonLayout)/
      (authRouteGroup)/
      consultation/
    (dashboardLayout)/
      (commonProtectedLayout)/
      admin/dashboard/
      doctor/dashboard/
      dashboard/
  components/
    modules/
      Admin/
      Auth/
      Consultation/
      Dashboord/
      Doctor/
      Patient/
    shared/
      cell/
      form/
      table/
    ui/
  hooks/
  lib/
    axios/httpClient.ts
  providers/
  services/
  types/
  zod/
```

## 5. Mandatory Conventions

### 5.1 Server and Client Boundaries

- Add use server only in server actions, services, and server-only utilities.
- Add use client only in interactive components, hooks, table/form components, chart components.
- Keep page.tsx server-first by default.

### 5.2 Data Fetching Pattern

Always use this flow:

1. page.tsx reads searchParams
2. page.tsx creates QueryClient
3. page.tsx prefetchQuery for required data
4. page.tsx wraps client component in HydrationBoundary
5. client component uses useQuery for same queryKey
6. services call httpClient
7. httpClient handles cookies/tokens/base URL

### 5.3 Mutation Pattern

1. Client component calls useMutation
2. mutationFn calls server action
3. server action validates payload via Zod
4. server action calls service
5. service calls httpClient
6. on success: toast + invalidateQueries + refetchQueries + router.refresh if needed

### 5.4 Validation Pattern

- Keep form schema and server schema in zod files.
- Validate again in server actions, even if validated on client.
- Return ApiErrorResponse with clear message when validation fails.

### 5.5 Error Handling Pattern

- Central helper in actions to extract axios error response message.
- Fallback to generic message.
- UI always shows toast or alert on failure.

## 6. Auth and Route Protection Pattern

### 6.1 login action

- Validate login payload
- Call /auth/login
- Save accessToken + refreshToken + session token in cookies
- Redirect by role using route ownership utility

### 6.2 middleware/proxy

- Read cookies
- Verify access token
- Proactively refresh token if near expiry and refresh token exists
- Block auth pages for logged-in users (except allowed cases)
- Enforce role route ownership
- Redirect unauthorized users to login with redirect query

### 6.3 Utilities

Create helpers in lib:

- getRouteOwner(pathname)
- getDefaultDashboardRoute(role)
- isValidRedirectForRole(path, role)
- token expiry helpers

## 7. API Layer Contract

### 7.1 Use a single http client

httpClient should:

- use NEXT_PUBLIC_API_BASE_URL
- attach cookies for server-side requests
- provide get/post/put/patch/delete generic methods
- return typed ApiResponse<T>

### 7.2 Service Layer Rules

- one service file per domain
- no UI logic in services
- each function maps to one endpoint clearly
- throw errors and let actions/UI handle messages

## 8. Table + Filter + Search Pattern

For list pages (admin tables, consultation lists, doctor schedules):

- keep sorting/pagination/search/filter in URL search params
- use custom hooks:
  - useServerManagedDataTable
  - useServerManagedDataTableSearch
  - useServerManagedDataTableFilters
- DataTable stays reusable and domain-agnostic
- domain components define filter config and column config

## 9. Reusable Feature Template

Each feature should include:

1. route page with prefetch
2. module table/list component
3. columns file
4. create modal
5. edit modal
6. delete confirmation dialog
7. view details dialog
8. server action file
9. service functions
10. types and zod schema updates

## 10. Code Templates

### 10.1 Server page with hydration

```tsx
import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query";
import FeatureList from "@/components/modules/Feature/FeatureList";
import { getFeatures } from "@/services/feature.services";

const FeaturePage = async ({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) => {
  const params = await searchParams;
  const queryString = new URLSearchParams(
    Object.entries(params).flatMap(([key, value]) =>
      value === undefined
        ? []
        : Array.isArray(value)
          ? value.map((v) => [key, v])
          : [[key, value]],
    ),
  ).toString();

  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: ["features", queryString],
    queryFn: () => getFeatures(queryString),
    staleTime: 1000 * 60 * 60,
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <FeatureList initialQueryString={queryString} />
    </HydrationBoundary>
  );
};

export default FeaturePage;
```

### 10.2 Service function

```ts
"use server";

import { httpClient } from "@/lib/axios/httpClient";
import { IFeature } from "@/types/feature.types";

export const getFeatures = async (queryString: string) => {
  return await httpClient.get<IFeature[]>(queryString ? `/features?${queryString}` : "/features");
};
```

### 10.3 Server action with Zod

```ts
"use server";

import { createFeature } from "@/services/feature.services";
import { ApiErrorResponse, ApiResponse } from "@/types/api.types";
import { IFeature } from "@/types/feature.types";
import { createFeatureServerZodSchema } from "@/zod/feature.validation";

export const createFeatureAction = async (payload: unknown): Promise<ApiResponse<IFeature> | ApiErrorResponse> => {
  const parsed = createFeatureServerZodSchema.safeParse(payload);

  if (!parsed.success) {
    return { success: false, message: parsed.error.issues[0]?.message || "Invalid input" };
  }

  try {
    return await createFeature(parsed.data);
  } catch (error: unknown) {
    return { success: false, message: error instanceof Error ? error.message : "Create failed" };
  }
};
```

### 10.4 Client mutation usage

```tsx
const { mutateAsync, isPending } = useMutation({
  mutationFn: createFeatureAction,
});

const handleSubmit = async (values: FeatureFormValues) => {
  const result = await mutateAsync(values);

  if (!result.success) {
    toast.error(result.message);
    return;
  }

  toast.success(result.message || "Created");
  void queryClient.invalidateQueries({ queryKey: ["features"] });
  void queryClient.refetchQueries({ queryKey: ["features"], type: "active" });
  router.refresh();
};
```

## 11. Naming Rules

- files: kebab-case
- components: PascalCase
- hook names: useXxx
- server actions: verbNounAction
- services: verbNoun
- query keys: ["entity", queryString]

## 12. Environment Rules

Required environment variables:

- NEXT_PUBLIC_API_BASE_URL
- JWT_ACCESS_SECRET (for token verification in middleware)

## 13. Quality Checklist (Before You Call a Feature Done)

- page prefetch + hydration added
- all API calls inside services only
- action validates payload with Zod
- mutation invalidates and refreshes queries
- error and loading states present
- route ownership and auth redirects handled
- types updated in types folder

## 14. Prompt to Generate Similar Frontend

Use this prompt when generating a new project with AI:

```md
Create a Next.js App Router frontend using this architecture:
- route groups for public/auth/protected
- components layered as ui/shared/modules
- server actions + zod validation for all mutations
- service layer with centralized axios http client
- React Query prefetch on server pages + HydrationBoundary
- URL-driven table state for list pages (search, filter, sort, pagination)
- auth middleware with route ownership and token refresh
- strict TypeScript types for API/domain models

Follow these coding rules:
1) no direct API call in component; call service only
2) each mutation must go through server action + zod validation
3) use toast feedback + query invalidation + optional router.refresh
4) keep reusable DataTable and hooks generic
5) add loading/error states in route segments

Generate folder structure and starter code for:
- auth login flow
- one admin CRUD feature
- one public searchable listing feature
- one patient booking-like flow
```

## 15. Practical Note

This pattern is excellent for medium-to-large dashboards where:

- auth and role routing are strict
- list pages need rich filtering/searching
- backend contracts are stable and typed
- many CRUD features share one common pattern

If your next project is smaller, keep the same pattern but start with fewer modules and only add complexity when needed.
