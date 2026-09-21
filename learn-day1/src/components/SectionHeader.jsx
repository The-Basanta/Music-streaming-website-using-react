// Section header component
export default function SectionHeader({ title, onShuffle }) {
  return (
    <div className="section-title-row">
      <div className="section-title">{title}</div>
      {onShuffle && (
        <button className="action-btn" onClick={onShuffle}>
          &#128256; Shuffle
        </button>
      )}
    </div>
  );
}
