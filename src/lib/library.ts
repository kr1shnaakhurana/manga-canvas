// Local library / history storage helpers.
export interface LibraryEntry {
  id: string;
  title: string;
  cover: string | null;
  addedAt: number;
}

export interface HistoryEntry {
  mangaId: string;
  mangaTitle: string;
  cover: string | null;
  chapterId: string;
  chapterLabel: string;
  page: number;
  totalPages: number;
  updatedAt: number;
}

const K_FAV = "mv:favorites";
const K_BOOK = "mv:bookmarks";
const K_HIST = "mv:history";

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    window.dispatchEvent(new CustomEvent("mv:storage", { detail: { key } }));
  } catch { /* ignore */ }
}

export const favorites = {
  list: () => read<LibraryEntry[]>(K_FAV, []),
  has: (id: string) => read<LibraryEntry[]>(K_FAV, []).some((e) => e.id === id),
  toggle: (entry: LibraryEntry) => {
    const list = read<LibraryEntry[]>(K_FAV, []);
    const existing = list.find((e) => e.id === entry.id);
    const next = existing ? list.filter((e) => e.id !== entry.id) : [entry, ...list];
    write(K_FAV, next);
    return !existing;
  },
};

export const bookmarks = {
  list: () => read<LibraryEntry[]>(K_BOOK, []),
  has: (id: string) => read<LibraryEntry[]>(K_BOOK, []).some((e) => e.id === id),
  toggle: (entry: LibraryEntry) => {
    const list = read<LibraryEntry[]>(K_BOOK, []);
    const existing = list.find((e) => e.id === entry.id);
    const next = existing ? list.filter((e) => e.id !== entry.id) : [entry, ...list];
    write(K_BOOK, next);
    return !existing;
  },
};

export const history = {
  list: () => read<HistoryEntry[]>(K_HIST, []),
  get: (mangaId: string) => read<HistoryEntry[]>(K_HIST, []).find((h) => h.mangaId === mangaId),
  update: (entry: HistoryEntry) => {
    const list = read<HistoryEntry[]>(K_HIST, []);
    const filtered = list.filter((h) => h.mangaId !== entry.mangaId);
    const next = [entry, ...filtered].slice(0, 100);
    write(K_HIST, next);
  },
  remove: (mangaId: string) => {
    const list = read<HistoryEntry[]>(K_HIST, []);
    write(K_HIST, list.filter((h) => h.mangaId !== mangaId));
  },
  clear: () => write(K_HIST, []),
};
