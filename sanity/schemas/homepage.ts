import { defineType, defineField } from 'sanity'

export default defineType({
  name: 'homepage',
  title: 'Homepage',
  type: 'document',
  fields: [
    defineField({
      name: 'heroSubtitle',
      title: 'Hero Subtitle',
      description: 'The small mono text above the main title.',
      type: 'string',
      initialValue: 'interactive installations, creative computing, digital art and design',
    }),
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
      name: 'heroTitle',
      title: 'Hero Title',
      description: 'The large main title. Use <span className="italic font-light opacity-80"> for italic words.',
      type: 'text',
      rows: 2,
      initialValue: 'We build\n<span className="italic font-light opacity-80">digital</span> spaces.',
    }),
    defineField({
      name: 'heroDescription',
      title: 'Hero Description',
      description: 'The paragraph of text below the main title.',
      type: 'text',
      rows: 4,
      initialValue: 'Studio Pilz is a contemporary full-service creative agency operating in the spaces between technology, art, design, and physical installations. We are a mycelial network of artists, musicians, scientists, and explorers.',
    }),
    defineField({
      name: 'workSectionTitle',
      title: 'Work Section Title',
      description: 'The heading for the Selected Works section on the homepage.',
      type: 'string',
      initialValue: 'Selected Works',
    }),
    defineField({
      name: 'workSectionSubtitle',
      title: 'Work Section Subtitle',
      description: 'The small mono text on the right of the Work section header.',
      type: 'string',
      initialValue: '2021—Present',
    }),
  ],
})
