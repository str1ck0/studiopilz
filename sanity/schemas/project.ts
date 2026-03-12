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
              name: 'previewPosition',
              type: 'string',
              title: 'Preview crop position',
              description: 'Which part of the video frame to show in the gallery tile.',
              options: {
                list: [
                  { title: 'Center (default)', value: 'center' },
                  { title: 'Top', value: 'top' },
                  { title: 'Bottom', value: 'bottom' },
                  { title: 'Left', value: 'left' },
                  { title: 'Right', value: 'right' },
                  { title: 'Top left', value: 'top left' },
                  { title: 'Top right', value: 'top right' },
                  { title: 'Bottom left', value: 'bottom left' },
                  { title: 'Bottom right', value: 'bottom right' },
                ],
                layout: 'radio',
              },
              initialValue: 'center',
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
    defineField({
      name: 'order',
      title: 'Display Order',
      type: 'number',
      description: 'Lower numbers appear first. Leave empty to fall back to year.',
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
