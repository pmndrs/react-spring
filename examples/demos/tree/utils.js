export function findCollapsedParent(node) {
  if (!node.data.isExpanded) {
    return node
  } else if (node.parent) {
    return findCollapsedParent(node.parent)
  } else {
    return null
  }
}

export function getTopLeft(node, layout, orientation) {
  return {
    top: node.x,
    left: node.y,
  }
}
