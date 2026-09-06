export function formatSeconds(seconds) {
  if (!seconds || Number.isNaN(seconds)) return "0:00";
  const min = Math.floor(seconds / 60);
  const sec = Math.floor(seconds % 60);
  return `${min}:${sec < 10 ? "0" : ""}${sec}`;
}

export function shuffle(arr) {
  return [...arr].sort(() => 0.5 - Math.random());
}
export function sample(arr, n) {
  return shuffle(arr).slice(0, Math.min(n, arr.length));
}

export function dedupeByTitleArtist(arr) {
  const seen = new Set();
  return arr.filter((track) => {
    const key = `${track.title}::${track.artist}`.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function dedupeByArtist(arr) {
  const seen = new Set();
  return arr.filter((track) => {
    const key = track.artist.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
