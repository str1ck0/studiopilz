import { useEffect, useState, useCallback, KeyboardEvent } from 'react'
import { useClient, ArrayOfPrimitivesInputProps, PatchEvent, insert, unset } from 'sanity'

export function TagsInput(props: ArrayOfPrimitivesInputProps) {
  const { value = [], onChange, readOnly } = props
  const client = useClient({ apiVersion: '2024-01-01' })
  const [allTags, setAllTags] = useState<string[]>([])
  const [inputValue, setInputValue] = useState('')

  useEffect(() => {
    client
      .fetch<string[]>(`array::unique(*[_type == "project"].tags[])`)
      .then((tags) => setAllTags(tags.filter(Boolean).sort()))
      .catch(() => {})
  }, [client])

  const addTag = useCallback(
    (tag: string) => {
      const trimmed = tag.trim()
      if (!trimmed || (value as string[]).includes(trimmed)) return
      onChange(PatchEvent.from(insert([trimmed], 'after', [-1])))
      setInputValue('')
    },
    [value, onChange],
  )

  const removeTag = useCallback(
    (tag: string) => {
      const index = (value as string[]).indexOf(tag)
      if (index >= 0) {
        onChange(PatchEvent.from(unset([index])))
      }
    },
    [value, onChange],
  )

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      addTag(inputValue)
    }
  }

  const suggestions = allTags.filter(
    (tag) =>
      tag.toLowerCase().includes(inputValue.toLowerCase()) &&
      !(value as string[]).includes(tag),
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {/* Current tags */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        {(value as string[]).map((tag) => (
          <span
            key={tag}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              padding: '3px 10px',
              background: 'var(--card-badge-default-bg, #e5e7eb)',
              borderRadius: 999,
              fontSize: 13,
            }}
          >
            {tag}
            {!readOnly && (
              <button
                type="button"
                onClick={() => removeTag(tag)}
                style={{
                  border: 'none',
                  background: 'none',
                  cursor: 'pointer',
                  padding: '0 2px',
                  fontSize: 15,
                  lineHeight: 1,
                  opacity: 0.6,
                }}
                aria-label={`Remove tag ${tag}`}
              >
                ×
              </button>
            )}
          </span>
        ))}
      </div>

      {/* Input with datalist suggestions */}
      {!readOnly && (
        <div style={{ position: 'relative' }}>
          <input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={() => {
              if (inputValue.trim()) addTag(inputValue)
            }}
            placeholder="Add tag… (Enter or comma to confirm)"
            list="tags-datalist"
            style={{
              width: '100%',
              padding: '6px 10px',
              border: '1px solid var(--card-border-color, #d1d5db)',
              borderRadius: 4,
              fontSize: 13,
              background: 'var(--card-bg, #fff)',
              color: 'var(--card-fg, #111)',
            }}
          />
          <datalist id="tags-datalist">
            {suggestions.map((tag) => (
              <option key={tag} value={tag} />
            ))}
          </datalist>
        </div>
      )}

      {/* Clickable existing tags as quick-add chips */}
      {!readOnly && allTags.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 4 }}>
          <span style={{ fontSize: 11, opacity: 0.5, alignSelf: 'center', marginRight: 4 }}>
            USED TAGS:
          </span>
          {allTags
            .filter((tag) => !(value as string[]).includes(tag))
            .map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => addTag(tag)}
                style={{
                  padding: '2px 8px',
                  border: '1px solid var(--card-border-color, #d1d5db)',
                  borderRadius: 999,
                  background: 'transparent',
                  cursor: 'pointer',
                  fontSize: 12,
                  opacity: 0.7,
                }}
              >
                + {tag}
              </button>
            ))}
        </div>
      )}
    </div>
  )
}
