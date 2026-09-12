import { dedupeByTitleArtist, sample } from "./musicUtils";

const HISTORY_KEY = "bdplay-listening-history";
const MAX_HISTORY = 50;

export function loadListeningHistory() {
  try {
    const saved = JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]");
    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
}

export function recordListening(track) {
  if (!track) return loadListeningHistory();
  const key = `${track.title}::${track.artist}`.toLowerCase();
  const history = loadListeningHistory().filter(
    (item) => `${item.title}::${item.artist}`.toLowerCase() !== key,
  );
  const nextHistory = [track, ...history].slice(0, MAX_HISTORY);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(nextHistory));
  return nextHistory;
}

export function buildRecommendations({
  pool,
  history,
  searchTracks = [],
  count = 20,
}) {
  const recent = dedupeByTitleArtist(history || []);
  const search = dedupeByTitleArtist(searchTracks || []);
  const source = search.length ? search : pool;
  const historyCount = Math.min(recent.length, Math.round(count * 0.5));
  const historyTracks = recent.slice(0, historyCount);
  const genres = new Set(
    [...historyTracks, ...search]
      .map((track) => track.genre?.toLowerCase())
      .filter(Boolean),
  );
  const listened = new Set(
    recent.map((track) => `${track.title}::${track.artist}`.toLowerCase()),
  );
  const candidates = source.filter(
    (track) =>
      !listened.has(`${track.title}::${track.artist}`.toLowerCase()) &&
      !historyTracks.some((item) => item.id === track.id),
  );
  const similar = candidates.filter((track) =>
    genres.has(track.genre?.toLowerCase()),
  );
  return sample(
    [...historyTracks, ...sample(similar.length ? similar : candidates, count - historyCount)],
    count,
  );
}