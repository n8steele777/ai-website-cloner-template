import {defineField, defineType} from 'sanity'
import {ImageIcon} from '@sanity/icons'

export const galleryItemType = defineType({
  name: 'galleryItem',
  title: 'Gallery item',
  type: 'object',
  icon: ImageIcon,
  fields: [
    defineField({
      name: 'image',
      title: 'Image',
      type: 'image',
      options: {hotspot: true},
      description: 'Use images uploaded to Sanity for CDN resizing (WebP/AVIF).',
      fields: [
        defineField({
          name: 'alt',
          title: 'Alt text',
          type: 'string',
        }),
      ],
    }),
    defineField({
      name: 'video',
      title: 'Video',
      type: 'file',
      options: {accept: 'video/*'},
      description: 'Use a video file instead of an image when you need motion (pick one: image or video).',
      fields: [
        defineField({
          name: 'title',
          title: 'Title / aria label',
          type: 'string',
        }),
      ],
    }),
    defineField({
      name: 'caption',
      title: 'Caption',
      type: 'text',
      rows: 2,
      description: 'Optional line shown below the media on the case study page.',
    }),
    defineField({
      name: 'layout',
      title: 'Width on desktop',
      type: 'string',
      initialValue: 'inherit',
      options: {
        list: [
          {title: 'Follow grid (first item full width; legacy pairing)', value: 'inherit'},
          {title: 'Full width (spans both columns)', value: 'full'},
          {title: 'Half width (one column)', value: 'half'},
        ],
        layout: 'radio',
      },
    }),
  ],
  validation: (rule) =>
    rule.custom((doc) => {
      const imageAsset = doc?.image?.asset
      const videoAsset = doc?.video?.asset
      if (imageAsset && videoAsset) {
        return 'Use either an image or a video, not both.'
      }
      if (!imageAsset && !videoAsset) {
        return 'Add an image or a video.'
      }
      return true
    }),
  preview: {
    select: {
      caption: 'caption',
      layout: 'layout',
      media: 'image',
      videoTitle: 'video.title',
    },
    prepare({caption, layout, media, videoTitle}) {
      const layoutLabel =
        layout === 'full' ? 'Full' : layout === 'half' ? 'Half' : 'Grid'
      const kind = media ? 'Image' : 'Video'
      const sub = [layoutLabel, caption || videoTitle].filter(Boolean).join(' · ')
      return {
        title: `${kind}${sub ? ` — ${sub}` : ''}`,
        media,
      }
    },
  },
})
