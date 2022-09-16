const visit = require('unist-util-visit')

/** @type {import('unified').Plugin<[], import('mdast').Root>} */
module.exports = function parseCallouts() {
  return (tree, file) => {
    visit(tree, node => {
      if (
        node.type === 'textDirective' ||
        node.type === 'leafDirective' ||
        node.type === 'containerDirective'
      ) {
        if (
          node.name !== 'danger' &&
          node.name !== 'warning' &&
          node.name !== 'success' &&
          node.name !== 'note'
        ) {
          return
        }

        node.data = node.data ?? {}

        node.data.hName = node.name
      }
    })
  }
}
