# Architecture Notes

## Layers
1. UI Layer: import, search, voice, result list, viewer, recent files.
2. Application Layer: command parsing, orchestration, ranking.
3. Data Layer: Dexie (IndexedDB) and in-memory search index.
4. Integration Layer: PDF.js extraction and speech-recognition adapter.

## Data Persistence
- Authoritative store: browser IndexedDB via Dexie.
- Temporary container volume: `/app/tmp` for local runtime artifacts only.

## Core Models
- `DrawingFile`
- `DrawingPage`
- `SearchResult`
- `VoiceCommand`

## Key Technical Decisions
- Frontend-only architecture with no backend/API dependency.
- Local search index rebuilt from IndexedDB records.
- Voice parser implemented as deterministic regex rules (no LLM).
