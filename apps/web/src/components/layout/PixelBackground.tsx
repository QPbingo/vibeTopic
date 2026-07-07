export function PixelBackground() {
  return (
    <div className="pixel-particles" aria-hidden="true">
      {Array.from({ length: 10 }).map((_, i) => (
        <div key={i} className="pixel-particle" />
      ))}
    </div>
  )
}
