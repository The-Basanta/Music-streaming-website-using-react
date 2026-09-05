export default function PlaylistsView({ playlists, onCreate, onOpen }) {
  const names = Object.keys(playlists);
  return <div className="view-section active"><div className="grid-container"><div className="section-title-row"><div className="section-title">Your Playlists</div><button className="action-btn" onClick={onCreate}>+ Create Playlist</button></div>{names.length === 0 ? <div className="empty-text">No playlists created yet. Click "+ Create Playlist" above!</div> : <div className="media-grid">{names.map((name) => <div className="media-card" key={name} onClick={() => onOpen(name)}><div className="media-title">{name}</div><div className="media-subtitle">{playlists[name].length} Songs</div></div>)}</div>}</div></div>;
}
