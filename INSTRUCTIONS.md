# PROJECT INSTRUCTIONS

NOTE TO AI: This file is symlinked to CLAUDE.md and GEMINI.md. When modifying this file, preserve all sections, including those intended for other AI tools. Do not overwrite the entire file; only edit relevant sections and specify if the operation is unique to which AI tool.

## Project Overview

Frontend client for a Synology NAS photo slideshow application. Built with React 19 and TypeScript, using TanStack Start for SSR and file-based routing. Displays photos downloaded from a Synology NAS as a full-screen slideshow with metadata overlays (date, location). Includes a gallery view for browsing thumbnails and a settings page for configuring slideshow behavior. Communicates with a companion C# .NET API via server functions (SSR) and SignalR (real-time browser updates).

## Commands

```bash
pnpm install          # Install dependencies
pnpm dev              # Dev server on port 3500 (sets NODE_TLS_REJECT_UNAUTHORIZED=0)
pnpm build            # Production build (Vite + tsc)
pnpm start            # Run SSR production server (.output/server/index.mjs)

pnpm biome check .    # Lint
pnpm biome format .   # Format
```

Environment variables (`.env`):
- `SERVER__API_BASE_URL` — backend API base URL used by server functions (SSR/Node.js context)
- `CLIENT__API_BASE_URL` — backend API base URL used by the browser (SignalR, client-side requests)

## Docker

```bash
# Local — run when developing/testing locally
docker-compose -f docker-compose.yaml -f docker-compose.local.yaml build
docker-compose -f docker-compose.yaml -f docker-compose.local.yaml up -d

# To deploy — run when pushing to Docker Hub
docker-compose build
docker push esausilva/synology.photos.slideshow.client:latest
```

## Architecture

**Stack**: TanStack Start (Vite + Nitro + React 19) with TanStack Router for file-based routing and SSR via server functions.

### Data Flow

```
Route loader (browser)
  → createServerFn (runs on Node/Nitro)
    → HTTP request to C# API using SERVER__API_BASE_URL
      → Returns data; transforms image URLs to CLIENT__API_BASE_URL for browser use
        → Rendered via Suspense + Await (deferred, non-blocking)

SignalR (browser, CLIENT__API_BASE_URL/hubs/slideshow)
  → RefreshSlideshow / RefreshGallery events
    → router.invalidate() (debounced 1s) to re-trigger loaders

Favorites (automatic)
  → Drop photos into the 'favorites' folder on the NAS
    → API processes them and sends RefreshSlideshow signal
      → Client automatically updates the slideshow
```

### Key Files

- `src/router.tsx` — Router setup with `scrollRestoration: true`
- `src/routes/__root.tsx` — Root layout: `HeadContent`, `Scripts`, `ToastContainer`, Router devtools
- `src/routes/index.tsx` — Slideshow page; deferred loader calls `getSlides()`
- `src/routes/gallery.tsx` — Gallery page; deferred loader calls `getThumbnails()`
- `src/routes/settings.tsx` — Settings page; triggers photo refresh
- `src/server-functions/index.ts` — All `createServerFn()` definitions (`getSlides`, `getThumbnails`, `getApiBaseUrlForClient`)
- `src/hooks/useSlideshowSignalR.ts` — SignalR lifecycle, reconnect, event handling, returns `connectionId`
- `src/hooks/useRefreshNavigationBlock.ts` — Prevents navigating away from the settings page while a refresh is in progress
- `src/utils/data-access.ts` — IndexedDB helpers: `getSlideshowSettings()`, `upsertSlideshowSettings()`
- `src/utils/http.ts` — `httpRequest()` and `httpPostJson()` wrappers around fetch
- `src/contexts/` — `SlideshowMetadataContext` shares `apiBaseUrl` and `signalRConnectionId` down the tree

### Routing and SSR Pattern

Routes use `createFileRoute()`. Loaders call server functions with `defer()` so the initial render is non-blocking:

```typescript
loader: () => ({ slides: defer(getSlides()) })
// In component:
<Suspense fallback={<Skeleton />}>
  <Await promise={slides}>{(data) => <Slideshow slides={data} />}</Await>
</Suspense>
```

Server functions (`createServerFn`) run in the Node.js/Nitro context and have access to `process.env`. They are the only place to use `SERVER__API_BASE_URL`. Image URLs are rewritten to `CLIENT__API_BASE_URL` before returning so the browser can reach them.

### SignalR Events

| Event | Handler |
|---|---|
| `RefreshSlideshow` | Invalidate router (any route) |
| `PhotoProcessingError` | Show error toast |
| `RefreshGallery` | Invalidate router (gallery route only) |
| `ThumbnailsProcessingError` | Show error toast (gallery only) |

The `connectionId` returned by the hook is sent with delete/download requests so the backend can exclude the requesting client from receiving its own refresh signal.

### IndexedDB (Client Settings)

Database `SynologyPhotosSlideshow`, object store `Settings`, single record (key = 1). Stores: `random`, `intervalInMs`, `displayOverlay`. Auto-initialized with defaults on first access.

### CSS

CSS Modules with camelCase class names (enforced by Biome and Vite config). LightningCSS handles modern CSS features (nesting, etc.). Route-specific styles live in `src/routes/styles/`.

### Conventions

- Path alias `~/*` → `./src/*`
- Constants: `SCREAMING_SNAKE_CASE` (API endpoint paths, route names)
- All error toasts use `showErrorToast()` from `src/utils/` and require manual dismissal
- `routeTree.gen.ts` is auto-generated by TanStack Router — do not edit manually
