import { defineType, defineField } from 'sanity'

export default defineType({
  name: 'guestbookEntry',
  title: 'Guestbook Entry',
  type: 'document',
  fields: [
    defineField({
      name: 'authorName',
      title: 'Author Name',
      type: 'string',
    }),
    defineField({
      name: 'message',
      title: 'Message',
      type: 'text',
      rows: 4,
    }),
    defineField({
      name: 'drawingData',
      title: 'Drawing Data URL',
      type: 'text', // Using text to store potentially long base64 strings
      description: 'Base64 encoded string of the canvas drawing',
    }),
    defineField({
      name: 'paperColor',
      title: 'Paper Color',
      type: 'string',
      description: 'The background color chosen for the note',
      initialValue: '#ffffff',
    }),
    defineField({
      name: 'createdAt',
      title: 'Created At',
      type: 'datetime',
      initialValue: () => new Date().toISOString(),
    }),
  ],
  preview: {
    select: {
      title: 'authorName',
      subtitle: 'message',
    },
    prepare({ title, subtitle }) {
      return {
        title: title || 'Anonymous Note',
        subtitle: subtitle || 'No message provided',
      }
    },
  },
})
