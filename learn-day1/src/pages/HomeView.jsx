import ArtistGrid from "../components/ArtistGrid";
import SectionHeader from "../components/SectionHeader";
import TrackGrid from "../components/TrackGrid";
import { GENRE_MATCH } from "../data/constants";

// Home view component
export default function HomeView({
  orbitTracks,
  homeLoading,
  newArtists,
  popTracks,
  rnbTracks,
  edmTracks,
  recommendationTracks,
  onPlay,
  onArtist,
  onShuffleArtists,
  onShuffleGenre,
}) {
  const sections = [
    ["Pop", popTracks, GENRE_MATCH.pop],
    ["R&B", rnbTracks, GENRE_MATCH.rnb],
    ["EDM", edmTracks, GENRE_MATCH.edm],
  ];
  return (
    <div className="view-section active">
      <main>
        <svg
          className="center-glyph"
          viewBox="0 0 100 100"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <ellipse cx="50" cy="50" rx="40" ry="15" />
          <ellipse cx="50" cy="50" rx="30" ry="25" />
          <circle cx="50" cy="50" r="8" fill="currentColor" />
        </svg>
        <div className="orbit-container">
          {orbitTracks.map((track, index) => {
            const total = orbitTracks.length || 1;
            const angle = (index / total) * 2 * Math.PI;
            const x = 300 * Math.cos(angle);
            const y = 170 * Math.sin(angle);
            return (
              <div
                key={`${track.id}-${index}`}
                className="album-card"
                style={{
                  backgroundImage: `url('${track.cover}')`,
                  transform: `translate(${x}px, ${y}px) rotate(${-angle * (180 / Math.PI) + 90}deg)`,
                }}
                onClick={() => onPlay(track, [track], 0)}
              >
                <div className="play-overlay">
                  <span>&#9654;</span>
                  <span>{track.duration}</span>
                </div>
              </div>
            );
          })}
          {homeLoading && orbitTracks.length === 0 && (
            <div className="empty-text">Loading...</div>
          )}
        </div>
      </main>
      <div className="grid-container">
        <SectionHeader
          title="New & Trending Artists"
          onShuffle={onShuffleArtists}
        />
        <ArtistGrid artists={newArtists} onSelectArtist={onArtist} />
        <div style={{ height: 40 }} />
        <SectionHeader title="Made For You" />
        <TrackGrid tracks={recommendationTracks} onPlay={onPlay} />
        {sections.map(([title, tracks, matcher]) => (
          <div key={title}>
            <div style={{ height: 40 }} />
            <SectionHeader
              title={title}
              onShuffle={() =>
                onShuffleGenre(matcher, title === "EDM" ? 20 : 20)
              }
            />
            <TrackGrid tracks={tracks} onPlay={onPlay} />
          </div>
        ))}
      </div>
    </div>
  );
}
