import { useRouteLoaderData } from 'react-router'

interface RootLoaderData {
  ENV?: {
    ENABLE_PLAUSIBLE?: string
  }
}

const useGtmEnabled = () => {
  const data = useRouteLoaderData('root') as RootLoaderData | undefined
  return data?.ENV?.ENABLE_PLAUSIBLE === 'true'
}

export const WidgetGoogleTagManagerHead = () => {
  if (!useGtmEnabled()) {
    return null
  }

  return (
    <script
      id="google-tag-manager--head"
      dangerouslySetInnerHTML={{
        __html: `
  (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-W793TTP7');
`,
      }}
    />
  )
}

export const WidgetGoogleTagManagerBody = () => {
  if (!useGtmEnabled()) {
    return null
  }

  return (
    <div
      id="google-tag-manager--body"
      dangerouslySetInnerHTML={{
        __html: `
        <!-- Google Tag Manager (noscript) -->
<noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-W793TTP7"
height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
<!-- End Google Tag Manager (noscript) -->
        `,
      }}
    />
  )
}
