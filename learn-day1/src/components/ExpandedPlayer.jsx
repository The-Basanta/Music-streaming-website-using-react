import { PLACEHOLDER_COVER } from "../data/constants";
import { formatSeconds } from "../utils/musicUtils";

// Expanded player component
export default function ExpandedPlayer({
  track,
  currentTime,
  duration,
  progressPct,
  loading,
  isPlaying,
  onClose,
  onSeek,
  onPrevious,
  onToggle,
  onNext,
}) {
  return (
    <div className="expanded-player">
      <button
        className="expanded-close"
        onClick={onClose}
        aria-label="Close player"
      >
        ×
      </button>
      <img
        src={track.cover || PLACEHOLDER_COVER}
        alt={track.title}
        onError={(event) => {
          event.currentTarget.src = PLACEHOLDER_COVER;
        }}
      />
      <div className="expanded-title">{track.title}</div>
      <div className="expanded-artist">{track.artist}</div>
      <div className="expanded-progress progress-container">
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
      <div className="expanded-controls">
        <button onClick={onPrevious} title="Previous">
          ❮❮
        </button>
        <button className="play-btn" onClick={onToggle}>
          {loading ? "…" : isPlaying ? "❚❚" : "▶"}
        </button>
        <button onClick={onNext} title="Next">
          ❯❯
        </button>
      </div>
      <div className="device-status">
        ● Connected speaker <span>Bluetooth / system audio</span>
      </div>
    </div>
  );
}
