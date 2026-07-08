import type { PostMedia } from '@bingo/shared'

/**
 * Extract post media for display on cards.
 * Returns explicit media if present, otherwise parses first 3 Markdown image URLs.
 * Ignores data:, javascript:, and non-image links.
 */
export function extractPostMedia(
  contentMd: string,
  explicitMedia?: PostMedia[]
): PostMedia[] {
  if (explicitMedia && explicitMedia.length > 0) {
    return explicitMedia.slice(0, 3)
  }

  const images: PostMedia[] = []
  const seen = new Set<string>()

  // Match Markdown images: ![alt](url) or ![alt](url "title")
  const imgRegex = /!\[[^\]]*\]\(([^\s)]+)(?:\s+"[^"]*")?\)/g
  let match: RegExpExecArray | null

  while ((match = imgRegex.exec(contentMd)) !== null) {
    const url = match[1]!
    // Ignore data: and javascript: URLs
    if (url.startsWith('data:') || url.startsWith('javascript:')) continue
    // Skip non-image URLs
    if (!isImageUrl(url)) continue
    // Deduplicate
    if (seen.has(url)) continue
    seen.add(url)

    images.push({ type: 'image', url })
    if (images.length >= 3) break
  }

  return images
}

function isImageUrl(url: string): boolean {
  // Relative upload URLs
  if (url.startsWith('/uploads/')) return true
  // HTTP(S) URLs with image extensions
  if (url.startsWith('http://') || url.startsWith('https://')) {
    const imageExts = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.bmp']
    const lower = url.toLowerCase().split('?')[0]!
    return imageExts.some(ext => lower.endsWith(ext))
  }
  return false
}
