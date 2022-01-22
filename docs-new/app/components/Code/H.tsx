interface HProps {
  index: number
  id: string
}

export const H = ({ index, id, ...props }: HProps) => {
  const getHighlightedWords = (): [
    targetIndex: number[],
    allHighlightWords: Element[]
  ] => {
    const codeBlock = document.getElementById(id)
    if (!codeBlock) return [[], []]

    const allHighlightWords = codeBlock.querySelectorAll(
      '.highlight-word'
    ) as unknown as Element[]
    const targetIndex = [index - 1]

    if (Math.max(...targetIndex) >= allHighlightWords.length) return [[], []]
    else return [targetIndex, allHighlightWords]
  }

  const handleMouseEnter = () => {
    const [targetIndex, allHighlightWords] = getHighlightedWords()

    targetIndex.forEach(i => allHighlightWords[i].classList.add('on'))
  }

  const handleMouseLeave = () => {
    const [targetIndex, allHighlightWords] = getHighlightedWords()
    targetIndex.forEach(i => allHighlightWords[i].classList.remove('on'))
  }

  return (
    <code
      onMouseLeave={handleMouseLeave}
      onMouseEnter={handleMouseEnter}
      style={{
        cursor: 'pointer',
      }}
      {...props}
    />
  )
}
