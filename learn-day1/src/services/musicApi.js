import { COUNTRY, FALLBACK_SEEDS, PLACEHOLDER_COVER, SPOTIFY_ACCESS_TOKEN, YOUTUBE_API_KEY } from "../data/constants";
import { formatSeconds } from "../utils/musicUtils";

function extractAppleId(url) { const match = url && url.match(/\/id(\d+)/); return match ? match[1] : null; }
function formatMs(ms) { return formatSeconds(Math.floor((ms || 0) / 1000)); }

export function mapAppleTrack(track) {
  return { id: track.trackId, title: track.trackName, artist: track.artistName, album: track.collectionName || "Single", cover: (track.artworkUrl100 || "").replace("100x100bb", "600x600bb") || PLACEHOLDER_COVER, duration: formatMs(track.trackTimeMillis || 210000), previewUrl: track.previewUrl || null, genre: track.primaryGenreName || "" };
}

async function fetchChartIds(country, limit = 50) {
  try {
    const response = await fetch(`https://rss.marketingtools.apple.com/api/v2/${country}/music/most-played/${limit}/songs.json`);
    if (!response.ok) throw new Error(`chart ${country} failed`);
    const json = await response.json();
    return (json?.feed?.results || []).map((result) => extractAppleId(result.url)).filter(Boolean);
  } catch (error) { console.error("Chart fetch error", country, error); return []; }
}

async function lookupTracks(ids) {
  if (!ids.length) return [];
  try {
    const response = await fetch(`https://itunes.apple.com/lookup?id=${ids.join(",")}`);
    const json = await response.json();
    const byId = {};
    (json.results || []).forEach((result) => { if (result.wrapperType === "track" && result.kind === "song") byId[String(result.trackId)] = result; });
    return ids.map((id) => byId[id]).filter(Boolean).map(mapAppleTrack);
  } catch (error) { console.error("Lookup error", error); return []; }
}

export async function fetchCountryChart(country, limit = 50) { return lookupTracks(await fetchChartIds(country, limit)); }

export async function fetchSearch(query, limit = 20) {
  try {
    const response = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(query)}&entity=song&limit=${limit}`);
    const json = await response.json();
    return (json.results || []).map(mapAppleTrack);
  } catch (error) { console.error("Search error", error); return []; }
}

let fallbackCatalogPromise;
export async function getMatchedFallbackCatalog() {
  if (!fallbackCatalogPromise) {
    fallbackCatalogPromise = Promise.all(FALLBACK_SEEDS.map(async (seed) => {
      const matches = await fetchSearch(`${seed.title} ${seed.artist}`, 5);
      const exact = matches.find((track) => track.title.toLowerCase() === seed.title.toLowerCase() && track.artist.toLowerCase().includes(seed.artist.toLowerCase()));
      return exact ? { ...exact, genre: seed.genre, country: seed.country } : seed;
    }));
  }
  return fallbackCatalogPromise;
}

const spotifyTrackCache = new Map();
export async function searchSpotifyTrack(track) {
  if (!SPOTIFY_ACCESS_TOKEN) return null;
  const query = `${track.title} ${track.artist}`;
  if (spotifyTrackCache.has(query)) return spotifyTrackCache.get(query);
  try {
    const response = await fetch(`https://api.spotify.com/v1/search?type=track&limit=5&q=${encodeURIComponent(query)}`, { headers: { Authorization: `Bearer ${SPOTIFY_ACCESS_TOKEN}` } });
    if (!response.ok) return null;
    const data = await response.json();
    const match = (data.tracks?.items || []).find((item) => item.name.toLowerCase() === track.title.toLowerCase() && item.artists.some((artist) => artist.name.toLowerCase() === track.artist.toLowerCase())) || data.tracks?.items?.[0];
    const result = match ? { id: match.id, uri: match.uri, duration: formatMs(match.duration_ms), durationSeconds: match.duration_ms / 1000, cover: match.album.images?.[0]?.url || track.cover } : null;
    spotifyTrackCache.set(query, result);
    return result;
  } catch (error) { console.error("Spotify track lookup failed", error); return null; }
}

const ytIdCache = new Map();
export async function searchYouTubeVideoId(query) {
  if (!YOUTUBE_API_KEY || YOUTUBE_API_KEY.startsWith("YOUR_")) return null;
  if (ytIdCache.has(query)) return ytIdCache.get(query);
  try {
    const response = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=1&type=video&videoCategoryId=10&q=${encodeURIComponent(query)}&key=${YOUTUBE_API_KEY}`);
    const data = await response.json();
    const videoId = data?.items?.[0]?.id?.videoId || null;
    ytIdCache.set(query, videoId);
    return videoId;
  } catch (error) { console.error("YouTube search failed", error); return null; }
}

export { COUNTRY };
