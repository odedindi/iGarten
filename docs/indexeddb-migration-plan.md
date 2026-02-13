# IndexedDB Migration Plan (AI Histories)

## Goal

Migrate AI history persistence from localStorage to IndexedDB for larger storage capacity, better scalability, and future support for richer history records.

This plan is intentionally phased. Unknowns are explicitly called out and deferred as extension items where appropriate.

## Current State (as of 2026-02-13)

AI history currently stores text data in localStorage through helper utilities:

- Chat history in Plant Chat
- Schedule suggestions history in Care Schedule
- Identification text history in Plant Identifier (no image blobs)

Current helper module:

- [src/lib/ai/history.ts](../src/lib/ai/history.ts)

## Why IndexedDB

- Much larger practical capacity than localStorage
- Better write/read behavior for growing lists
- Structured object stores, indexes, and versioned migrations
- Suitable future path for optional binary storage (if we later decide to store image thumbnails or compressed assets)

## Scope (Phase 1)

In scope:

1. Replace localStorage persistence for AI histories with IndexedDB
2. Keep existing UI behavior unchanged
3. One-time migration from localStorage keys to IndexedDB
4. Keep storing text-only history for identification results (no image storage yet)

Out of scope:

- Cloud sync
- Cross-device merge
- Storing raw uploaded images
- Encryption at rest beyond browser defaults

## Storage Design

Database:

- Name: igarten
- Version: 1

Object stores:

1. chat_history

    - Key path: id (string)
    - Fields: id, createdAt, updatedAt, role, content, threadId
    - Indexes:
        - by_createdAt
        - by_threadId_createdAt

2. schedule_history

    - Key path: id (string)
    - Fields: id, createdAt, tasks[]
    - Indexes:
        - by_createdAt

3. identify_history
    - Key path: id (string)
    - Fields: id, createdAt, sourceLabel, result
    - Indexes:
        - by_createdAt

Design note:

- We can persist chat exactly as current array semantics initially, but this schema keeps thread support open.

## API Layer Plan

Create a new IndexedDB adapter module with async APIs.

Proposed module:

- [src/lib/ai/history-db.ts](../src/lib/ai/history-db.ts) (new)

Responsibilities:

1. DB open/init function with schema creation
2. CRUD helpers per store
3. Query helpers for newest-first reads with optional limits
4. LocalStorage migration helper for legacy keys
5. Soft-fail behavior (graceful fallback to empty data when DB unavailable)

Potential helper package:

- Use idb package for simpler typed IndexedDB operations

Decision:

- Recommended: add idb dependency to reduce raw IndexedDB boilerplate and avoid transaction pitfalls.

## UI Integration Plan

### Plant Chat

- Replace synchronous load/save calls with async hydration from IndexedDB
- Preserve existing clear history behavior
- Keep current rendering and message streaming logic unchanged

### Care Schedule

- Load history from IndexedDB on mount
- Save new suggestion batches to IndexedDB
- Keep restore and clear behavior unchanged

### Plant Identifier

- Load/save text scan history via IndexedDB
- Keep source label + result summary behavior
- Continue not storing image payloads

## Migration Strategy (localStorage -> IndexedDB)

On first successful IndexedDB init:

1. Read legacy keys:
    - garden_ai_chat_history_v1
    - garden_ai_schedule_history_v1
    - garden_ai_identify_history_v1
2. Validate shape defensively
3. Insert into corresponding object stores
4. Mark migration complete flag in IndexedDB metadata store
5. Remove legacy localStorage keys only after successful import

Safety rules:

- Migration must be idempotent
- Partial migration should not corrupt existing IndexedDB data
- If migration fails, do not delete localStorage keys

## Retention & Limits

Initial policy (match current behavior):

- Keep last 10 schedule history entries
- Keep last 10 identify history entries
- Chat: keep full session history unless we define cap

Recommended near-term cap extension:

- Chat cap by message count (for example 500) or age window (for example 90 days)

## Error Handling & Resilience

Requirements:

1. App remains usable if IndexedDB is blocked/unavailable
2. History sections fail gracefully with no crash
3. DB errors are logged in development only
4. Writes should not block user interactions

Fallback behavior:

- If IndexedDB open fails, keep in-memory state only for that session
- Optional future fallback: transient localStorage mode (extension)

## Performance Expectations

Expected improvements:

- Better reliability as history grows
- Reduced risk of quota exceptions at small sizes
- Cleaner foundation for future query/filter features

No expected regressions in UI if hydration is handled with existing loading guards.

## Test Plan

### Unit-level

1. DB init creates stores and indexes
2. CRUD operations return expected records
3. Migration function imports valid legacy payloads
4. Migration skips invalid/corrupt records safely

### Integration-level

1. Chat history survives reload
2. Schedule history restore works after reload
3. Identify history view works after reload
4. Clear actions remove records from IndexedDB

### Manual checks

1. Existing users with localStorage history see data post-migration
2. New users start clean without errors
3. Private browsing/incognito behavior documented (browser-dependent)

## Unknowns (Require Exploration)

1. Browser quota behavior by platform and private mode

    - Unknown exact limits and eviction behavior for target user browsers
    - Extension when reached: add quota diagnostics + user-facing messaging

2. Migration ordering and race conditions during first mount

    - Unknown if concurrent component mounts could duplicate migration work
    - Extension when reached: single-flight migration lock via metadata store

3. Whether to introduce multi-thread chat model now or later

    - Unknown product direction for separate chat sessions
    - Extension when reached: add thread list store and activeThread pointer

4. Should we support export/import of AI history

    - Unknown if users need backup/portability for AI history
    - Extension when reached: JSON export/import flow with validation

5. Fallback policy when IndexedDB is unavailable
    - Unknown preferred UX: silent in-memory vs explicit warning
    - Extension when reached: toast/warning + optional localStorage fallback

## Extension Backlog (Deferred)

1. Image metadata history enrichment

    - Add filename, mime type, dimensions, and hash
    - Still no binary storage

2. Optional thumbnail/blob storage

    - Store compressed thumbnail blobs in separate store
    - Add retention limit and total-size guardrails

3. Full-text search over AI histories

    - Add lightweight search index or on-read filtering

4. Data lifecycle jobs

    - Automatic pruning by age/count

5. Observability
    - Add metrics for migration success/failure and DB write failures

## Proposed Implementation Sequence

1. Add IndexedDB adapter and schema
2. Add migration routine from localStorage
3. Wire Plant Chat to adapter
4. Wire Care Schedule to adapter
5. Wire Plant Identifier to adapter
6. Add error guards and graceful fallback
7. Run tests/manual verification
8. Remove obsolete localStorage-only utility code if no longer needed

## Acceptance Criteria

1. AI history persists in IndexedDB across page reloads
2. Existing localStorage users are auto-migrated once without data loss
3. UI behavior remains functionally identical for chat/schedule/identify history
4. No runtime crashes if IndexedDB is unavailable
5. Clear history actions truly remove persisted records

## Implementation Notes (2026-02-13)

- Final schema version: v1 (`igarten` IndexedDB)
- Stores/indexes implemented:
    - `chatConversations` with `by-updatedAt`
    - `scheduleHistory` with `by-createdAt`
    - `identifyHistory` with `by-createdAt`
    - `meta` for migration flags
- Migration implemented:
    - One-time import from legacy localStorage keys
    - `meta.ai-history-migrated-v1` flag to make migration idempotent
    - Legacy keys removed only after successful migration transaction
- Chat UX implemented beyond original scope:
    - Multi-conversation support (new chat, switch chat, delete chat)
    - Per-conversation clear history
- Model context window policy implemented:
    - Sends a bounded recent window to `/api/chat`
    - Caps at `MAX_MODEL_MESSAGES = 24`
    - Soft cap at `MAX_MODEL_CHARS = 12000`
    - Always keeps at least `MIN_MESSAGES_TO_KEEP = 6`

### Remaining Follow-up / Extensions

- Add explicit user-facing notice when older chat context is omitted due window limits
- Consider rolling summary memory for long-running conversations
- Evaluate server-side persistence if cross-device continuity is required

## Additional Implementation Notes (Tasks & Harvests)

- Tasks and harvests now use IndexedDB via [src/lib/task-persistence.ts](../src/lib/task-persistence.ts)
- One-time migration behavior:
    - Real (non-mock) entries from legacy localStorage are migrated into IndexedDB
    - Mock/demo entries are explicitly kept in localStorage
- Mock detection rule:
    - IDs ending with `mock-data` are treated as mock data
- Runtime persistence split:
    - Real tasks/harvests persist to IndexedDB
    - Mock tasks/harvests persist to dedicated localStorage keys
