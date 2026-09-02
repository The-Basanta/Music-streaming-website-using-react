import { useEffect, useRef, useState, useCallback } from "react";
import "./App.css";

/* ============================================================
   CONFIG
   ============================================================
   Set VITE_YOUTUBE_API_KEY in .env.local to unlock FULL-LENGTH playback.
   Without a key, the app uses the exact iTunes-matched preview for each song;
   it never plays unrelated audio.

   How to get a free key (takes ~2 minutes):
   1. https://console.cloud.google.com/ -> create/select a project
   2. "APIs & Services" -> "Library" -> enable "YouTube Data API v3"
   3. "APIs & Services" -> "Credentials" -> "Create Credentials" -> API key
   4. Put it in .env.local as VITE_YOUTUBE_API_KEY=your_key. Free quota is ~100 searches/day (10,000 units,
      a search costs 100 units) — plenty for personal use since this
      app caches every lookup for the session.
   ============================================================ */
const YOUTUBE_API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY || "YOUR_YOUTUBE_DATA_API_KEY";
const SPOTIFY_ACCESS_TOKEN = import.meta.env.VITE_SPOTIFY_ACCESS_TOKEN || "";
const SPOTIFY_CLIENT_ID = import.meta.env.VITE_SPOTIFY_CLIENT_ID || "";

// Countries pulled from Apple's official charts feed (ISO store codes)
const COUNTRY = {
  US: "us",
  UK: "gb",
  AU: "au",
  CA: "ca",
  DE: "de",
  JP: "jp",
  PH: "ph",
  MX: "mx",
  AR: "ar",
};

const GENRE_MATCH = {
  pop: /^pop$/i,
  rnb: /r&b|soul/i,
  edm: /dance|electronic/i,
};

const PLACEHOLDER_COVER =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 600 600'%3E%3Crect width='600' height='600' fill='%23141414'/%3E%3Ccircle cx='300' cy='300' r='150' fill='none' stroke='%23555555' stroke-width='10'/%3E%3Ccircle cx='300' cy='300' r='35' fill='%23ffffff'/%3E%3C/svg%3E";

// A local safety net keeps the app useful when a live server blocks a chart
// request. The catalog is intentionally larger than each displayed section so
// every refresh can show a different selection.
const FALLBACK_SEEDS = [
  ["Blinding Lights", "The Weeknd", "Pop", "US"],
  ["As It Was", "Harry Styles", "Pop", "UK"],
  ["Espresso", "Sabrina Carpenter", "Pop", "US"],
  ["Cruel Summer", "Taylor Swift", "Pop", "US"],
  ["Flowers", "Miley Cyrus", "Pop", "US"],
  ["Houdini", "Dua Lipa", "Pop", "UK"],
  ["Good 4 U", "Olivia Rodrigo", "Pop", "US"],
  ["greedy", "Tate McRae", "Pop", "CA"],
  ["Watermelon Sugar", "Harry Styles", "Pop", "UK"],
  ["Anti-Hero", "Taylor Swift", "Pop", "US"],
  ["I Had Some Help", "Post Malone", "Pop", "US"],
  ["Beautiful Things", "Benson Boone", "Pop", "US"],
  ["Snooze", "SZA", "R&B", "US"],
  ["Kill Bill", "SZA", "R&B", "US"],
  ["Saturn", "SZA", "R&B", "US"],
  ["One Of The Girls", "The Weeknd", "R&B", "US"],
  ["Pink + White", "Frank Ocean", "R&B", "US"],
  ["Made For Me", "Muni Long", "R&B", "US"],
  ["ICU", "Coco Jones", "R&B", "US"],
  ["No One", "Alicia Keys", "R&B", "US"],
  ["Adorn", "Miguel", "R&B", "US"],
  ["Damage", "H.E.R.", "R&B", "US"],
  ["Innerbloom", "RUFUS DU SOL", "EDM", "AU"],
  ["The Nights", "Avicii", "EDM", "SE"],
  ["Wake Me Up", "Avicii", "EDM", "SE"],
  ["Animals", "Martin Garrix", "EDM", "NL"],
  ["One Kiss", "Calvin Harris", "EDM", "UK"],
  ["Where You Are", "John Summit", "EDM", "US"],
  ["Ferrari", "James Hype", "EDM", "UK"],
  ["Levels", "Avicii", "EDM", "SE"],
  ["I Remember", "Kaskade", "EDM", "US"],
  ["Don't You Worry Child", "Swedish House Mafia", "EDM", "SE"],
  ["アイドル", "YOASOBI", "J-Pop", "JP"],
  ["夜に駆ける", "YOASOBI", "J-Pop", "JP"],
  ["青のすみか", "キタニタツヤ", "J-Pop", "JP"],
  ["唱", "Ado", "J-Pop", "JP"],
  ["Lemon", "Kenshi Yonezu", "J-Pop", "JP"],
  ["Magnetic", "ILLIT", "Pop", "JP"],
  ["Bling-Bang-Bang-Born", "Creepy Nuts", "J-Pop", "JP"],
  ["SPECIALZ", "King Gnu", "J-Pop", "JP"],
  ["Pretender", "Official HIGE DANdism", "J-Pop", "JP"],
  ["KICK BACK", "Kenshi Yonezu", "J-Pop", "JP"],
  ["Pantropiko", "BINI", "Pop", "PH"],
  ["Salamin, Salamin", "BINI", "Pop", "PH"],
  ["ERE", "juan karlos", "Pop", "PH"],
  ["Dilaw", "Maki", "Pop", "PH"],
  ["Araw-Araw", "Ben&Ben", "Pop", "PH"],
  ["Tadhana", "Up Dharma Down", "Pop", "PH"],
  ["Raining in Manila", "Lola Amour", "Pop", "PH"],
  ["Ikaw Lang", "NOBITA", "Pop", "PH"],
  ["Mundo", "IV of Spades", "Pop", "PH"],
  ["Mahika", "Adie", "Pop", "PH"],
  ["La Bebe", "Yng Lvcas", "Latin", "MX"],
  ["Ella Baila Sola", "Eslabon Armado", "Latin", "MX"],
  ["LALA", "Myke Towers", "Latin", "AR"],
  ["PROVENZA", "Karol G", "Latin", "CO"],
  ["DESPECHÁ", "ROSALÍA", "Latin", "ES"],
  ["Bailando", "Enrique Iglesias", "Latin", "ES"],
  ["TQG", "Karol G", "Latin", "CO"],
  ["La Falda", "Myke Towers", "Latin", "PR"],
  ["Un x100to", "Grupo Frontera", "Latin", "MX"],
  ["Qué Onda", "Calle 24", "Latin", "MX"],
].map(([title, artist, genre, country], index) => ({
  id: `fallback-${index}`,
  title,
  artist,
  album: "Single",
  cover: PLACEHOLDER_COVER,
  duration: "3:30",
  durationSeconds: 210,
  genre,
  country,
  views: `${(2.4 + (index * 1.7) % 18).toFixed(1)}M monthly listeners`,
  previewUrl: null,
}));

function mergeWithFallback(tracks) {
  return dedupeByTitleArtist([...(tracks || []), ...fallbackCatalog]);
}

function fallbackForCountry(country) {
  const countryCode = country.toUpperCase();
  return fallbackCatalog.filter((track) => track.country === countryCode);
}

let fallbackCatalog = FALLBACK_SEEDS;

/* ============================================================
   DATA LAYER — Apple's public, unauthenticated endpoints
   ============================================================
   1) Chart feed (rss.marketingtools.apple.com) gives real, currently
      -charting song IDs per country — this replaces the old "search
      8 random artist names and hope one has a preview" approach,
      which is why you were seeing only one song / "no songs".
   2) iTunes lookup (itunes.apple.com/lookup) turns those IDs into
      full track objects (art, preview URL, real duration, genre).
   ============================================================ */

function extractAppleId(url) {
  const m = url && url.match(/\/id(\d+)/);
  return m ? m[1] : null;
}

function formatMs(ms) {
  const totalSec = Math.floor((ms || 0) / 1000);
  const min = Math.floor(totalSec / 60);
  const sec = totalSec % 60;
  return `${min}:${sec < 10 ? "0" : ""}${sec}`;
}

function formatSeconds(seconds) {
  if (!seconds || isNaN(seconds)) return "0:00";
  const min = Math.floor(seconds / 60);
  const sec = Math.floor(seconds % 60);
  return `${min}:${sec < 10 ? "0" : ""}${sec}`;
}

function shuffle(arr) {
  return [...arr].sort(() => 0.5 - Math.random());
}

function sample(arr, n) {
  return shuffle(arr).slice(0, Math.min(n, arr.length));
}

function dedupeByTitleArtist(arr) {
  const seen = new Set();
  const out = [];
  for (const t of arr) {
    const key = `${t.title}::${t.artist}`.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      out.push(t);
    }
  }
  return out;
}

function dedupeByArtist(arr) {
  const seen = new Set();
  const out = [];
  for (const t of arr) {
    const key = t.artist.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      out.push(t);
    }
  }
  return out;
}

function mapAppleTrack(t) {
  return {
    id: t.trackId,
    title: t.trackName,
    artist: t.artistName,
    album: t.collectionName || "Single",
    cover: (t.artworkUrl100 || "").replace("100x100bb", "600x600bb") || PLACEHOLDER_COVER,
    duration: formatMs(t.trackTimeMillis || 210000),
    previewUrl: t.previewUrl || null,
    genre: t.primaryGenreName || "",
  };
}

async function fetchChartIds(country, limit = 50) {
  try {
    const res = await fetch(
      `https://rss.marketingtools.apple.com/api/v2/${country}/music/most-played/${limit}/songs.json`
    );
    if (!res.ok) throw new Error(`chart ${country} failed`);
    const json = await res.json();
    return (json?.feed?.results || []).map((r) => extractAppleId(r.url)).filter(Boolean);
  } catch (err) {
    console.error("Chart fetch error", country, err);
    return [];
  }
}

async function lookupTracks(ids) {
  if (!ids.length) return [];
  try {
    const res = await fetch(`https://itunes.apple.com/lookup?id=${ids.join(",")}`);
    const json = await res.json();
    const byId = {};
    (json.results || []).forEach((r) => {
      if (r.wrapperType === "track" && r.kind === "song") byId[String(r.trackId)] = r;
    });
    return ids.map((id) => byId[id]).filter(Boolean).map(mapAppleTrack);
  } catch (err) {
    console.error("Lookup error", err);
    return [];
  }
}

async function fetchCountryChart(country, limit = 50) {
  const ids = await fetchChartIds(country, limit);
  return lookupTracks(ids);
}

async function fetchSearch(query, limit = 20) {
  try {
    const res = await fetch(
      `https://itunes.apple.com/search?term=${encodeURIComponent(query)}&entity=song&limit=${limit}`
    );
    const json = await res.json();
    return (json.results || []).map(mapAppleTrack);
  } catch (err) {
    console.error("Search error", err);
    return [];
  }
}

let fallbackCatalogPromise;
async function getMatchedFallbackCatalog() {
  if (!fallbackCatalogPromise) {
    fallbackCatalogPromise = Promise.all(
      FALLBACK_SEEDS.map(async (seed) => {
        const [title, artist, genre, country] = [
          seed.title,
          seed.artist,
          seed.genre,
          seed.country,
        ];
        const matches = await fetchSearch(`${title} ${artist}`, 5);
        const exact = matches.find(
          (track) =>
            track.title.toLowerCase() === title.toLowerCase() &&
            track.artist.toLowerCase().includes(artist.toLowerCase())
        );
        return exact ? { ...exact, genre, country } : seed;
      })
    );
  }
  return fallbackCatalogPromise;
}

/* ============================================================
   YOUTUBE VIDEO LOOKUP (for full-length playback)
   ============================================================ */
const ytIdCache = new Map();

async function searchYouTubeVideoId(query) {
  if (!YOUTUBE_API_KEY || YOUTUBE_API_KEY.startsWith("YOUR_")) return null;
  if (ytIdCache.has(query)) return ytIdCache.get(query);
  try {
    const res = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=1&type=video&videoCategoryId=10&q=${encodeURIComponent(
        query
      )}&key=${YOUTUBE_API_KEY}`
    );
    const data = await res.json();
    const videoId = data?.items?.[0]?.id?.videoId || null;
    ytIdCache.set(query, videoId);
    return videoId;
  } catch (err) {
    console.error("YouTube search failed", err);
    return null;
  }

}

const spotifyTrackCache = new Map();
async function searchSpotifyTrack(track) {
  if (!SPOTIFY_ACCESS_TOKEN) return null;
  const query = `${track.title} ${track.artist}`;
  if (spotifyTrackCache.has(query)) return spotifyTrackCache.get(query);
  try {
    const response = await fetch(
      `https://api.spotify.com/v1/search?type=track&limit=5&q=${encodeURIComponent(query)}`,
      { headers: { Authorization: `Bearer ${SPOTIFY_ACCESS_TOKEN}` } }
    );
    if (!response.ok) return null;
    const data = await response.json();
    const match = (data.tracks?.items || []).find(
      (item) =>
        item.name.toLowerCase() === track.title.toLowerCase() &&
        item.artists.some((artist) => artist.name.toLowerCase() === track.artist.toLowerCase())
    ) || data.tracks?.items?.[0];
    const result = match
      ? { id: match.id, uri: match.uri, duration: formatMs(match.duration_ms), durationSeconds: match.duration_ms / 1000, cover: match.album.images?.[0]?.url || track.cover }
      : null;
    spotifyTrackCache.set(query, result);
    return result;
  } catch (error) {
    console.error("Spotify track lookup failed", error);
    return null;
  }
}

/* ============================================================
   PRESENTATIONAL COMPONENTS (module-level so they don't remount
   every time App re-renders, e.g. on each search keystroke)
   ============================================================ */
function TrackGrid({ tracks, onPlay }) {
  if (!tracks.length) return <div className="empty-text">Loading songs...</div>;
  return (
    <div className="media-grid">
      {tracks.map((t, i) => (
        <div className="media-card" key={`${t.id}-${i}`} onClick={() => onPlay(t, tracks, i)}>
          <div className="image-wrapper">
            <img src={t.cover || PLACEHOLDER_COVER} alt={t.title} onError={(e) => { e.currentTarget.src = PLACEHOLDER_COVER; }} />
            <div className="play-overlay">
              <span>&#9654;</span>
              <span>{t.duration}</span>
            </div>
          </div>
          <div className="media-title">{t.title}</div>
          <div className="media-subtitle">{t.artist}</div>
        </div>
      ))}
    </div>
  );
}

function ArtistGrid({ artists, onSelectArtist }) {
  if (!artists.length) return <div className="empty-text">Loading artists...</div>;
  return (
    <div className="media-grid artist-grid">
      {artists.map((t, i) => (
        <div className="artist-card" key={`${t.artist}-${i}`} onClick={() => onSelectArtist(t.artist)}>
          <img className="artist-avatar" src={t.cover || PLACEHOLDER_COVER} alt={t.artist} onError={(e) => { e.currentTarget.src = PLACEHOLDER_COVER; }} />
          <div className="media-title" style={{ textAlign: "center" }}>{t.artist}</div>
          <div className="media-subtitle" style={{ textAlign: "center" }}>
            {t.views || "Trending now"}
          </div>
        </div>
      ))}
    </div>
  );
}

function SectionHeader({ title, onShuffle }) {
  return (
    <div className="section-title-row">
      <div className="section-title">{title}</div>
      {onShuffle && (
        <button className="action-btn" onClick={onShuffle}>
          &#128256; Shuffle
        </button>
      )}
    </div>
  );
}

/* ============================================================
   APP
   ============================================================ */
export default function App() {
  const [activeTab, setActiveTab] = useState("home");

  const [orbitTracks, setOrbitTracks] = useState([]);
  const [newArtists, setNewArtists] = useState([]);
  const [popTracks, setPopTracks] = useState([]);
  const [rnbTracks, setRnbTracks] = useState([]);
  const [edmTracks, setEdmTracks] = useState([]);
  const [homeLoading, setHomeLoading] = useState(true);
  const homePoolRef = useRef([]);

  const [globalHits, setGlobalHits] = useState([]);
  const [usaHits, setUsaHits] = useState([]);
  const [japanHits, setJapanHits] = useState([]);
  const [phHits, setPhHits] = useState([]);
  const [latinHits, setLatinHits] = useState([]);
  const [hitsLoading, setHitsLoading] = useState(true);
  const chartPoolRef = useRef({ us: [], gb: [], jp: [], ph: [], latin: [] });

  const [playlists, setPlaylists] = useState({});

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchActive, setSearchActive] = useState(false);
  const searchTimer = useRef(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalTracks, setModalTracks] = useState([]);
  const [modalLoading, setModalLoading] = useState(false);

  const [currentTrack, setCurrentTrack] = useState(null);
  const [currentList, setCurrentList] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(80);
  const [loadingTrack, setLoadingTrack] = useState(false);
  const [playbackNote, setPlaybackNote] = useState("");
  const [playerExpanded, setPlayerExpanded] = useState(false);
  const [volumeHovered, setVolumeHovered] = useState(false);

  const audioRef = useRef(null);
  const ytPlayerRef = useRef(null);
  const spotifyPlayerRef = useRef(null);
  const playbackModeRef = useRef(null); // 'youtube' | 'preview'
  const pollRef = useRef(null);
  const [ytReady, setYtReady] = useState(false);
  const [spotifyReady, setSpotifyReady] = useState(false);
  const nextTrackRef = useRef(() => {});

  useEffect(() => {
    if (!SPOTIFY_ACCESS_TOKEN || !SPOTIFY_CLIENT_ID) return;
    const existing = document.querySelector('script[src="https://sdk.scdn.co/spotify-player.js"]');
    if (!existing) {
      const script = document.createElement("script");
      script.src = "https://sdk.scdn.co/spotify-player.js";
      script.async = true;
      document.body.appendChild(script);
    }
    window.onSpotifyWebPlaybackSDKReady = () => setSpotifyReady(true);
  }, []);

  useEffect(() => {
    if (!spotifyReady || spotifyPlayerRef.current) return;
    const player = new window.Spotify.Player({
      name: "BDplay Web Player",
      getOAuthToken: (callback) => callback(SPOTIFY_ACCESS_TOKEN),
      volume: 0.8,
    });
    player.addListener("ready", ({ device_id }) => {
      spotifyPlayerRef.current.deviceId = device_id;
      setPlaybackNote("Spotify speaker connected.");
    });
    player.addListener("player_state_changed", (state) => {
      if (!state) return;
      setIsPlaying(!state.paused);
      setCurrentTime(state.position / 1000);
      setDuration(state.duration / 1000);
    });
    player.addListener("initialization_error", ({ message }) => setPlaybackNote(`Spotify: ${message}`));
    player.addListener("authentication_error", ({ message }) => setPlaybackNote(`Spotify login required: ${message}`));
    player.addListener("account_error", ({ message }) => setPlaybackNote(`Spotify Premium required: ${message}`));
    player.connect();
    spotifyPlayerRef.current = player;
    return () => player.disconnect();
  }, [spotifyReady]);

  /* -------------------- YouTube IFrame API bootstrap -------------------- */
  useEffect(() => {
    if (window.YT && window.YT.Player) {
      window.setTimeout(() => setYtReady(true), 0);
      return;
    }
    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    document.body.appendChild(tag);
    const prev = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      if (prev) prev();
      setYtReady(true);
    };
  }, []);

  useEffect(() => {
    if (!ytReady || ytPlayerRef.current) return;
    ytPlayerRef.current = new window.YT.Player("yt-player-container", {
      height: "0",
      width: "0",
      playerVars: { playsinline: 1 },
      events: {
        onStateChange: (e) => {
          const YTState = window.YT.PlayerState;
          if (e.data === YTState.PLAYING) {
            setIsPlaying(true);
            setLoadingTrack(false);
            setDuration(ytPlayerRef.current.getDuration() || 0);
          } else if (e.data === YTState.PAUSED) {
            setIsPlaying(false);
          } else if (e.data === YTState.ENDED) {
            nextTrackRef.current();
          }
        },
      },
    });
     
  }, [ytReady]);

  // progress polling while playing
  useEffect(() => {
    clearInterval(pollRef.current);
    if (!isPlaying) return;
    pollRef.current = setInterval(() => {
      if (playbackModeRef.current === "youtube" && ytPlayerRef.current?.getCurrentTime) {
        setCurrentTime(ytPlayerRef.current.getCurrentTime() || 0);
        setDuration(ytPlayerRef.current.getDuration() || 0);
      } else if (playbackModeRef.current === "spotify" && spotifyPlayerRef.current) {
        spotifyPlayerRef.current.getCurrentState().then((state) => {
          if (state) {
            setCurrentTime(state.position / 1000);
            setDuration(state.duration / 1000);
          }
        });
      } else if (playbackModeRef.current === "preview" && audioRef.current) {
        setCurrentTime(audioRef.current.currentTime || 0);
        setDuration(audioRef.current.duration || 0);
      }
    }, 400);
    return () => clearInterval(pollRef.current);
  }, [isPlaying]);

  /* -------------------- Home data -------------------- */
  const loadHome = useCallback(async () => {
    setHomeLoading(true);
    homePoolRef.current = fallbackCatalog;
    refreshHomeSections(fallbackCatalog);
    setHomeLoading(false);
    const [charts, matchedFallback] = await Promise.all([
      Promise.all(
        [COUNTRY.US, COUNTRY.UK, COUNTRY.AU, COUNTRY.CA, COUNTRY.DE].map((c) => fetchCountryChart(c, 50))
      ),
      getMatchedFallbackCatalog(),
    ]);
    fallbackCatalog = matchedFallback;
    const pool = mergeWithFallback(charts.flat());
    homePoolRef.current = pool;
    refreshHomeSections(pool);
  }, []);

  function refreshHomeSections(pool) {
    setOrbitTracks(sample(pool, 12));
    setNewArtists(sample(dedupeByArtist(pool), 12));
    setPopTracks(sample(pool.filter((t) => GENRE_MATCH.pop.test(t.genre)), 20));
    setRnbTracks(sample(pool.filter((t) => GENRE_MATCH.rnb.test(t.genre)), 20));
    setEdmTracks(sample(pool.filter((t) => GENRE_MATCH.edm.test(t.genre)), 20));
  }

  function shuffleHomeSection(setter, filterFn, count) {
    const pool = homePoolRef.current;
    const filtered = filterFn ? pool.filter(filterFn) : pool;
    setter(sample(filtered, count));
  }

  /* -------------------- Top Hits data -------------------- */
  const loadTopHits = useCallback(async () => {
    setHitsLoading(true);
    chartPoolRef.current = {
      us: fallbackForCountry("US"),
      gb: fallbackForCountry("UK"),
      jp: fallbackForCountry("JP"),
      ph: fallbackForCountry("PH"),
      latin: fallbackForCountry("MX"),
    };
    refreshHitsSections();
    setHitsLoading(false);
    const [usResult, gbResult, jpResult, phResult, mxResult, arResult, matchedFallback] = await Promise.all([
      fetchCountryChart(COUNTRY.US, 100),
      fetchCountryChart(COUNTRY.UK, 100),
      fetchCountryChart(COUNTRY.JP, 100),
      fetchCountryChart(COUNTRY.PH, 100),
      fetchCountryChart(COUNTRY.MX, 100),
      fetchCountryChart(COUNTRY.AR, 100),
      getMatchedFallbackCatalog(),
    ]);
    fallbackCatalog = matchedFallback;
    const us = dedupeByTitleArtist([...usResult, ...fallbackForCountry("US")]);
    const gb = dedupeByTitleArtist([...gbResult, ...fallbackForCountry("UK")]);
    const jp = dedupeByTitleArtist([...jpResult, ...fallbackForCountry("JP")]);
    const ph = dedupeByTitleArtist([...phResult, ...fallbackForCountry("PH")]);
    const mx = dedupeByTitleArtist([...mxResult, ...fallbackForCountry("MX")]);
    const ar = dedupeByTitleArtist([...arResult, ...fallbackForCountry("AR")]);
    chartPoolRef.current = { us, gb, jp, ph, latin: dedupeByTitleArtist([...mx, ...ar]) };
    refreshHitsSections();
  }, []);

  function refreshHitsSections() {
    const { us, gb, jp, ph, latin } = chartPoolRef.current;
    setGlobalHits(sample(dedupeByTitleArtist([...us, ...gb]), 20));
    setUsaHits(sample(us, 20));
    setJapanHits(sample(jp, Math.min(20, jp.length)));
    setPhHits(sample(ph, Math.min(20, ph.length)));
    setLatinHits(sample(latin, Math.min(20, latin.length)));
  }

  /* -------------------- Initial load + tab switching (reload = fresh variety) -------------------- */
  useEffect(() => {
    window.setTimeout(() => {
      loadHome();
      setVolume(80);
    }, 0);
    // loadHome and setVolume are stable for this initial-load effect.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function switchTab(tab) {
    setActiveTab(tab);
    if (tab === "home") loadHome();
    if (tab === "hits") loadTopHits();
  }

  /* -------------------- Playback -------------------- */
  async function playTrack(track, list, index) {
    if (!track) return;
    setCurrentTrack(track);
    if (list) setCurrentList(list);
    if (index !== undefined) setCurrentIndex(index);
    setCurrentTime(0);
    setDuration(0);
    setLoadingTrack(true);
    setPlaybackNote("");

    // stop whatever is currently playing
    if (audioRef.current) audioRef.current.pause();
    if (ytPlayerRef.current?.stopVideo) ytPlayerRef.current.stopVideo();
    if (spotifyPlayerRef.current?.pause) spotifyPlayerRef.current.pause();

    if (spotifyPlayerRef.current) {
      const spotifyTrack = await searchSpotifyTrack(track);
      if (spotifyTrack) {
        playbackModeRef.current = "spotify";
        setCurrentTrack({ ...track, ...spotifyTrack });
        setDuration(spotifyTrack.durationSeconds);
        spotifyPlayerRef.current.activateElement();
        const response = await fetch(
          `https://api.spotify.com/v1/me/player/play?device_id=${spotifyPlayerRef.current.deviceId}`,
          {
            method: "PUT",
            headers: {
              Authorization: `Bearer ${SPOTIFY_ACCESS_TOKEN}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ uris: [spotifyTrack.uri] }),
          }
        );
        if (response.ok) {
          setLoadingTrack(false);
          return;
        }
        setPlaybackNote("Spotify could not start playback. Check Premium access and device connection.");
      }
    }

    const hasYoutubeKey = YOUTUBE_API_KEY && !YOUTUBE_API_KEY.startsWith("YOUR_");

    if (hasYoutubeKey && ytPlayerRef.current) {
      const videoId = await searchYouTubeVideoId(`${track.artist} ${track.title} official audio`);
      if (videoId) {
        playbackModeRef.current = "youtube";
        ytPlayerRef.current.loadVideoById(videoId);
        ytPlayerRef.current.setVolume(volume);
        setLoadingTrack(false);
        return;
      }
      setPlaybackNote("Full track not found on YouTube - playing the matched preview.");
    } else if (!hasYoutubeKey) {
      setPlaybackNote("Playing the matched track preview. Add a YouTube API key for full-length playback.");
    }

    let playableTrack = track;
    if (!track.previewUrl && !track.fullTrackUrl) {
      const matches = await fetchSearch(`${track.title} ${track.artist}`, 5);
      playableTrack =
        matches.find(
          (match) =>
            match.title.toLowerCase() === track.title.toLowerCase() &&
            match.artist.toLowerCase().includes(track.artist.toLowerCase())
        ) || track;
      setCurrentTrack(playableTrack);
      if (playableTrack.previewUrl && list) {
        const nextList = list.map((item) => (item.id === track.id ? playableTrack : item));
        setCurrentList(nextList);
      }
    }
    const audioSource = playableTrack.fullTrackUrl || playableTrack.previewUrl;
    if (audioSource && audioRef.current) {
      playbackModeRef.current = "preview";
      audioRef.current.src = audioSource;
      audioRef.current.currentTime = 0;
      audioRef.current
        .play()
        .then(() => setLoadingTrack(false))
        .catch((err) => {
          console.error("Audio playback error", err);
          setPlaybackNote("This track could not be played by the browser.");
          setLoadingTrack(false);
        });
    } else {
      setLoadingTrack(false);
      setPlaybackNote("No playable source available for this track.");
    }
  }

  function togglePlay() {
    if (!currentTrack) return;
    if (playbackModeRef.current === "spotify" && spotifyPlayerRef.current) {
      if (isPlaying) spotifyPlayerRef.current.pause();
      else spotifyPlayerRef.current.resume();
    } else if (playbackModeRef.current === "youtube" && ytPlayerRef.current) {
      const state = ytPlayerRef.current.getPlayerState();
      if (state === window.YT.PlayerState.PLAYING) ytPlayerRef.current.pauseVideo();
      else ytPlayerRef.current.playVideo();
    } else if (playbackModeRef.current === "preview" && audioRef.current) {
      if (audioRef.current.paused) {
        audioRef.current.play();
        setIsPlaying(true);
      } else {
        audioRef.current.pause();
        setIsPlaying(false);
      }
    } else {
      playTrack(currentTrack, currentList, currentIndex);
    }
  }

  function nextTrack() {
    if (currentList.length === 0) return;
    const i = (currentIndex + 1) % currentList.length;
    playTrack(currentList[i], currentList, i);
  }
  useEffect(() => {
    nextTrackRef.current = nextTrack;
  });

  function prevTrack() {
    if (currentList.length === 0) return;
    const i = (currentIndex - 1 + currentList.length) % currentList.length;
    playTrack(currentList[i], currentList, i);
  }

  function seekTrack(value) {
    const pct = Number(value) / 100;
    if (playbackModeRef.current === "spotify" && spotifyPlayerRef.current && duration) {
      spotifyPlayerRef.current.seek(Number(pct * duration * 1000));
    } else if (playbackModeRef.current === "youtube" && ytPlayerRef.current && duration) {
      ytPlayerRef.current.seekTo(pct * duration, true);
    } else if (playbackModeRef.current === "preview" && audioRef.current && audioRef.current.duration) {
      audioRef.current.currentTime = pct * audioRef.current.duration;
    }
  }

  function setVolume(value) {
    setVolumeState(Number(value));
    if (playbackModeRef.current === "youtube" && ytPlayerRef.current?.setVolume) {
      ytPlayerRef.current.setVolume(Number(value));
    } else if (playbackModeRef.current === "spotify" && spotifyPlayerRef.current) {
      spotifyPlayerRef.current.setVolume(Number(value) / 100);
    } else if (audioRef.current) {
      audioRef.current.volume = Math.max(0, Math.min(1, Number(value) / 100));
    }

  }

  function openPlayer() {
    if (currentTrack) setPlayerExpanded(true);
  }

  // keep <audio> events in sync with React state when in preview mode
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onPlay = () => playbackModeRef.current === "preview" && setIsPlaying(true);
    const onPause = () => playbackModeRef.current === "preview" && setIsPlaying(false);
    const onEnded = () => playbackModeRef.current === "preview" && nextTrack();
    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("ended", onEnded);
    return () => {
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("ended", onEnded);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentList, currentIndex]);

  /* -------------------- Search -------------------- */
  function handleSearchInput(value) {
    setSearchQuery(value);
    clearTimeout(searchTimer.current);
    if (!value.trim()) {
      setSearchResults([]);
      setSearchActive(false);
      return;
    }
    searchTimer.current = setTimeout(async () => {
      const results = await fetchSearch(value, 20);
      setSearchResults(results);
      setSearchActive(true);
    }, 300);
  }

  function clearSearch() {
    setSearchQuery("");
    setSearchResults([]);
    setSearchActive(false);
  }

  /* -------------------- Modal: artist hits / album tracks -------------------- */
  async function showArtistTopHits(artist) {
    setModalOpen(true);
    setModalTitle(`Top Hits — ${artist}`);
    setModalLoading(true);
    const tracks = await fetchSearch(artist, 30);
    setModalTracks(tracks);
    setModalLoading(false);
  }

  async function showAlbumTracks(album, artist) {
    setModalOpen(true);
    setModalTitle(`Album — ${album}`);
    setModalLoading(true);
    const tracks = await fetchSearch(`${album} ${artist}`, 30);
    setModalTracks(tracks);
    setModalLoading(false);
  }

  /* -------------------- Playlists -------------------- */
  function addCurrentToPlaylist() {
    if (!currentTrack) {
      alert("Please play a song first!");
      return;
    }
    const existing = Object.keys(playlists);
    let msg = "Enter playlist name:";
    if (existing.length) msg += "\nExisting: " + existing.join(", ");
    const name = prompt(msg);
    if (!name) return;
    setPlaylists((prev) => {
      const list = prev[name] ? [...prev[name], currentTrack] : [currentTrack];
      return { ...prev, [name]: list };
    });
  }

  function createNewPlaylist() {
    const name = prompt("New playlist name:");
    if (!name) return;
    setPlaylists((prev) => (prev[name] ? prev : { ...prev, [name]: [] }));
  }

  function openPlaylist(name) {
    setModalOpen(true);
    setModalTitle(`Playlist — ${name}`);
    setModalTracks(playlists[name] || []);
    setModalLoading(false);
  }

  const progressPct = duration ? (currentTime / duration) * 100 : 0;

  return (
    <div className="bdplay-root">
      {/* HEADER */}
      <header>
        <div className="logo">BDplay</div>
        <div className="nav-center">
          <div className="search-box">
            <span className="search-icon">&#128269;</span>
            <input
              type="text"
              placeholder="Search song or artist..."
              value={searchQuery}
              onChange={(e) => handleSearchInput(e.target.value)}
            />
            <button className="clear-search" onClick={clearSearch} type="button" title="Clear search">
              &times;
            </button>
            {searchActive && (
              <div className="search-results active">
                {searchResults.length === 0 && (
                  <div className="search-item" style={{ color: "var(--text-muted)" }}>
                    No playable songs found.
                  </div>
                )}
                {searchResults.map((t, i) => (
                  <div
                    className="search-item"
                    key={`${t.id}-${i}`}
                    onClick={() => {
                      playTrack(t, searchResults, i);
                      setSearchActive(false);
                    }}
                  >
                    <div className="media-title">{t.title}</div>
                    <div className="media-subtitle">{t.artist}</div>
                    <div className="search-item-type">Song</div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <nav>
            <a className={activeTab === "home" ? "active" : ""} onClick={() => switchTab("home")}>Home</a>
            <a className={activeTab === "hits" ? "active" : ""} onClick={() => switchTab("hits")}>Top Hits</a>
            <a className={activeTab === "playlists" ? "active" : ""} onClick={() => switchTab("playlists")}>Playlists</a>
          </nav>
        </div>
      </header>

      {/* HOME */}
      {activeTab === "home" && (
        <div className="view-section active">
          <main>
            <svg className="center-glyph" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="2">
              <ellipse cx="50" cy="50" rx="40" ry="15" />
              <ellipse cx="50" cy="50" rx="30" ry="25" />
              <circle cx="50" cy="50" r="8" fill="currentColor" />
            </svg>
            <div className="orbit-container">
              {orbitTracks.map((track, i) => {
                const total = orbitTracks.length || 1;
                const angle = (i / total) * 2 * Math.PI;
                const rx = 300, ry = 170;
                const x = rx * Math.cos(angle);
                const y = ry * Math.sin(angle);
                return (
                  <div
                    key={`${track.id}-${i}`}
                    className="album-card"
                    style={{
                      backgroundImage: `url('${track.cover}')`,
                      transform: `translate(${x}px, ${y}px) rotate(${-angle * (180 / Math.PI) + 90}deg)`,
                    }}
                    onClick={() => playTrack(track, orbitTracks, i)}
                  >
                    <div className="play-overlay">
                      <span>&#9654;</span>
                      <span>{track.duration}</span>
                    </div>
                  </div>
                );
              })}
              {homeLoading && orbitTracks.length === 0 && <div className="empty-text">Loading...</div>}
            </div>
          </main>

          <div className="grid-container">
            <SectionHeader
              title="New & Trending Artists"
              onShuffle={() => shuffleHomeSection(setNewArtists, null, 12)}
            />
            <ArtistGrid artists={newArtists} onSelectArtist={showArtistTopHits} />

            <div style={{ height: 40 }} />
            <SectionHeader
              title="Pop"
              onShuffle={() => shuffleHomeSection(setPopTracks, (t) => GENRE_MATCH.pop.test(t.genre), 20)}
            />
            <TrackGrid tracks={popTracks} onPlay={playTrack} />

            <div style={{ height: 40 }} />
            <SectionHeader
              title="R&B"
              onShuffle={() => shuffleHomeSection(setRnbTracks, (t) => GENRE_MATCH.rnb.test(t.genre), 20)}
            />
            <TrackGrid tracks={rnbTracks} onPlay={playTrack} />

            <div style={{ height: 40 }} />
            <SectionHeader
              title="EDM"
              onShuffle={() => shuffleHomeSection(setEdmTracks, (t) => GENRE_MATCH.edm.test(t.genre), 20)}
            />
            <TrackGrid tracks={edmTracks} onPlay={playTrack} />
          </div>
        </div>
      )}

      {/* TOP HITS */}
      {activeTab === "hits" && (
        <div className="view-section active">
          <div className="grid-container" style={{ paddingTop: 120 }}>
            <SectionHeader title="Billboard Global Top Hits" />
            <TrackGrid tracks={globalHits} onPlay={(t, l, i) => playTrack(t, l, i)} />

            <div style={{ height: 40 }} />
            <SectionHeader title="Billboard USA Top Hits" />
            <TrackGrid tracks={usaHits} onPlay={playTrack} />

            <div style={{ height: 40 }} />
            <SectionHeader title="Billboard Japan Top Hits" />
            <TrackGrid tracks={japanHits} onPlay={playTrack} />

            <div style={{ height: 40 }} />
            <SectionHeader title="Billboard Philippines Top Hits" />
            <TrackGrid tracks={phHits} onPlay={playTrack} />

            <div style={{ height: 40 }} />
            <SectionHeader title="Billboard Latin Top Hits" />
            <TrackGrid tracks={latinHits} onPlay={playTrack} />

            {hitsLoading && <div className="empty-text">Loading charts...</div>}
          </div>
        </div>
      )}

      {/* PLAYLISTS */}
      {activeTab === "playlists" && (
        <div className="view-section active">
          <div className="grid-container">
            <div className="section-title-row">
              <div className="section-title">Your Playlists</div>
              <button className="action-btn" onClick={createNewPlaylist}>+ Create Playlist</button>
            </div>
            {Object.keys(playlists).length === 0 ? (
              <div className="empty-text">No playlists created yet. Click "+ Create Playlist" above!</div>
            ) : (
              <div className="media-grid">
                {Object.keys(playlists).map((name) => (
                  <div className="media-card" key={name} onClick={() => openPlaylist(name)}>
                    <div className="media-title">{name}</div>
                    <div className="media-subtitle">{playlists[name].length} Songs</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL */}
      <div className={`modal-overlay ${modalOpen ? "active" : ""}`}>
        <div className="modal-content">
          <div className="modal-header-nav">
            <button className="back-btn" onClick={() => setModalOpen(false)}>&#129144; Back</button>
          </div>
          <div className="section-title">{modalTitle}</div>
          {modalLoading && <div className="empty-text">Loading...</div>}
          {!modalLoading &&
            modalTracks.map((t, i) => (
              <div className="track-row" key={`${t.id}-${i}`} onClick={() => playTrack(t, modalTracks, i)}>
                <div>
                  <div className="media-title">{i + 1}. {t.title}</div>
                  <div className="media-subtitle">{t.album || t.artist}</div>
                </div>
                <div>{t.duration}</div>
              </div>
            ))}
        </div>
      </div>

      {/* PLAYER BAR */}
      {playerExpanded && currentTrack && (
        <div className="expanded-player">
          <button className="expanded-close" onClick={() => setPlayerExpanded(false)} aria-label="Close player">×</button>
          <img src={currentTrack.cover || PLACEHOLDER_COVER} alt={currentTrack.title} onError={(e) => { e.currentTarget.src = PLACEHOLDER_COVER; }} />
          <div className="expanded-title">{currentTrack.title}</div>
          <div className="expanded-artist">{currentTrack.artist}</div>
          <div className="expanded-progress progress-container">
            <span>{formatSeconds(currentTime)}</span>
            <input type="range" value={progressPct} min="0" max="100" onChange={(e) => seekTrack(e.target.value)} />
            <span>{formatSeconds(duration)}</span>
          </div>
          <div className="expanded-controls">
            <button onClick={prevTrack} title="Previous">❮❮</button>
            <button className="play-btn" onClick={togglePlay}>{loadingTrack ? "…" : isPlaying ? "❚❚" : "▶"}</button>
            <button onClick={nextTrack} title="Next">❯❯</button>
          </div>
          <div className="device-status">● Connected speaker <span>Bluetooth / system audio</span></div>
        </div>
      )}
      <div className="player-bar">
        <div className="player-left">
          <button className="player-cover-button" onClick={openPlayer} aria-label="Open music player">
            <img src={currentTrack?.cover || PLACEHOLDER_COVER} alt="Cover" onError={(e) => { e.currentTarget.src = PLACEHOLDER_COVER; }} />
          </button>
          <div>
            <div className="player-title">{currentTrack?.title || "Select a Track"}</div>
            <div className="player-subtitle">
              <span className="link-span" onClick={() => currentTrack && showArtistTopHits(currentTrack.artist)}>
                {currentTrack?.artist || "BDplay Player"}
              </span>
              &bull;
              <span
                className={currentTrack?.album && currentTrack.album !== "Single" ? "link-span" : ""}
                onClick={() => currentTrack?.album && currentTrack.album !== "Single" && showAlbumTracks(currentTrack.album, currentTrack.artist)}
              >
                {currentTrack?.album || "Album"}
              </span>
            </div>
          </div>
        </div>

        <div className="player-center">
          <div className="player-controls">
            <button onClick={prevTrack} title="Previous">&#10094;&#10094;</button>
            <button className="play-btn" onClick={togglePlay}>
              {loadingTrack ? "…" : isPlaying ? "\u275A\u275A" : "\u25B6"}
            </button>
            <button onClick={nextTrack} title="Next">&#10095;&#10095;</button>
            <button className="add-playlist-btn" onClick={addCurrentToPlaylist} title="Add to Playlist">
              &#43; Playlist
            </button>
          </div>
          <div className="progress-container">
            <span>{formatSeconds(currentTime)}</span>
            <input type="range" value={progressPct} min="0" max="100" onChange={(e) => seekTrack(e.target.value)} />
            <span>{formatSeconds(duration)}</span>
          </div>
          {playbackNote && <div className="playback-note">{playbackNote}</div>}
        </div>

        <div className="player-right" onMouseEnter={() => setVolumeHovered(true)} onMouseLeave={() => setVolumeHovered(false)}>
          <span className="volume-device">●</span>
          <span className="volume-percent">{volume}%</span>
          {volumeHovered && <input
            type="range"
            value={volume}
            min="0"
            max="100"
            onChange={(e) => setVolume(e.target.value)}
            style={{ width: 70 }}
          />}
        </div>
      </div>

      {/* Hidden players */}
      <audio ref={audioRef} preload="metadata" />
      <div id="yt-player-container" className="yt-hidden" />
    </div>
  );
}