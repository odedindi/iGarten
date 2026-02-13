import { deleteDB, openDB, type DBSchema, type IDBPDatabase } from "idb";
import type { Harvest, Task } from "./task-store";

const DB_NAME = "igarten";
const DB_VERSION = 2;
const LEGACY_DB_NAME = "igarten-data";

const LEGACY_TASKS_KEY = "garden_tasks";
const LEGACY_HARVESTS_KEY = "garden_harvests";

const MOCK_TASKS_KEY = "garden_mock_tasks";
const MOCK_HARVESTS_KEY = "garden_mock_harvests";

const MIGRATION_FLAG_KEY = "tasks-harvests-migrated-v1";

interface MetaRecord {
    key: string;
    value: string;
}

interface GardenDataDB extends DBSchema {
    chatConversations: {
        key: string;
        value: { id: string; updatedAt?: string };
        indexes: { "by-updatedAt": string };
    };
    scheduleHistory: {
        key: string;
        value: { id: string; createdAt?: string };
        indexes: { "by-createdAt": string };
    };
    identifyHistory: {
        key: string;
        value: { id: string; createdAt?: string };
        indexes: { "by-createdAt": string };
    };
    tasks: {
        key: string;
        value: Task;
        indexes: { "by-dateCreated": string };
    };
    harvests: {
        key: string;
        value: Harvest;
        indexes: { "by-dateHarvested": string };
    };
    meta: {
        key: string;
        value: MetaRecord;
    };
}

let dbPromise: Promise<IDBPDatabase<GardenDataDB>> | null = null;
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

function isMockId(id: string) {
    return id.endsWith("mock-data");
}

function splitTasks(tasks: Task[]) {
    return {
        mock: tasks.filter((task) => isMockId(task.id)),
        real: tasks.filter((task) => !isMockId(task.id)),
    };
}

function splitHarvests(harvests: Harvest[]) {
    return {
        mock: harvests.filter((harvest) => isMockId(harvest.id)),
        real: harvests.filter((harvest) => !isMockId(harvest.id)),
    };
}

function mergeById<T extends { id: string }>(items: T[]) {
    const map = new Map<string, T>();
    for (const item of items) {
        map.set(item.id, item);
    }
    return Array.from(map.values());
}

function loadMockTasksFromLocalStorage() {
    return safeParse<Task[]>(localStorage.getItem(MOCK_TASKS_KEY), []);
}

function loadMockHarvestsFromLocalStorage() {
    return safeParse<Harvest[]>(localStorage.getItem(MOCK_HARVESTS_KEY), []);
}

function saveMockTasksToLocalStorage(tasks: Task[]) {
    localStorage.setItem(MOCK_TASKS_KEY, JSON.stringify(tasks));
}

function saveMockHarvestsToLocalStorage(harvests: Harvest[]) {
    localStorage.setItem(MOCK_HARVESTS_KEY, JSON.stringify(harvests));
}

async function loadLegacyIndexedDbData() {
    try {
        const legacyDb = await openDB<{
            tasks: {
                key: string;
                value: Task;
                indexes: { "by-dateCreated": string };
            };
            harvests: {
                key: string;
                value: Harvest;
                indexes: { "by-dateHarvested": string };
            };
        }>(LEGACY_DB_NAME, 1);

        const [legacyTasks, legacyHarvests] = await Promise.all([
            legacyDb.getAll("tasks"),
            legacyDb.getAll("harvests"),
        ]);

        legacyDb.close();

        return {
            tasks: legacyTasks,
            harvests: legacyHarvests,
        };
    } catch {
        return {
            tasks: [] as Task[],
            harvests: [] as Harvest[],
        };
    }
}

async function getDb() {
    if (typeof window === "undefined") {
        return null;
    }

    if (!dbPromise) {
        dbPromise = openDB<GardenDataDB>(DB_NAME, DB_VERSION, {
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
                    db.createObjectStore("meta", { keyPath: "key" });
                }
            },
        });
    }

    const db = await dbPromise;
    await ensureMigrated(db);
    return db;
}

async function ensureMigrated(db: IDBPDatabase<GardenDataDB>) {
    if (!migrationPromise) {
        migrationPromise = (async () => {
            const migrationFlag = await db.get("meta", MIGRATION_FLAG_KEY);
            if (migrationFlag?.value === "1") {
                try {
                    await deleteDB(LEGACY_DB_NAME);
                } catch {
                    // no-op
                }
                return;
            }

            const legacyTasks = safeParse<Task[]>(
                localStorage.getItem(LEGACY_TASKS_KEY),
                []
            );
            const legacyHarvests = safeParse<Harvest[]>(
                localStorage.getItem(LEGACY_HARVESTS_KEY),
                []
            );
            const legacyIndexedDbData = await loadLegacyIndexedDbData();

            const splitLegacyTasks = splitTasks(legacyTasks);
            const splitLegacyHarvests = splitHarvests(legacyHarvests);
            const splitLegacyIndexedDbTasks = splitTasks(
                legacyIndexedDbData.tasks
            );
            const splitLegacyIndexedDbHarvests = splitHarvests(
                legacyIndexedDbData.harvests
            );

            const mergedRealTasks = mergeById([
                ...splitLegacyIndexedDbTasks.real,
                ...splitLegacyTasks.real,
            ]);
            const mergedRealHarvests = mergeById([
                ...splitLegacyIndexedDbHarvests.real,
                ...splitLegacyHarvests.real,
            ]);

            const tx = db.transaction(
                ["tasks", "harvests", "meta"],
                "readwrite"
            );

            for (const task of mergedRealTasks) {
                await tx.objectStore("tasks").put(task);
            }

            for (const harvest of mergedRealHarvests) {
                await tx.objectStore("harvests").put(harvest);
            }

            await tx.objectStore("meta").put({
                key: MIGRATION_FLAG_KEY,
                value: "1",
            });

            await tx.done;

            const existingMockTasks = loadMockTasksFromLocalStorage();
            const existingMockHarvests = loadMockHarvestsFromLocalStorage();

            saveMockTasksToLocalStorage(
                mergeById([
                    ...existingMockTasks,
                    ...splitLegacyIndexedDbTasks.mock,
                    ...splitLegacyTasks.mock,
                ])
            );
            saveMockHarvestsToLocalStorage(
                mergeById([
                    ...existingMockHarvests,
                    ...splitLegacyIndexedDbHarvests.mock,
                    ...splitLegacyHarvests.mock,
                ])
            );

            localStorage.removeItem(LEGACY_TASKS_KEY);
            localStorage.removeItem(LEGACY_HARVESTS_KEY);

            try {
                await deleteDB(LEGACY_DB_NAME);
            } catch {
                // no-op
            }
        })();
    }

    await migrationPromise;
}

export async function loadTasksAndHarvests() {
    if (typeof window === "undefined") {
        return {
            tasks: [] as Task[],
            harvests: [] as Harvest[],
        };
    }

    const db = await getDb();

    if (!db) {
        const legacyTasks = safeParse<Task[]>(
            localStorage.getItem(LEGACY_TASKS_KEY),
            []
        );
        const legacyHarvests = safeParse<Harvest[]>(
            localStorage.getItem(LEGACY_HARVESTS_KEY),
            []
        );

        return {
            tasks: legacyTasks,
            harvests: legacyHarvests,
        };
    }

    const [realTasks, realHarvests] = await Promise.all([
        db.getAll("tasks"),
        db.getAll("harvests"),
    ]);

    const mockTasks = loadMockTasksFromLocalStorage();
    const mockHarvests = loadMockHarvestsFromLocalStorage();

    return {
        tasks: [...mockTasks, ...realTasks],
        harvests: [...mockHarvests, ...realHarvests],
    };
}

export async function persistTasks(tasks: Task[]) {
    if (typeof window === "undefined") {
        return;
    }

    const { mock, real } = splitTasks(tasks);
    saveMockTasksToLocalStorage(mock);

    const db = await getDb();
    if (!db) {
        localStorage.setItem(LEGACY_TASKS_KEY, JSON.stringify(tasks));
        return;
    }

    const tx = db.transaction("tasks", "readwrite");
    await tx.store.clear();
    for (const task of real) {
        await tx.store.put(task);
    }
    await tx.done;
}

export async function persistHarvests(harvests: Harvest[]) {
    if (typeof window === "undefined") {
        return;
    }

    const { mock, real } = splitHarvests(harvests);
    saveMockHarvestsToLocalStorage(mock);

    const db = await getDb();
    if (!db) {
        localStorage.setItem(LEGACY_HARVESTS_KEY, JSON.stringify(harvests));
        return;
    }

    const tx = db.transaction("harvests", "readwrite");
    await tx.store.clear();
    for (const harvest of real) {
        await tx.store.put(harvest);
    }
    await tx.done;
}
