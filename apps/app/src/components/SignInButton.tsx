'use client'

import { Address, Avatar, EthBalance, Identity, Name } from '@coinbase/onchainkit/identity'
import {
  ConnectWallet,
  Wallet,
  WalletDropdown,
  WalletDropdownDisconnect
} from '@coinbase/onchainkit/wallet'
import { Button } from '@shared/ui'
import { useTranslations } from 'next-intl'
import { useAccount } from 'wagmi'

export const SignInButton = () => {
  const t_common = useTranslations('Common')

  const { address, isConnected } = useAccount()

  // const { setUserAddress } = useAccount()
  console.log('isConnected')
  console.log(isConnected)
  console.log('address')
  console.log(address)

  return (
    <>
      <div className='ock-wallet'>
        <Wallet className='z-10'>
          <ConnectWallet
            text={t_common('connectWallet')}
            className={
              !!address
                ? 'bg-pt-purple-600 hover:bg-teal-400 py-2 px-2 text-sm transition'
                : 'bg-pt-teal hover:bg-teal-400 py-2 px-0 text-sm transition'
            }
          >
            {/* <Avatar border={false} className='bg-none border-0 w-4 h-4 -mr-1 -mt-1' />{' '} */}
            <Name className='text-inherit' />
          </ConnectWallet>
          <WalletDropdown>
            <Identity className='px-4 pt-3 pb-2'>
              <Avatar />
              <Name />
              <Address />
              <EthBalance />
            </Identity>
            <WalletDropdownDisconnect />
          </WalletDropdown>
        </Wallet>
      </div>

      <Button onClick={() => console.log(address)} className='text-xs' size='sm'>
        test
      </Button>
    </>
  )
}
