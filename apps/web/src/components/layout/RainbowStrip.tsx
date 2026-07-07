const COLORS = [
  '#06B6D4', '#10B981', '#EAB308', '#F43F5E',
  '#A855F7', '#3B82F6', '#22D3EE', '#FB7185',
]

export function RainbowStrip() {
  return (
    <div className="rainbow-strip" aria-hidden="true">
      {COLORS.map((color, i) => (
        <div key={i} style={{ background: color }} />
      ))}
    </div>
  )
}
