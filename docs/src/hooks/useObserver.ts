import { MutableRefObject, useEffect } from 'react'

export const useObserver = (
  ref: MutableRefObject<HTMLElement | undefined | null>,
  cb: (entry: IntersectionObserverEntry) => void,
  opts?: IntersectionObserverInit
) => {
  // set up intersection observer and add base layer styles
  useEffect(() => {
    const node = ref.current

    if (node) {
      const observer = new IntersectionObserver(entries => {
        entries.forEach(cb)
      }, opts)
      observer.observe(node)

      return () => {
        observer.unobserve(node)
      }
    }
  }, [ref, cb, opts])
}
