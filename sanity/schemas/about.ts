import { defineType, defineField } from 'sanity'

export default defineType({
  name: 'about',
  title: 'About Page',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      initialValue: 'About Studio Pilz',
    }),
    defineField({
      name: 'philosophy',
      title: 'Our Philosophy',
      type: 'array',
      of: [{ type: 'block' }],
    }),
    defineField({
      name: 'philosophyImage',
      title: 'Philosophy Image (optional)',
      type: 'image',
      options: { hotspot: true },
    }),
    defineField({
      name: 'artistStatement',
      title: 'Artist Statement',
      type: 'array',
      of: [{ type: 'block' }],
    }),
    defineField({
      name: 'artistStatementImage',
      title: 'Artist Statement Image (optional)',
      type: 'image',
      options: { hotspot: true },
    }),
    defineField({
      name: 'exhibitions',
      title: 'Events & Exhibitions',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            { name: 'name', type: 'string', title: 'Event Name' },
            { name: 'year', type: 'string', title: 'Year' },
            { name: 'location', type: 'string', title: 'Location' },
          ],
        },
      ],
    }),
    defineField({
      name: 'team',
      title: 'Team Members',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            { name: 'name', type: 'string', title: 'Name' },
            { name: 'role', type: 'string', title: 'Role' },
            { 
              name: 'image', 
              type: 'image', 
              title: 'Photo',
              options: { hotspot: true }
            },
            { name: 'bio', type: 'array', title: 'Bio', of: [{ type: 'block' }] },
            {
              name: 'cvEntries',
              title: 'CV Entries',
              type: 'array',
              of: [
                {
                  type: 'object',
                  fields: [
                    { name: 'year', type: 'string', title: 'Year (e.g. 2023 or 2019–2022)' },
                    { name: 'description', type: 'string', title: 'Description' },
                  ],
                  preview: {
                    select: { title: 'year', subtitle: 'description' },
                  },
                },
              ],
            },
          ],
        },
      ],
    }),
    defineField({
      name: 'skills',
      title: 'Skills / Technical Capabilities',
      type: 'array',
      of: [{ type: 'string' }],
    }),
    defineField({
      name: 'teamPhotos',
      title: 'Team Photos',
      description: 'Group photos of the team — shown as a photo strip on the About page.',
      type: 'array',
      of: [
        {
          type: 'image',
          options: { hotspot: true },
          fields: [
            { name: 'alt', type: 'string', title: 'Alternative text' },
            { name: 'caption', type: 'string', title: 'Caption' },
          ],
        },
      ],
    }),
    defineField({
      name: 'contactEmail',
      title: 'Contact Email',
      description: 'Deprecated — use Site Settings instead.',
      type: 'string',
    }),
  ],
})
