// Track modal component
export default function TrackModal({
  open,
  title,
  loading,
  tracks,
  onClose,
  onPlay,
}) {
  return (
    <div className={`modal-overlay ${open ? "active" : ""}`}>
      <div className="modal-content">
        <div className="modal-header-nav">
          <button className="back-btn" onClick={onClose}>
            &#129144; Back
          </button>
        </div>
        <div className="section-title">{title}</div>
        {loading && <div className="empty-text">Loading...</div>}
        {!loading &&
          tracks.map((track, index) => (
            <div
              className="track-row"
              key={`${track.id}-${index}`}
              onClick={() => onPlay(track, [track], 0)}
            >
              <div>
                <div className="media-title">
                  {index + 1}. {track.title}
                </div>
                <div className="media-subtitle">
                  {track.album || track.artist}
                </div>
              </div>
              <div>{track.duration}</div>
            </div>
          ))}
      </div>
    </div>
  );
}
