import { useMiniKit } from '@coinbase/onchainkit/minikit'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { useSelectedLanguage } from '@shared/generic-react-hooks'
import { ErrorPooly } from '@shared/react-components'
import { toast } from '@shared/ui'
import { Flowbite, Toaster } from '@shared/ui'
import { NextIntlClientProvider } from 'next-intl'
import { AppProps } from 'next/app'
import { ReactNode, useEffect, useState } from 'react'
// import { useConnect } from 'wagmi'
import { CustomAppProps } from '@pages/_app'
import { AccountFrame } from './Frames/AccountFrame'
import { DefaultFrame } from './Frames/DefaultFrame'
import { VaultFrame } from './Frames/VaultFrame'

export const AppContainer = (props: AppProps & CustomAppProps) => {
  const { Component, pageProps, serverProps, router } = props
  const { pathname, query, asPath, locale } = router

  const [isReady, setIsReady] = useState<boolean>(false)

  const { setFrameReady, isFrameReady } = useMiniKit()

  useEffect(() => {
    if (!isFrameReady) {
      setFrameReady()
      console.log('frame ready')
    }
  }, [setFrameReady, isFrameReady])

  useEffect(() => {
    const initEruda = async () => {
      if (typeof window !== 'undefined') {
        // Staging check
        // @ts-ignore
        // if (window?.location.href.match(/staging/)?.length > 0) {
        const eruda = (await import('eruda')).default
        eruda.init()
        // }
      }
    }
    initEruda()
  })

  useSelectedLanguage({
    onLanguageChange: (newLanguage) => {
      router.push({ pathname, query }, asPath, { locale: newLanguage })

      // Tiny delay to avoid flickering on differing language selection to locale default
      setTimeout(() => {
        setIsReady(true)
      }, 100)
    }
  })

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
    }
  }, [])

  // const { connect } = useConnect()

  const pageFrames: { [href: string]: ReactNode } = {
    account: <AccountFrame user={serverProps.params['user']} />,
    vault: (
      <VaultFrame
        chainId={serverProps.params['chainId']}
        vaultAddress={serverProps.params['vaultAddress']}
      />
    )
  }

  const pageFrame = pageFrames[pathname.split('/')[1]]

  return (
    <>
      {pageFrame ?? <DefaultFrame />}

      <Flowbite>
        <Toaster expand={false} />
        <NextIntlClientProvider locale={locale} timeZone={'Etc/UCT'} messages={pageProps.messages}>
          <div id='modal-root' />
          {isReady && <Component {...pageProps} />}
        </NextIntlClientProvider>
      </Flowbite>
    </>
  )
}

interface ToastLayoutProps {
  id: string
  children: ReactNode
}

const ToastLayout = (props: ToastLayoutProps) => {
  const { children, id } = props

  return (
    <div className='relative w-full flex flex-col gap-2 items-center text-center smSonner:w-80'>
      {children}
      <XMarkIcon
        className='absolute top-0 right-0 h-3 w-3 text-pt-purple-100 cursor-pointer'
        onClick={() => toast.dismiss(id)}
      />
    </div>
  )
}

const ErrorView = () => {
  return (
    <>
      <ErrorPooly className='w-16 h-auto' />
      <div className=' flex flex-col items-center text-center'>Minikit failed to install!</div>
      <span className='text-xs text-pt-purple-100'>
        This app needs to be run inside the World App. Sign in and transactions will not work in
        this environment!
      </span>
    </>
  )
}
