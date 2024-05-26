import { anchor, footer, copy } from './SiteFooter.css'

export const SiteFooter = () => {
  return (
    <footer className={footer}>
      <p className={copy}>
        Designed & built by{' '}
        <a
          className={anchor}
          href="https://twitter.com/_josh_ellis_"
          rel="noopener noreferrer"
          target="_blank"
        >
          Josh
        </a>
        {'. '}
        Powered by –{' '}
        <a
          className={anchor}
          href="https://www.vercel.com/"
          rel="noopener noreferrer"
          target="_blank"
        >
          Vercel
        </a>
        ,{' '}
        <a
          className={anchor}
          href="https://remix.run/"
          rel="noopener noreferrer"
          target="_blank"
        >
          Remix
        </a>
        ,{' '}
        <a
          className={anchor}
          href="https://www.algolia.com/"
          rel="noopener noreferrer"
          target="_blank"
        >
          Algolia
        </a>
        ,{' '}
        <a
          className={anchor}
          href="https://plausible.io"
          rel="noopener noreferrer"
          target="_blank"
        >
          Plausible
        </a>
        ,{' '}
        <a
          className={anchor}
          href="https://vanilla-extract.style/"
          rel="noopener noreferrer"
          target="_blank"
        >
          Vanilla Extract
        </a>{' '}
        & more...
      </p>
      <p className={copy}>{`© ${new Date().getFullYear()} react-spring`}</p>
    </footer>
  )
}
