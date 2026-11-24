function EventTagList({ tags = [], activeTag = '', onTagClick }) {
  if (!Array.isArray(tags) || tags.length === 0) {
    return null;
  }

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginTop: '0.4rem' }}>
      {tags.slice(0, 3).map((tag) => {
        const isActive = activeTag && activeTag.toLowerCase() === tag.toLowerCase();
        const clickable = typeof onTagClick === 'function';

        return (
          <button
            key={tag}
            type="button"
            disabled={!clickable}
            onClick={() => clickable && onTagClick(tag)}
            style={{
              padding: '0.18rem 0.55rem',
              borderRadius: '999px',
              fontSize: '0.78rem',
              fontWeight: 500,
              border: isActive ? '1px solid #1d4ed8' : '1px solid #d1d5db',
              backgroundColor: isActive ? '#1d4ed8' : '#f3f4f6',
              color: isActive ? '#ffffff' : '#374151',
              cursor: clickable ? 'pointer' : 'default',
            }}
          >
            #{tag}
          </button>
        );
      })}
    </div>
  );
}

export default EventTagList;