/**
 * This file contains utilities for using client hints for user preference which
 * are needed by the server, but are only known by the browser.
 */
import { useRevalidator } from '@remix-run/react'
import * as React from 'react'
import {
  getHintUtils,
  subscribeToSchemeChange,
  themeClientHint,
} from '../../helpers/client-hints'

const hintsUtils = getHintUtils({
  theme: themeClientHint,
})

export const { getHints } = hintsUtils

/**
 * @returns inline script element that checks for client hints and sets cookies
 * if they are not set then reloads the page if any cookie was set to an
 * inaccurate value.
 */
export function ClientHintCheck() {
  const { revalidate } = useRevalidator()
  React.useEffect(
    () => subscribeToSchemeChange(() => revalidate()),
    [revalidate]
  )

  return (
    <script
      dangerouslySetInnerHTML={{
        __html: hintsUtils.getClientHintCheckScript(),
      }}
    />
  )
}
