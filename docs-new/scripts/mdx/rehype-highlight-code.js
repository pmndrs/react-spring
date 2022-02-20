/**
 * Credit to https://ped.ro/writing/code-blocks-but-better
 */

const rangeParser = require('parse-numeric-range')
const visit = require('unist-util-visit')
const nodeToString = require('hast-util-to-string')
const refractor = require('refractor')
const highlightLine = require('./rehype-highlight-line')
const highlightWord = require('./rehype-highlight-word')

module.exports = () => {
  return tree => {
    visit(tree, 'element', visitor)
  }

  function visitor(node, index, parentNode) {
    if (parentNode.tagName === 'pre' && node.tagName === 'code') {
      // syntax highlight
      const lang = node.properties.className
        ? node.properties.className[0].split('-')[1]
        : 'md'
      const data = nodeToString(node)
      let result = refractor.highlight(data, lang)

      const linesToHighlight = [0]

      // line highlight
      if (node.data?.meta) {
        node.data.meta.split(' ').forEach(bit => {
          if (bit.includes('line')) {
            const [_, lineRange] = bit.split('=')
            linesToHighlight.push(...rangeParser(lineRange || '0'))
          }
          if (bit.includes('live')) {
            parentNode.properties.code = data
          }
        })
      }

      result = highlightLine(result, linesToHighlight)

      // word highlight
      result = highlightWord(result)

      node.children = result
    }
  }
}
