export function PixelLogo() {
  // 5x5 grid pixel "B" logo
  const grid = [
    [1, 1, 1, 0, 0],
    [1, 0, 0, 1, 0],
    [1, 1, 1, 0, 0],
    [1, 0, 0, 1, 0],
    [1, 1, 1, 0, 0],
  ]

  // Alternate colors: cyan, pink, purple
  const getClass = (row: number, col: number) => {
    const idx = (row + col) % 3
    if (idx === 0) return 'on'
    if (idx === 1) return 'on2'
    return 'on3'
  }

  return (
    <div className="pixel-logo" aria-hidden="true">
      {grid.flatMap((row, r) =>
        row.map((cell, c) => (
          <div
            key={`${r}-${c}`}
            className={`px ${cell ? getClass(r, c) : ''}`}
          />
        ))
      )}
    </div>
  )
}
