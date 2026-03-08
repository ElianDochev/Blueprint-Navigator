# Blueprint Navigator

Blueprint Navigator is a frontend-only proof-of-concept that imports construction drawing PDF/PNG files, extracts page text when available, assigns a plan type, builds a local search index, and opens the best matching page from typed or voice commands.

## MVP Constraints
- No backend service
- No external database
- Browser persistence with IndexedDB (Dexie)
- Temporary container filesystem path at `/app/tmp`
- Run locally with Docker Compose + Bun

## Quick Start (Docker)
```bash
docker compose up --build
```

App URL (default): `http://localhost:5174`
Override host port: `APP_PORT=5173 docker compose up --build`
Note: container startup runs `bun install` inside the app container volume.

## Quick Start (Local Bun)
```bash
bun install
bun run dev
```

## Scripts
- `bun run dev`
- `bun run build`
- `bun run preview`
- `bun run test`
- `bun run test:watch`
- `bun run test:e2e`

## Repository Layout
```text
src/
  app/
  components/
  features/
    drawings/
    pdf/
    search/
    storage/
    voice/
  test/
public/
  branding/
  favicon/
docs/
```

## Documentation
- [Task Breakdown](docs/task-breakdown.md)
- [Architecture Notes](docs/architecture.md)

## Browser Notes
Voice recognition support varies by browser. Chrome is recommended for MVP voice testing.
