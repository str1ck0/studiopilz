'use client'

import { useCallback, useRef, useState } from 'react'
import { useClient, ArrayOfObjectsInputProps, PatchEvent, insert } from 'sanity'

export function GalleryInput(props: ArrayOfObjectsInputProps) {
  const { renderDefault, onChange } = props
  const client = useClient({ apiVersion: '2024-01-01' })
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)

  const uploadFiles = useCallback(
    async (files: File[]) => {
      const imageFiles = files.filter((f) => f.type.startsWith('image/'))
      if (!imageFiles.length) return

      setUploading(true)
      try {
        const newItems = await Promise.all(
          imageFiles.map(async (file) => {
            const asset = await client.assets.upload('image', file, {
              filename: file.name,
            })
            return {
              _type: 'image',
              _key: Math.random().toString(36).slice(2, 10),
              asset: { _type: 'reference', _ref: asset._id },
              alt: '',
            }
          }),
        )
        onChange(PatchEvent.from(insert(newItems, 'after', [-1])))
      } catch (err) {
        console.error('Upload failed', err)
      } finally {
        setUploading(false)
      }
    },
    [client, onChange],
  )

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length) uploadFiles(files)
    e.target.value = ''
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    uploadFiles(Array.from(e.dataTransfer.files))
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {/* Multi-upload zone */}
      <div
        onDrop={handleDrop}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onClick={() => !uploading && inputRef.current?.click()}
        style={{
          border: `2px dashed currentColor`,
          borderRadius: 6,
          padding: '16px 20px',
          textAlign: 'center',
          cursor: uploading ? 'wait' : 'pointer',
          opacity: dragOver ? 1 : 0.5,
          fontSize: 12,
          fontFamily: 'monospace',
          transition: 'opacity 0.15s',
          userSelect: 'none',
        }}
      >
        {uploading
          ? 'Uploading…'
          : '↑ Drop multiple images here or click to select — each becomes a separate gallery item'}
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />
      </div>

      {/* Default array input for managing existing items */}
      {renderDefault(props)}
    </div>
  )
}
