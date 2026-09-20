import { PLACEHOLDER_COVER } from "../data/constants";
import { formatSeconds } from "../utils/musicUtils";

// Player bar component
export default function PlayerBar({
  track,
  currentTime,
  duration,
  progressPct,
  volume,
  volumeHovered,
  playbackNote,
  loading,
  isPlaying,
  onOpen,
  onArtist,
  onAlbum,
  onPrevious,
  onToggle,
  onNext,
  onAddPlaylist,
  onSeek,
  onVolumeEnter,
  onVolumeLeave,
  onVolume,
}) {
  return (
    <div className="player-bar">
      <div className="player-left">
        <button
          className="player-cover-button"
          onClick={onOpen}
          aria-label="Open music player"
        >
          <img
            src={track?.cover || PLACEHOLDER_COVER}
            alt="Cover"
            onError={(event) => {
              event.currentTarget.src = PLACEHOLDER_COVER;
            }}
          />
        </button>
        <div>
          <div className="player-title">{track?.title || "Select a Track"}</div>
          <div className="player-subtitle">
            <span
              className="link-span"
              onClick={() => track && onArtist(track.artist)}
            >
              {track?.artist || "BDplay Player"}
            </span>{" "}
            &bull;{" "}
            <span
              className={
                track?.album && track.album !== "Single" ? "link-span" : ""
              }
              onClick={() =>
                track?.album &&
                track.album !== "Single" &&
                onAlbum(track.album, track.artist)
              }
            >
              {track?.album || "Album"}
            </span>
          </div>
        </div>
      </div>

      <div className="player-center">
        <div className="player-controls">
          <button onClick={onPrevious} title="Previous">
            &#10094;&#10094;
          </button>
          <button className="play-btn" onClick={onToggle}>
            {loading ? "…" : isPlaying ? "\u275A\u275A" : "\u25B6"}
          </button>
          <button onClick={onNext} title="Next">
            &#10095;&#10095;
          </button>
          <button
            className="add-playlist-btn"
            onClick={onAddPlaylist}
            title="Add to Playlist"
          >
            &#43; Playlist
          </button>
        </div>

        <div className="progress-container">
          <span>{formatSeconds(currentTime)}</span>
          <input
            type="range"
            value={progressPct}
            min="0"
            max="100"
            onChange={(event) => onSeek(event.target.value)}
          />
          <span>{formatSeconds(duration)}</span>
        </div>

        {playbackNote && <div className="playback-note">{playbackNote}</div>}
      </div>

      <div
        className="player-right"
        onMouseEnter={onVolumeEnter}
        onMouseLeave={onVolumeLeave}
      >
        <span className="volume-device">●</span>
        <span className="volume-percent">{volume}%</span>
        {volumeHovered && (
          <input
            type="range"
            value={volume}
            min="0"
            max="100"
            onChange={(event) => onVolume(event.target.value)}
            style={{ width: 70 }}
          />
        )}
      </div>
    </div>
  );
}
