# Blueprint Navigator MVP Task Breakdown

## Task 1: Skeleton and environment
1. Create Bun + React + Vite + TypeScript repo files.
2. Add Dockerfile and docker-compose with `/app/tmp` volume.
3. Add base app shell and branding/favicons under `public/`.
4. Add `README.md` and docs directory for GitHub-readiness.

## Task 2: PDF import and extraction
1. Build `ImportPanel` with file validation and progress.
2. Implement PDF text extraction service with PDF.js.
3. Persist drawing metadata and page text in IndexedDB.
4. Add import summary and clear error handling.

## Task 3: Local search and viewer navigation
1. Build local page-level index service.
2. Implement typed search and ranked result list.
3. Open selected PDF and target page in viewer.
4. Add recent files panel and empty states.

## Task 4: Voice commands
1. Add voice adapter and `VoiceButton`.
2. Implement parser rules for constrained intents.
3. Map parsed commands to search queries.
4. Fallback to transcript text search when parsing is weak.

## Task 5: Testing and quality
1. Add unit tests for parser/ranking/validators.
2. Add component tests for import/search/results/voice UI.
3. Run test/build verification.
4. Finalize docs for reproducible startup.
