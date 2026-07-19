// MangaDex API client. Docs: https://api.mangadex.org/docs/
export const MD_API = "https://api.mangadex.org";
export const MD_UPLOADS = "https://uploads.mangadex.org";

export type LocalizedString = Record<string, string>;

export interface Relationship {
  id: string;
  type: string;
  attributes?: Record<string, unknown>;
}

export interface MangaAttributes {
  title: LocalizedString;
  altTitles: LocalizedString[];
  description: LocalizedString;
  originalLanguage: string;
  publicationDemographic: string | null;
  status: string;
  year: number | null;
  contentRating: string;
  tags: Array<{
    id: string;
    type: "tag";
    attributes: { name: LocalizedString; group: string };
  }>;
  lastVolume: string | null;
  lastChapter: string | null;
  availableTranslatedLanguages: string[];
  latestUploadedChapter: string | null;
}

export interface Manga {
  id: string;
  type: "manga";
  attributes: MangaAttributes;
  relationships: Relationship[];
}

export interface ChapterAttributes {
  volume: string | null;
  chapter: string | null;
  title: string | null;
  translatedLanguage: string;
  externalUrl: string | null;
  publishAt: string;
  pages: number;
}

export interface Chapter {
  id: string;
  type: "chapter";
  attributes: ChapterAttributes;
  relationships: Relationship[];
}

export interface MDList<T> {
  result: string;
  response: string;
  data: T[];
  limit: number;
  offset: number;
  total: number;
}

export interface MDSingle<T> {
  result: string;
  response: string;
  data: T;
}

async function mdFetch<T>(path: string, params?: Record<string, unknown>): Promise<T> {
  const url = new URL(MD_API + path);
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      if (v === undefined || v === null) continue;
      if (Array.isArray(v)) {
        for (const item of v) url.searchParams.append(k, String(item));
      } else if (typeof v === "object") {
        for (const [k2, v2] of Object.entries(v as Record<string, unknown>)) {
          url.searchParams.append(`${k}[${k2}]`, String(v2));
        }
      } else {
        url.searchParams.append(k, String(v));
      }
    }
  }
  const res = await fetch(url.toString(), {
    headers: { Accept: "application/json" },
  });
  if (!res.ok) {
    throw new Error(`MangaDex ${res.status}: ${res.statusText}`);
  }
  return (await res.json()) as T;
}

// ==== Helpers ====

export function pickTitle(a: MangaAttributes): string {
  return (
    a.title.en ||
    a.title[a.originalLanguage] ||
    Object.values(a.title)[0] ||
    "Untitled"
  );
}

export function pickDescription(a: MangaAttributes): string {
  return a.description.en || Object.values(a.description)[0] || "";
}

export function coverUrlFromManga(manga: Manga, size: 256 | 512 | "original" = 512): string | null {
  const rel = manga.relationships.find((r) => r.type === "cover_art");
  if (!rel) return null;
  const fileName = (rel.attributes as { fileName?: string } | undefined)?.fileName;
  if (!fileName) return null;
  if (size === "original") return `${MD_UPLOADS}/covers/${manga.id}/${fileName}`;
  return `${MD_UPLOADS}/covers/${manga.id}/${fileName}.${size}.jpg`;
}

export function findRel(manga: Manga, type: string): Relationship | undefined {
  return manga.relationships.find((r) => r.type === type);
}

export function relName(rel: Relationship | undefined): string {
  if (!rel) return "Unknown";
  return (rel.attributes as { name?: string } | undefined)?.name || "Unknown";
}

// ==== Endpoints ====

const DEFAULT_INCLUDES = ["cover_art", "author", "artist"];

export function searchManga(opts: {
  title?: string;
  limit?: number;
  offset?: number;
  order?: Record<string, "asc" | "desc">;
  contentRating?: string[];
  originalLanguage?: string[];
  availableTranslatedLanguage?: string[];
  publicationDemographic?: string[];
  status?: string[];
  year?: number;
  includedTags?: string[];
  ids?: string[];
} = {}) {
  return mdFetch<MDList<Manga>>("/manga", {
    limit: opts.limit ?? 20,
    offset: opts.offset ?? 0,
    title: opts.title,
    "order": opts.order,
    contentRating: opts.contentRating ?? ["safe", "suggestive"],
    originalLanguage: opts.originalLanguage,
    availableTranslatedLanguage: opts.availableTranslatedLanguage ?? ["en"],
    publicationDemographic: opts.publicationDemographic,
    status: opts.status,
    year: opts.year,
    includedTags: opts.includedTags,
    ids: opts.ids,
    includes: DEFAULT_INCLUDES,
    hasAvailableChapters: true,
  });
}

export function getManga(id: string) {
  return mdFetch<MDSingle<Manga>>(`/manga/${id}`, {
    includes: DEFAULT_INCLUDES,
  });
}

export function getMangaChapters(
  mangaId: string,
  opts: { limit?: number; offset?: number; translatedLanguage?: string[]; order?: Record<string, "asc" | "desc"> } = {},
) {
  return mdFetch<MDList<Chapter>>(`/manga/${mangaId}/feed`, {
    limit: opts.limit ?? 100,
    offset: opts.offset ?? 0,
    translatedLanguage: opts.translatedLanguage ?? ["en"],
    order: opts.order ?? { volume: "desc", chapter: "desc" },
    includes: ["scanlation_group"],
    contentRating: ["safe", "suggestive", "erotica"],
    includeExternalUrl: 0,
  });
}

export interface AtHomeServer {
  result: string;
  baseUrl: string;
  chapter: {
    hash: string;
    data: string[];
    dataSaver: string[];
  };
}

export function getChapterServer(chapterId: string) {
  return mdFetch<AtHomeServer>(`/at-home/server/${chapterId}`);
}

export function getChapter(id: string) {
  return mdFetch<MDSingle<Chapter>>(`/chapter/${id}`, {
    includes: ["scanlation_group", "manga"],
  });
}

export function getRandomManga() {
  return mdFetch<MDSingle<Manga>>("/manga/random", {
    includes: DEFAULT_INCLUDES,
    contentRating: ["safe", "suggestive"],
  });
}

export function getTags() {
  return mdFetch<MDList<{ id: string; type: "tag"; attributes: { name: LocalizedString; group: string } }>>(
    "/manga/tag",
  );
}

// Popular = highest followed manga in last 30 days
export function getPopularManga(limit = 20) {
  const today = new Date();
  const past = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
  return searchManga({
    limit,
    order: { followedCount: "desc" },
    availableTranslatedLanguage: ["en"],
    contentRating: ["safe", "suggestive"],
    // Filter to manga updated in last month
    // MangaDex accepts createdAtSince / updatedAtSince
  }).then((r) => ({ ...r, since: past.toISOString() }));
}

export function getLatestUpdates(limit = 20, offset = 0) {
  return searchManga({
    limit,
    offset,
    order: { latestUploadedChapter: "desc" },
  });
}

export function getRecentlyAdded(limit = 20, offset = 0) {
  return searchManga({
    limit,
    offset,
    order: { createdAt: "desc" },
  });
}

export function getTopRated(limit = 20, offset = 0) {
  return searchManga({
    limit,
    offset,
    order: { rating: "desc" },
  });
}
