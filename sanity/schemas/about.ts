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
      name: 'artistStatement',
      title: 'Artist Statement',
      type: 'array',
      of: [{ type: 'block' }],
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
      name: 'contactEmail',
      title: 'Contact Email',
      type: 'string',
    }),
    defineField({
      name: 'socialLinks',
      title: 'Social Links',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            { name: 'platform', type: 'string', title: 'Platform (e.g. Instagram)' },
            { name: 'url', type: 'url', title: 'URL' },
          ],
        },
      ],
    }),
  ],
})
