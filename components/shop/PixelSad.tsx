// a sad face, drawn pixel by pixel
const FACE = [
  '....#####....',
  '..##.....##..',
  '.#.........#.',
  '.#..#...#..#.',
  '#...#...#...#',
  '#...........#',
  '#...........#',
  '#....###....#',
  '#...#...#...#',
  '.#.........#.',
  '.#.........#.',
  '..##.....##..',
  '....#####....',
]

// the speech bubble's tail, also in pixels; it points left on wide screens, up on phones
const TAIL_LEFT = ['...#', '..##', '.#.#', '#..#', '.#.#', '..##', '...#']
const TAIL_UP = ['...#...', '..#.#..', '.#...#.', '#.....#']

function Pixels({ rows, className }: { rows: string[]; className?: string }) {
  return (
    <svg
      aria-hidden
      viewBox={`0 0 ${rows[0].length} ${rows.length}`}
      className={className}
      shapeRendering="crispEdges"
      fill="currentColor"
    >
      {rows.flatMap((row, y) =>
        [...row].map((cell, x) => (cell === '#' ? <rect key={`${x}-${y}`} x={x} y={y} width={1} height={1} /> : null)),
      )}
    </svg>
  )
}

/** the little sad face, saying our line in a pixel speech bubble */
export default function PixelSad({ text, fontClass }: { text: string; fontClass: string }) {
  return (
    <figure className="flex flex-col items-center sm:flex-row sm:items-center">
      <Pixels rows={FACE} className="w-16 shrink-0 text-foreground sm:w-20" />
      {/* a few pixels of air, then the tail */}
      <Pixels rows={TAIL_UP} className="mt-4 h-[12px] w-[21px] text-foreground sm:hidden" />
      <Pixels rows={TAIL_LEFT} className="ml-6 hidden h-[21px] w-[12px] text-foreground sm:block" />
      <figcaption
        className={`${fontClass} max-w-md border-[3px] border-foreground px-5 py-4 text-center text-sm leading-relaxed text-foreground sm:-ml-[3px] sm:text-left sm:text-base`}
        // pixel-stepped corners instead of rounded ones
        style={{
          clipPath:
            'polygon(0 3px, 3px 3px, 3px 0, calc(100% - 3px) 0, calc(100% - 3px) 3px, 100% 3px, 100% calc(100% - 3px), calc(100% - 3px) calc(100% - 3px), calc(100% - 3px) 100%, 3px 100%, 3px calc(100% - 3px), 0 calc(100% - 3px))',
        }}
      >
        {text}
      </figcaption>
    </figure>
  )
}
