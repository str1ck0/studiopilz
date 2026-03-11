'use client'

import { useEffect, useState, useCallback } from 'react'
import { useClient, ArrayOfPrimitivesInputProps, PatchEvent, insert } from 'sanity'

export function TagsInput(props: ArrayOfPrimitivesInputProps) {
  const { value = [], onChange, renderDefault } = props
  const client = useClient({ apiVersion: '2024-01-01' })
  const [allTags, setAllTags] = useState<string[]>([])

  useEffect(() => {
    client
      .fetch<string[]>(`array::unique(*[_type == "project"].tags[])`)
      .then((tags) => setAllTags(tags.filter(Boolean).sort()))
      .catch(() => {})
  }, [client])

  const addTag = useCallback(
    (tag: string) => {
      if ((value as string[]).includes(tag)) return
      onChange(PatchEvent.from(insert([tag], 'after', [-1])))
    },
    [value, onChange],
  )

  const unusedTags = allTags.filter((tag) => !(value as string[]).includes(tag))

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {renderDefault(props)}
      {unusedTags.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 4 }}>
          <span style={{ fontSize: 11, opacity: 0.5, marginRight: 4, fontFamily: 'monospace', textTransform: 'uppercase' }}>
            Used tags:
          </span>
          {unusedTags.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => addTag(tag)}
              style={{
                padding: '2px 10px',
                border: '1px solid currentColor',
                borderRadius: 999,
                background: 'transparent',
                cursor: 'pointer',
                fontSize: 12,
                opacity: 0.6,
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
