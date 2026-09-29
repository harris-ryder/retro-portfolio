import { Children, cloneElement, isValidElement, type ReactNode } from 'react'

// A one-letter word ("a", "I") never ends a line: it stays with the word
// after it. text-wrap: pretty evens the lines out but can't promise this.
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
