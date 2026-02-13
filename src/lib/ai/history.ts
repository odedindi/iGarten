import { openDB, type DBSchema, type IDBPDatabase } from "idb";

const DB_NAME = "igarten";
const DB_VERSION = 2;

const LEGACY_CHAT_KEY = "garden_ai_chat_history_v1";
const LEGACY_SCHEDULE_KEY = "garden_ai_schedule_history_v1";
const LEGACY_IDENTIFY_KEY = "garden_ai_identify_history_v1";
const MIGRATION_FLAG_KEY = "ai-history-migrated-v1";

export interface ChatMessageRecord {
    id: string;
    role: "user" | "assistant";
    content: string;
}

export interface ChatConversationRecord {
    id: string;
    title: string;
    createdAt: string;
    updatedAt: string;
    messages: ChatMessageRecord[];
}

export interface ScheduleHistoryRecord {
    id: string;
    createdAt: string;
    tasks: unknown[];
}

export interface IdentifyHistoryRecord {
    id: string;
    createdAt: string;
    sourceLabel: string;
    result: string;
}

interface MetaRecord {
    key: string;
    value: string;
}

interface IGartenDB extends DBSchema {
    chatConversations: {
        key: string;
        value: ChatConversationRecord;
        indexes: { "by-updatedAt": string };
    };
    scheduleHistory: {
        key: string;
        value: ScheduleHistoryRecord;
        indexes: { "by-createdAt": string };
    };
    identifyHistory: {
        key: string;
        value: IdentifyHistoryRecord;
        indexes: { "by-createdAt": string };
    };
    tasks: {
        key: string;
        value: { id: string; dateCreated?: string };
        indexes: { "by-dateCreated": string };
    };
    harvests: {
        key: string;
        value: { id: string; dateHarvested?: string };
        indexes: { "by-dateHarvested": string };
    };
    meta: {
        key: string;
        value: MetaRecord;
    };
}

let dbPromise: Promise<IDBPDatabase<IGartenDB>> | null = null;
let migrationPromise: Promise<void> | null = null;

function safeParse<T>(rawValue: string | null, fallback: T): T {
    if (!rawValue) {
        return fallback;
    }

    try {
        return JSON.parse(rawValue) as T;
    } catch {
        return fallback;
    }
}

function makeId() {
    return crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`;
}

async function getDb() {
    if (typeof window === "undefined") {
        return null;
    }

    if (!dbPromise) {
        dbPromise = openDB<IGartenDB>(DB_NAME, DB_VERSION, {
            upgrade(db) {
                if (!db.objectStoreNames.contains("chatConversations")) {
                    const store = db.createObjectStore("chatConversations", {
                        keyPath: "id",
                    });
                    store.createIndex("by-updatedAt", "updatedAt");
                }

                if (!db.objectStoreNames.contains("scheduleHistory")) {
                    const store = db.createObjectStore("scheduleHistory", {
                        keyPath: "id",
                    });
                    store.createIndex("by-createdAt", "createdAt");
                }

                if (!db.objectStoreNames.contains("identifyHistory")) {
                    const store = db.createObjectStore("identifyHistory", {
                        keyPath: "id",
                    });
                    store.createIndex("by-createdAt", "createdAt");
                }

                if (!db.objectStoreNames.contains("tasks")) {
                    const store = db.createObjectStore("tasks", {
                        keyPath: "id",
                    });
                    store.createIndex("by-dateCreated", "dateCreated");
                }

                if (!db.objectStoreNames.contains("harvests")) {
                    const store = db.createObjectStore("harvests", {
                        keyPath: "id",
                    });
                    store.createIndex("by-dateHarvested", "dateHarvested");
                }

                if (!db.objectStoreNames.contains("meta")) {
                    db.createObjectStore("meta", {
                        keyPath: "key",
                    });
                }
            },
        });
    }

    const db = await dbPromise;
    await ensureMigrated(db);
    return db;
}

async function ensureMigrated(db: IDBPDatabase<IGartenDB>) {
    if (!migrationPromise) {
        migrationPromise = (async () => {
            const migrationFlag = await db.get("meta", MIGRATION_FLAG_KEY);
            if (migrationFlag?.value === "1") {
                return;
            }

            const legacyChat = safeParse<ChatMessageRecord[]>(
                localStorage.getItem(LEGACY_CHAT_KEY),
                []
            );
            const legacySchedule = safeParse<ScheduleHistoryRecord[]>(
                localStorage.getItem(LEGACY_SCHEDULE_KEY),
                []
            );
            const legacyIdentify = safeParse<IdentifyHistoryRecord[]>(
                localStorage.getItem(LEGACY_IDENTIFY_KEY),
                []
            );

            const tx = db.transaction(
                [
                    "chatConversations",
                    "scheduleHistory",
                    "identifyHistory",
                    "meta",
                ],
                "readwrite"
            );

            if (legacyChat.length > 0) {
                const now = new Date().toISOString();
                await tx.objectStore("chatConversations").put({
                    id: makeId(),
                    title: "Migrated chat",
                    createdAt: now,
                    updatedAt: now,
                    messages: legacyChat,
                });
            }

            for (const entry of legacySchedule) {
                await tx.objectStore("scheduleHistory").put({
                    ...entry,
                    id: entry.id || makeId(),
                });
            }

            for (const entry of legacyIdentify) {
                await tx.objectStore("identifyHistory").put({
                    ...entry,
                    id: entry.id || makeId(),
                });
            }

            await tx.objectStore("meta").put({
                key: MIGRATION_FLAG_KEY,
                value: "1",
            });

            await tx.done;

            localStorage.removeItem(LEGACY_CHAT_KEY);
            localStorage.removeItem(LEGACY_SCHEDULE_KEY);
            localStorage.removeItem(LEGACY_IDENTIFY_KEY);
        })();
    }

    await migrationPromise;
}

export async function loadChatConversations() {
    const db = await getDb();
    if (!db) {
        return [] as ChatConversationRecord[];
    }

    const allConversations = await db.getAll("chatConversations");
    return allConversations.sort((a, b) =>
        b.updatedAt.localeCompare(a.updatedAt)
    );
}

export async function saveChatConversations(
    conversations: ChatConversationRecord[]
) {
    const db = await getDb();
    if (!db) {
        return;
    }

    const tx = db.transaction("chatConversations", "readwrite");
    await tx.store.clear();
    for (const conversation of conversations) {
        await tx.store.put(conversation);
    }
    await tx.done;
}

export async function loadScheduleHistory() {
    const db = await getDb();
    if (!db) {
        return [] as ScheduleHistoryRecord[];
    }

    const allHistory = await db.getAll("scheduleHistory");
    return allHistory.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function saveScheduleHistory(entries: ScheduleHistoryRecord[]) {
    const db = await getDb();
    if (!db) {
        return;
    }

    const tx = db.transaction("scheduleHistory", "readwrite");
    await tx.store.clear();
    for (const entry of entries) {
        await tx.store.put(entry);
    }
    await tx.done;
}

export async function loadIdentifyHistory() {
    const db = await getDb();
    if (!db) {
        return [] as IdentifyHistoryRecord[];
    }

    const allHistory = await db.getAll("identifyHistory");
    return allHistory.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function saveIdentifyHistory(entries: IdentifyHistoryRecord[]) {
    const db = await getDb();
    if (!db) {
        return;
    }

    const tx = db.transaction("identifyHistory", "readwrite");
    await tx.store.clear();
    for (const entry of entries) {
        await tx.store.put(entry);
    }
    await tx.done;
}

export function prependWithLimit<T>(
    currentItems: T[],
    newItem: T,
    maxItems: number
) {
    return [newItem, ...currentItems].slice(0, maxItems);
}
