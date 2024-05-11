/**
 * Credit to https://ped.ro/writing/code-blocks-but-better
 */

import rangeParser from 'parse-numeric-range'
import { visit } from 'unist-util-visit'
import { toString } from 'hast-util-to-string'
import { refractor } from 'refractor'
import tsx from 'refractor/lang/tsx'
import jsx from 'refractor/lang/jsx'
import highlightLine from './rehype-highlight-line.js'
import highlightWord from './rehype-highlight-word.js'

export default () => {
  refractor.register(tsx)
  refractor.register(jsx)

  return tree => {
    visit(tree, 'element', visitor)
  }

  function visitor(node, index, parentNode) {
    if (parentNode.tagName === 'pre' && node.tagName === 'code') {
      // syntax highlight
      const lang = node.properties.className
        ? node.properties.className[0].split('-')[1]
        : 'md'
      const data = toString(node)
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
