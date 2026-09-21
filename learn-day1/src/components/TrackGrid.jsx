import { PLACEHOLDER_COVER } from "../data/constants";

// Track grid component
export default function TrackGrid({ tracks, onPlay }) {
  if (!tracks.length) return <div className="empty-text">Loading songs...</div>;
  return (
    <div className="media-grid">

        >
          <div className="image-wrapper">
            <img
              src={track.cover || PLACEHOLDER_COVER}
              alt={track.title}
              onError={(event) => {
                event.currentTarget.src = PLACEHOLDER_COVER;
              }}
            />
            <div className="play-overlay">
              <span>&#9654;</span>
              <span>{track.duration}</span>
            </div>
          </div>
          <div className="media-title">{track.title}</div>
          <div className="media-subtitle">{track.artist}</div>
        </div>
      ))}
    </div>
  );
}
