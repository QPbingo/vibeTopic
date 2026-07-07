import { describe, expect, it } from 'vitest'
import { renderMarkdown } from './content'

describe('renderMarkdown', () => {
  it('renders Markdown while removing executable HTML', () => {
    const html = renderMarkdown(`**safe**

<script>alert(1)</script>
<img src="https://cdn.example.com/a.png" onerror="alert(2)">
[bad](javascript:alert(3))`)

    expect(html).toContain('<strong>safe</strong>')
    expect(html).toContain('https://cdn.example.com/a.png')
    expect(html).not.toMatch(/<script|onerror|href=["']javascript:/i)
  })
})
