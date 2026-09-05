import SectionHeader from "../components/SectionHeader";
import TrackGrid from "../components/TrackGrid";

export default function TopHitsView({ sections, loading, onPlay }) {
  return <div className="view-section active"><div className="grid-container" style={{ paddingTop: 120 }}>{sections.map(([title, tracks]) => <div key={title}><SectionHeader title={title} /><TrackGrid tracks={tracks} onPlay={onPlay} />{title !== "Billboard Latin Top Hits" && <div style={{ height: 40 }} />}</div>)}{loading && <div className="empty-text">Loading charts...</div>}</div></div>;
}
