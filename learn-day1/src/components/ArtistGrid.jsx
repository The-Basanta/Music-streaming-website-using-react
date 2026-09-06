import { PLACEHOLDER_COVER } from "../data/constants";

// Artist grid component
export default function ArtistGrid({ artists, onSelectArtist }) {
  if (!artists.length)
    return <div className="empty-text">Loading artists...</div>;
  return (
    <div className="media-grid artist-grid">
      {artists.map((track, index) => (
        <div
          className="artist-card"
          key={`${track.artist}-${index}`}
          onClick={() => onSelectArtist(track.artist)}
        >
          <img
            className="artist-avatar"
            src={track.cover || PLACEHOLDER_COVER}
            alt={track.artist}
            onError={(event) => {
              event.currentTarget.src = PLACEHOLDER_COVER;
            }}
          />
          <div className="media-title" style={{ textAlign: "center" }}>
            {track.artist}
          </div>
          <div className="media-subtitle" style={{ textAlign: "center" }}>
            {track.views || "Trending now"}
          </div>
        </div>
      ))}
    </div>
  );
}
