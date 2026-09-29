import { Children, cloneElement, createElement, isValidElement, type ReactNode } from 'react'

// A one-letter word ("a", "I") never ends a line: it stays with the word
// after it. text-wrap: balance evens the lines out but can't promise this.
// Run on the server, while the body is still a plain element: once it has
// been streamed to a client component, later sections arrive as lazy
// references that this can't see into.
export function glue(node: ReactNode): ReactNode {
  if (typeof node === 'string') return node.replace(/(^|\s)([aAI])\s/g, '$1$2 ')
  if (Array.isArray(node)) return Children.map(node, glue)
  if (isValidElement<{ children?: ReactNode }>(node) && node.props.children !== undefined) {
    return cloneElement(node, undefined, glue(node.props.children))
  }
  return node
}

// Each paragraph's (and list item's) text is wrapped in two spans, so a
// backing can follow the ragged shape of its lines rather than the
// paragraph's box: the inner one is drawn per line, the outer one adds
// the gap above the paragraph to its first line (see .text-run and
// .text-line in globals.css). Runs on the server like glue, for the
// same reason.
export function runs(node: ReactNode): ReactNode {
  if (Array.isArray(node)) return Children.map(node, runs)
  if (!isValidElement<{ children?: ReactNode }>(node)) return node
  if (node.type === 'p' || node.type === 'li') {
    const line = createElement('span', { className: 'text-line' }, ...Children.toArray(node.props.children))
    return cloneElement(node, undefined, createElement('span', { className: 'text-run' }, line))
  }
  return node.props.children !== undefined ? cloneElement(node, undefined, runs(node.props.children)) : node
}
