import Link from 'next/link'

interface PixelTagProps {
  name: string
  slug: string
  isOfficial?: boolean
  variant?: 'feed' | 'sidebar'
}

export function PixelTag({ name, slug, isOfficial, variant = 'feed' }: PixelTagProps) {
  if (variant === 'sidebar') {
    return (
      <Link
        href={`/tags/${slug}`}
        className={isOfficial ? 'sidebar-tag-official' : 'sidebar-tag'}
        style={{
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          padding: '4px 10px', fontSize: 12, lineHeight: 1, textDecoration: 'none',
        }}
      >
        {name}
      </Link>
    )
  }

  return (
    <Link
      href={`/tags/${slug}`}
      className={isOfficial ? 'pixel-tag-official' : 'pixel-tag'}
      style={{ textDecoration: 'none' }}
    >
      {name}
    </Link>
  )
}
