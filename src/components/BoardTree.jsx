import { boardTree } from '../data/boardTree.js'
import BoardTreeItem from './BoardTreeItem.jsx'

/** Renders the mock board tree with nesting and expansion. */
export default function BoardTree() {
  return (
    <ul className="space-y-0.5 px-0 py-0.5">
      {boardTree.map((node) => (
        <BoardTreeItem key={node.id} node={node} />
      ))}
    </ul>
  )
}
