export enum WIDTHS {
  largeMobile = 480,
  tablet = 768,
  desktop = 1024,
  largeDesktop = 1440,
}

const MEDIA_QUERIES = {
  tabletUp: `@media (min-width: ${WIDTHS.tablet}px)`,
  desktopUp: `@media (min-width: ${WIDTHS.desktop}px)`,
  largeDesktopUp: `@media (min-width: ${WIDTHS.largeDesktop}px)`,
}

export { MEDIA_QUERIES }
