import { DOMAINS } from '@shared/utilities'
import Document, { Head, Html, Main, NextScript } from 'next/document'

class MyDocument extends Document {
  render() {
    const title = process.env.NEXT_PUBLIC_ONCHAINKIT_PROJECT_NAME
    const description = process.env.NEXT_PUBLIC_APP_DESCRIPTION
    const keywords = 'pooltogether prize savings win save 4626 ethereum'
    const ogImage = `${DOMAINS.app}/facebook-share-image-1200-630.png`
    const twitterImage = `${DOMAINS.app}/twitter-share-image-1200-675.png`

    const url = process.env.NEXT_PUBLIC_URL as string

    const frame = {
      version: 'next',
      imageUrl: process.env.NEXT_PUBLIC_APP_HERO_IMAGE,
      button: {
        title: `Launch ${process.env.NEXT_PUBLIC_ONCHAINKIT_PROJECT_NAME}`,
        action: {
          type: 'launch_frame',
          name: process.env.NEXT_PUBLIC_ONCHAINKIT_PROJECT_NAME,
          url,
          splashImageUrl: process.env.NEXT_PUBLIC_APP_SPLASH_IMAGE,
          splashBackgroundColor: process.env.NEXT_PUBLIC_SPLASH_BACKGROUND_COLOR
        }
      }
    }

    return (
      <Html className='bg-pt-purple-700 text-pt-purple-50 overflow-x-hidden dark'>
        <Head>
          <link rel='icon' href='/favicon.png' type='image/x-icon' />
          <link rel='apple-touch-icon' href='/apple-touch-icon.png' />
          <link rel='manifest' href='/manifest.json' />

          <meta name='base:app_id' content='6938c6dce6be54f5ed71d4d0' />

          <meta name='theme-color' content='#21064e' />
          <meta name='description' content={description} />
          <meta name='keywords' content={keywords} />
          <meta name='author' content='Generation Software' />

          <meta property='title' content={title} />
          <meta property='description' content={description} />

          <meta property='og:title' content={title} />
          <meta property='og:description' content={description} />
          <meta property='og:site_name' content={title} />
          <meta property='og:url' content={DOMAINS.app} />
          <meta property='og:type' content='website' />
          <meta property='og:image' content={ogImage} />
          <meta property='og:rich_attachment' content='true' />
          <meta property='og:image:width' content='1200' />
          <meta property='og:image:height' content='630' />

          <meta property='twitter:title' content={title} />
          <meta property='twitter:description' content={description} />
          <meta property='twitter:card' content='summary_large_image' />
          <meta property='twitter:site' content='@g9software' />
          <meta property='twitter:image:src' content={twitterImage} />
          <meta property='twitter:url' content={DOMAINS.app} />
          <meta property='twitter:creator' content='@g9software' />

          <meta name='fc:frame' content={JSON.stringify(frame)} />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    )
  }
}

export default MyDocument
