import fs from 'node:fs'
import path from 'node:path'
import {getCliClient} from 'sanity/cli'
import tinycolor from 'tinycolor2'

function parseCsv(input) {
  const rows = []
  let row = []
  let field = ''
  let index = 0
  let inQuotes = false

  while (index < input.length) {
    const character = input[index]

    if (inQuotes) {
      if (character === '"') {
        if (input[index + 1] === '"') {
          field += '"'
          index += 2
          continue
        }

        inQuotes = false
        index += 1
        continue
      }

      field += character
      index += 1
      continue
    }

    if (character === '"') {
      inQuotes = true
      index += 1
      continue
    }

    if (character === ',') {
      row.push(field)
      field = ''
      index += 1
      continue
    }

    if (character === '\n') {
      row.push(field)
      field = ''

      if (row.some((value) => value !== '')) {
        rows.push(row)
      }

      row = []
      index += 1
      continue
    }

    if (character === '\r') {
      index += 1
      continue
    }

    field += character
    index += 1
  }

  if (field.length > 0 || row.length > 0) {
    row.push(field)
    if (row.some((value) => value !== '')) {
      rows.push(row)
    }
  }

  return rows
}

function decodeHtmlEntities(input) {
  return input
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&ldquo;|&rdquo;/g, '"')
    .replace(/&lsquo;|&rsquo;/g, "'")
}

function htmlToText(html) {
  const withLineBreaks = html
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, '')

  return decodeHtmlEntities(withLineBreaks)
    .split(/\n+/)
    .map((line) => line.replace(/\s+/g, ' ').trim())
    .filter(Boolean)
    .join('\n\n')
}

function excerpt(text, length = 190) {
  if (text.length <= length) {
    return text
  }

  return `${text.slice(0, length).trim()}...`
}

function buildColorValue(value) {
  const color = tinycolor(value)

  if (!color.isValid()) {
    return undefined
  }

  const hex = color.toHexString().toUpperCase()
  const rgb = color.toRgb()
  const hsl = color.toHsl()
  const hsv = color.toHsv()

  return {
    _type: 'color',
    hex,
    rgb: {
      _type: 'rgbaColor',
      r: rgb.r,
      g: rgb.g,
      b: rgb.b,
      a: rgb.a,
    },
    hsl: {
      _type: 'hslaColor',
      h: hsl.h,
      s: hsl.s,
      l: hsl.l,
      a: hsl.a,
    },
    hsv: {
      _type: 'hsvaColor',
      h: hsv.h,
      s: hsv.s,
      v: hsv.v,
      a: hsv.a,
    },
  }
}

function getExtension(url, fallback) {
  try {
    const pathname = new URL(url).pathname
    const ext = path.extname(pathname).replace('.', '').toLowerCase()
    return ext || fallback
  } catch {
    return fallback
  }
}

function sanitizeFilenamePart(value) {
  return value.replace(/[^a-z0-9-_]+/gi, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')
}

function isExpectedAssetContentType(kind, contentType, url) {
  const normalized = (contentType || '').toLowerCase()
  const extension = getExtension(url, '')

  if (kind === 'image') {
    return (
      normalized.startsWith('image/') ||
      ['jpg', 'jpeg', 'png', 'webp', 'gif', 'avif'].includes(extension)
    )
  }

  return (
    normalized.startsWith('video/') ||
    normalized === 'application/octet-stream' ||
    ['mp4', 'mov', 'webm', 'm4v'].includes(extension)
  )
}

const client = getCliClient({
  apiVersion: '2025-04-01',
})

const assetCache = new Map()

async function uploadAssetFromUrl({kind, label, slug, url}) {
  if (!url) {
    return undefined
  }

  const cacheKey = `${kind}:${url}`
  if (assetCache.has(cacheKey)) {
    return assetCache.get(cacheKey)
  }

  const uploadPromise = (async () => {
    const response = await fetch(url)

    if (!response.ok) {
      console.warn(`Skipping ${kind} asset ${url} (${response.status} ${response.statusText})`)
      return undefined
    }

    const contentType = response.headers.get('content-type') || undefined
    if (!isExpectedAssetContentType(kind, contentType, url)) {
      console.warn(`Skipping ${kind} asset ${url} due to unexpected content-type ${contentType || 'unknown'}`)
      return undefined
    }

    const arrayBuffer = await response.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    const extension = getExtension(url, kind === 'image' ? 'jpg' : 'mp4')
    const filename = `${sanitizeFilenamePart(slug)}-${sanitizeFilenamePart(label)}.${extension}`

    let asset
    try {
      asset = await client.assets.upload(kind, buffer, {
        contentType,
        filename,
      })
    } catch (error) {
      console.warn(`Skipping ${kind} asset ${url} after upload failure: ${error.message}`)
      return undefined
    }

    return {
      _type: kind === 'image' ? 'image' : 'file',
      asset: {
        _type: 'reference',
        _ref: asset._id,
      },
    }
  })()

  assetCache.set(cacheKey, uploadPromise)
  return uploadPromise
}

async function uploadImageField({alt, label, slug, url}) {
  const assetField = await uploadAssetFromUrl({kind: 'image', label, slug, url})

  if (!assetField) {
    return undefined
  }

  return {
    ...assetField,
    alt: alt || '',
  }
}

async function uploadFileField({label, slug, url}) {
  return uploadAssetFromUrl({kind: 'file', label, slug, url})
}

async function run() {
  const csvPath = path.join(process.cwd(), '..', 'data', 'Works.csv')
  const csvText = fs.readFileSync(csvPath, 'utf8')
  const csvRows = parseCsv(csvText)
  const csvHeaders = csvRows[0] ?? []
  const worksRows = csvRows.slice(1).map((row) =>
    Object.fromEntries(csvHeaders.map((header, index) => [header, row[index] ?? ''])),
  )

  for (const [index, row] of worksRows.entries()) {
    const slug = row['Slug']
    const introduction = htmlToText(row['Content'])
    const seoDescription = row['SEO'] ? decodeHtmlEntities(row['SEO']).trim() : excerpt(introduction)

    console.log(`Migrating ${slug} (${index + 1}/${worksRows.length})`)

    const heroImage = await uploadImageField({
      alt: row['Main Image:alt'] || row['Hover Image (footer):alt'],
      label: 'hero-image',
      slug,
      url: row['Main Image'] || row['Hover Image (footer)'],
    })
    const mainColor = buildColorValue(row['Main Color'] || '')
    const seoImage = await uploadImageField({
      alt: row['SEO Image (1200 x 650):alt'],
      label: 'seo-image',
      slug,
      url: row['SEO Image (1200 x 650)'],
    })

    const galleryImageInputs = [
      {alt: row['Image (full 1):alt'], label: 'gallery-1', url: row['Image (full 1)']},
      {
        alt: row['Image (full 2) or Poster for vid:alt'],
        label: 'gallery-2',
        url: row['Image (full 2) or Poster for vid'],
      },
      {alt: row['Image (full 3):alt'], label: 'gallery-3', url: row['Image (full 3)']},
      {alt: row['Image (full 4):alt'], label: 'gallery-4', url: row['Image (full 4)']},
      {alt: row['Image (full 5):alt'], label: 'gallery-5', url: row['Image (full 5)']},
      {alt: row['Image (full 6):alt'], label: 'gallery-6', url: row['Image (full 6)']},
    ]

    const galleryImages = (
      await Promise.all(
        galleryImageInputs.map(async (image, imageIndex) => {
          const uploaded = await uploadImageField({
            alt: image.alt,
            label: image.label,
            slug,
            url: image.url,
          })

          return uploaded
            ? {
                ...uploaded,
                _key: `${slug}-gallery-${imageIndex + 1}`,
              }
            : undefined
        }),
      )
    ).filter(Boolean)

    const shortVideo = await uploadFileField({
      label: 'short-video',
      slug,
      url: row['Video File (3-5 sec)'],
    })
    const mainLongerVideo = await uploadFileField({
      label: 'main-longer-video',
      slug,
      url:
        row['Uploaded Vid in Gal'] ||
        row['Popup Video File'] ||
        row['Popup Video File (VERTICAL)'] ||
        row['(Dark) Popup Video File'],
    })
    const galleryVideo = await uploadFileField({
      label: 'uploaded-gallery-video',
      slug,
      url: row['Uploaded Vid in Gal'],
    })

    const galleryMedia = [...galleryImages]

    if (galleryVideo) {
      const galleryVideoItem = {
        ...galleryVideo,
        _key: `${slug}-gallery-video`,
        title: `${row['Title']} gallery video`,
      }

      if (galleryMedia.length > 1) {
        galleryMedia.splice(2, 0, galleryVideoItem)
      } else {
        galleryMedia.push(galleryVideoItem)
      }
    }

    await client.createOrReplace({
      _id: `work-${slug}`,
      _type: 'work',
      title: row['Title'],
      slug: {_type: 'slug', current: slug},
      orderRank: index,
      category: row['Category'] || '',
      introduction,
      mainColor,
      heroImage,
      galleryMedia,
      media: {
        shortVideo,
        mainLongerVideo,
      },
      seo: {
        description: seoDescription,
        image: seoImage,
      },
    })
  }

  console.log(`Migrated ${worksRows.length} work documents to Sanity asset fields.`)
}

run().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
