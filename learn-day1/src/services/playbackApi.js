import { SPOTIFY_ACCESS_TOKEN, SPOTIFY_CLIENT_ID } from "../data/constants";

export function loadSpotifySdk(onReady) {
  if (!SPOTIFY_ACCESS_TOKEN || !SPOTIFY_CLIENT_ID) return;
  const existing = document.querySelector('script[src="https://sdk.scdn.co/spotify-player.js"]');
  if (!existing) {
    const script = document.createElement("script");
    script.src = "https://sdk.scdn.co/spotify-player.js";
    script.async = true;
    document.body.appendChild(script);
  }
  window.onSpotifyWebPlaybackSDKReady = onReady;
}

export async function playSpotifyTrack(player, track) {
  const response = await fetch(`https://api.spotify.com/v1/me/player/play?device_id=${player.deviceId}`, { method: "PUT", headers: { Authorization: `Bearer ${SPOTIFY_ACCESS_TOKEN}`, "Content-Type": "application/json" }, body: JSON.stringify({ uris: [track.uri] }) });
  return response.ok;
}
