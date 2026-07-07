import Link from 'next/link'

interface PixelButtonProps {
  children: React.ReactNode
  variant?: 'default' | 'accent' | 'subtle'
  href?: string
  onClick?: () => void
  type?: 'button' | 'submit'
  disabled?: boolean
  className?: string
  style?: React.CSSProperties
}

export function PixelButton({
  children, variant = 'default', href, onClick, type = 'button',
  disabled, className = '', style,
}: PixelButtonProps) {
  const variantClass =
    variant === 'accent' ? 'pixel-btn-accent' :
    variant === 'subtle' ? 'pixel-btn-subtle' : ''

  const combinedClass = `pixel-btn ${variantClass} ${className}`.trim()

  if (href) {
    return (
      <Link href={href} className={combinedClass} style={style}>
        {children}
      </Link>
    )
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={combinedClass}
      style={{ ...style, ...(disabled ? { opacity: 0.5, cursor: 'not-allowed' } : {}) }}
    >
      {children}
    </button>
  )
}
