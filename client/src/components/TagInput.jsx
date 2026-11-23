import { useState } from 'react';
import './TagInput.css';

const MAX_TAGS = 3;
const MAX_TAG_LENGTH = 30;

function TagInput({ tags = [], onChange, disabled = false }) {
  const [inputValue, setInputValue] = useState('');
  const [localError, setLocalError] = useState('');

  const addTag = (rawValue) => {
    const cleaned = rawValue.trim().toLowerCase();
    setLocalError('');

    if (!cleaned) return;

    if (tags.length >= MAX_TAGS) {
      setLocalError(`You can attach up to ${MAX_TAGS} tags per event.`);
      return;
    }

    if (cleaned.length > MAX_TAG_LENGTH) {
      setLocalError(`Each tag must be ${MAX_TAG_LENGTH} characters or fewer.`);
      return;
    }

    if (tags.includes(cleaned)) {
      setLocalError(`"${cleaned}" is already added.`);
      setInputValue('');
      return;
    }

    onChange([...tags, cleaned]);
    setInputValue('');
  };

  const removeTag = (tagToRemove) => {
    setLocalError('');
    onChange(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag(inputValue);
    } else if (e.key === 'Backspace' && !inputValue && tags.length > 0) {
      removeTag(tags[tags.length - 1]);
    }
  };

  return (
    <div className="tag-input-wrapper">
      <div className="tag-input-header">
        <label className="tag-input-label">Event Tags (Optional)</label>
        <span className="tag-input-counter">
          {tags.length}/{MAX_TAGS} tags
        </span>
      </div>

      <div className="tag-input-box">
        {tags.map((tag) => (
          <span key={tag} className="tag-chip">
            #{tag}
            {!disabled && (
              <button
                type="button"
                className="tag-chip-remove"
                aria-label={`Remove ${tag}`}
                onClick={() => removeTag(tag)}
              >
                ×
              </button>
            )}
          </span>
        ))}

        {tags.length < MAX_TAGS && (
          <>
            <input
              type="text"
              className="tag-text-field"
              value={inputValue}
              disabled={disabled}
              placeholder={tags.length === 0 ? 'Type a tag and press Enter (e.g. ai, music)' : 'Add another tag...'}
              onChange={(e) => {
                setInputValue(e.target.value);
                if (localError) setLocalError('');
              }}
              onKeyDown={handleKeyDown}
            />
            <button
              type="button"
              className="tag-add-btn"
              disabled={disabled || !inputValue.trim()}
              onClick={() => addTag(inputValue)}
            >
              Add
            </button>
          </>
        )}
      </div>

      {localError && <p className="tag-input-error">{localError}</p>}
    </div>
  );
}

export default TagInput;