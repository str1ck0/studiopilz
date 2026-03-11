import { defineType, defineField } from 'sanity'
import { TagsInput } from '../components/TagsInput'

export default defineType({
  name: 'project',
  title: 'Project',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 96,
      },
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'category',
      title: 'Category',
      type: 'string',
      description: 'The primary category of the project (e.g. Festival Installation, Creative Technology, etc)',
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      rows: 4,
    }),
    defineField({
      name: 'longDescription',
      title: 'Long Description',
      type: 'array',
      of: [{ type: 'block' }],
    }),
    defineField({
      name: 'mainImage',
      title: 'Main Image',
      type: 'image',
      options: {
        hotspot: true,
      },
      fields: [
        {
          name: 'alt',
          type: 'string',
          title: 'Alternative text',
        },
      ],
    }),
    defineField({
      name: 'gallery',
      title: 'Gallery',
      type: 'array',
      of: [
        {
          type: 'image',
          options: { hotspot: true },
          preview: {
            select: { title: 'alt', subtitle: 'caption', media: 'asset' },
            prepare({ title, subtitle, media }: { title?: string; subtitle?: string; media?: any }) {
              return { title: title || 'Image', subtitle, media }
            },
          },
          fields: [
            { name: 'alt', type: 'string', title: 'Alternative text' },
            { name: 'caption', type: 'string', title: 'Caption' },
          ],
        },
        {
          type: 'file',
          name: 'video',
          title: 'Video',
          options: { accept: 'video/*' },
          preview: {
            select: { title: 'caption' },
            prepare({ title }: { title?: string }) {
              return { title: title || 'Video' }
            },
          },
          fields: [
            { name: 'caption', type: 'string', title: 'Caption' },
            {
              name: 'poster',
              type: 'image',
              title: 'Preview thumbnail',
              description: 'Custom thumbnail shown before the video plays. Use hotspot to choose the crop center.',
              options: { hotspot: true },
            },
          ],
        },
      ],
    }),
    defineField({
      name: 'year',
      title: 'Year',
      type: 'number',
      validation: Rule => Rule.required().min(2000).max(new Date().getFullYear()),
    }),
    defineField({
      name: 'tags',
      title: 'Tags',
      type: 'array',
      of: [{ type: 'string' }],
      components: {
        input: TagsInput,
      },
    }),
    defineField({
      name: 'link',
      title: 'Project Link',
      type: 'url',
    }),
    defineField({
      name: 'featured',
      title: 'Featured Project',
      type: 'boolean',
      initialValue: false,
    }),
  ],
  preview: {
    select: {
      title: 'title',
      media: 'mainImage',
      subtitle: 'category',
    },
  },
})
