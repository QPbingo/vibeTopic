import { marked } from 'marked'
import sanitizeHtml from 'sanitize-html'

const allowedTags = [
  'p', 'br', 'strong', 'em', 'del', 'blockquote', 'ul', 'ol', 'li',
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'pre', 'code', 'a', 'img',
  'hr', 'table', 'thead', 'tbody', 'tr', 'th', 'td',
]

export function renderMarkdown(markdown: string): string {
  const rendered = marked.parse(markdown, { async: false, gfm: true, breaks: true }) as string
  return sanitizeHtml(rendered, {
    allowedTags,
    allowedAttributes: {
      a: ['href', 'title', 'rel'],
      img: ['src', 'alt', 'title'],
      code: ['class'],
    },
    allowedSchemes: ['http', 'https', 'mailto'],
    transformTags: {
      a: (_tagName, attribs) => ({
        tagName: 'a',
        attribs: { ...attribs, rel: 'noopener noreferrer' },
      }),
    },
  })
}
