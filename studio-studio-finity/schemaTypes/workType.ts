import {defineArrayMember, defineField, defineType} from 'sanity'

export const workType = defineType({
  name: 'work',
  title: 'Work',
  type: 'document',
  groups: [
    {name: 'overview', title: 'Overview', default: true},
    {name: 'media', title: 'Media'},
    {name: 'seo', title: 'SEO'},
  ],
  fields: [
    defineField({
      name: 'title',
      type: 'string',
      group: 'overview',
      description: 'Project name shown on the site.',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'slug',
      type: 'slug',
      group: 'overview',
      options: {source: 'title'},
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'orderRank',
      title: 'Order rank',
      type: 'number',
      group: 'overview',
      description: 'Controls the order on the work index and related work.',
      validation: (rule) => rule.required().integer().min(0),
    }),
    defineField({
      name: 'category',
      title: 'Category',
      type: 'string',
      group: 'overview',
      description: 'Short label like "Web Creative Brand".',
    }),
    defineField({
      name: 'mainColor',
      title: 'Main color',
      type: 'color',
      group: 'overview',
      description: 'Optional accent color for the project.',
      options: {
        disableAlpha: true,
        colorList: ['#111111', '#2D4D8B', '#3E8C73', '#D97941', '#C54E59', '#E7DED2'],
      },
    }),
    defineField({
      name: 'introduction',
      type: 'text',
      group: 'overview',
      rows: 8,
      description: 'Main paragraph shown on the case-study page.',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'heroImage',
      title: 'Hero image',
      type: 'image',
      group: 'media',
      options: {hotspot: true},
      validation: (rule) => rule.required(),
      fields: [
        defineField({
          name: 'alt',
          title: 'Alt text',
          type: 'string',
        }),
      ],
    }),
    defineField({
      name: 'galleryMedia',
      title: 'Gallery media',
      type: 'array',
      group: 'media',
      validation: (rule) => rule.required().min(1),
      of: [
        defineArrayMember({
          type: 'image',
          options: {hotspot: true},
          fields: [
            defineField({
              name: 'alt',
              title: 'Alt text',
              type: 'string',
            }),
          ],
        }),
        defineArrayMember({
          type: 'file',
          title: 'Video',
          options: {accept: 'video/*'},
          fields: [
            defineField({
              name: 'title',
              title: 'Title',
              type: 'string',
            }),
          ],
        }),
      ],
    }),
    defineField({
      name: 'media',
      title: 'Video assets',
      type: 'object',
      group: 'media',
      options: {collapsible: true, collapsed: false},
      fields: [
        defineField({
          name: 'shortVideo',
          title: 'Short video',
          type: 'file',
          options: {accept: 'video/*'},
        }),
        defineField({
          name: 'mainLongerVideo',
          title: 'Main longer video',
          type: 'file',
          options: {accept: 'video/*'},
        }),
      ],
    }),
    defineField({
      name: 'seo',
      title: 'SEO',
      type: 'object',
      group: 'seo',
      options: {collapsible: true, collapsed: false},
      fields: [
        defineField({
          name: 'description',
          title: 'SEO description',
          type: 'text',
          rows: 3,
          description: 'Used for metadata and work listings.',
        }),
        defineField({
          name: 'image',
          title: 'SEO image',
          type: 'image',
          options: {hotspot: true},
          fields: [
            defineField({
              name: 'alt',
              title: 'Alt text',
              type: 'string',
            }),
          ],
        }),
      ],
    }),
  ],
  preview: {
    select: {
      media: 'heroImage',
      subtitle: 'category',
      title: 'title',
    },
  },
})
