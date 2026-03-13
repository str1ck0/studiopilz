import { defineType, defineField } from 'sanity'

export default defineType({
  name: 'homepage',
  title: 'Homepage',
  type: 'document',
  fields: [
    defineField({
      name: 'heroVideo',
      title: 'Hero Video',
      description: 'The background video for the hero section.',
      type: 'file',
      options: {
        accept: 'video/*',
      },
    }),
    defineField({
      name: 'workSectionTitle',
      title: 'Work Section Title',
      description: 'The heading for the Selected Works section on the homepage.',
      type: 'string',
      initialValue: 'Selected Works',
    }),
  ],
})
