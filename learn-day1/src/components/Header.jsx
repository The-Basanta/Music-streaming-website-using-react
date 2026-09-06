// Header component
export default function Header({
  activeTab,
  searchQuery,
  searchResults,
  searchActive,
  onSearch,
  onClearSearch,
  onPlay,
  onSwitchTab,
}) {
  return (
    <header>
      <div className="logo">BDplay</div>
      <div className="nav-center">
        <div className="search-box">
          <span className="search-icon">&#128269;</span>
          <input
            type="text"
            placeholder="Search song or artist..."
            value={searchQuery}
            onChange={(event) => onSearch(event.target.value)}
          />
          <button
            className="clear-search"
            onClick={onClearSearch}
            type="button"
            title="Clear search"
          >
            &times;
          </button>
          {searchActive && (
            <div className="search-results active">
              {searchResults.length === 0 && (
                <div
                  className="search-item"
                  style={{ color: "var(--text-muted)" }}
                >
                  No playable songs found.
                </div>
              )}
              {searchResults.map((track, index) => (
                <div
                  className="search-item"
                  key={`${track.id}-${index}`}
                  onClick={() => {
                    onPlay(track, searchResults, index);
                    onClearSearch();
                  }}
                >
                  <div className="media-title">{track.title}</div>
                  <div className="media-subtitle">{track.artist}</div>
                  <div className="search-item-type">Song</div>
                </div>
              ))}
            </div>
          )}
        </div>
        <nav>
          <a
            className={activeTab === "home" ? "active" : ""}
            onClick={() => onSwitchTab("home")}
          >
            Home
          </a>
          <a
            className={activeTab === "hits" ? "active" : ""}
            onClick={() => onSwitchTab("hits")}
          >
            Top Hits
          </a>
          <a
            className={activeTab === "playlists" ? "active" : ""}
            onClick={() => onSwitchTab("playlists")}
          >
            Playlists
          </a>
        </nav>
      </div>
    </header>
  );
}
