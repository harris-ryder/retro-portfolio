/* Minimal, hand-highlighted snippet of the navigator.clipboard approach.
   Presented like the article's media (same border / shadow / radius). */
const COLORS: Record<string, string> = {
  comment: '#9aa0a6',
  kw: '#8250df',
  fn: '#0969da',
  str: '#0a7d3f',
}

type Tok = [text: string, color?: string]

const LINES: Tok[][] = [
  [['// poll the clipboard for a Figma file link', 'comment']],
  [
    ['const', 'kw'],
    [' link = '],
    ['await', 'kw'],
    [' navigator.clipboard.'],
    ['readText', 'fn'],
    ['()'],
  ],
  [],
  [
    ['if', 'kw'],
    [' ('],
    ['/figma\\.com\\/(file|design)\\//', 'str'],
    ['.'],
    ['test', 'fn'],
    ['(link)) {'],
  ],
  [['  '], ['saveFileLink', 'fn'], ['(link)']],
  [['}']],
]

export function CodeBlock() {
  return (
    <figure className="wf-code my-[40px]">
      <pre
        className="overflow-x-auto pl-6 text-[13px] leading-[1.85]"
        style={{ color: '#24292f' }}
      >
        <code>
          {LINES.map((line, i) => (
            <span key={i}>
              {line.map((tok, j) => (
                <span key={j} style={tok[1] ? { color: COLORS[tok[1]] } : undefined}>
                  {tok[0]}
                </span>
              ))}
              {i < LINES.length - 1 ? '\n' : ''}
            </span>
          ))}
        </code>
      </pre>
    </figure>
  )
}
