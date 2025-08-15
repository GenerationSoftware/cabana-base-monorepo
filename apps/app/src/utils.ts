import { farcasterFrame } from '@farcaster/frame-wagmi-connector'
import { formatNumberForDisplay } from '@shared/utilities'
import deepmerge from 'deepmerge'
import { formatUnits } from 'viem'
import { type Config, createConfig, http } from 'wagmi'
import { base } from 'wagmi/chains'
import { coinbaseWallet } from 'wagmi/connectors'
import { WALLET_STATS_API_URL } from '@constants/config'

/**
 * Returns messages for localization through next-intl
 * @param locale the locale to fetch messages for
 * @returns
 */
export const getMessages = async (locale?: string) => {
  const defaultMessages: IntlMessages = (await import(`../messages/en.json`)).default

  if (!locale) return defaultMessages

  const localeMessages: IntlMessages = (await import(`../messages/${locale}.json`)).default
  const messages = deepmerge<IntlMessages>(defaultMessages, localeMessages)

  return messages
}

/**
 * Tracks deposit and its respective wallet ID on the wallet stats API
 * @param chainId the chain ID the deposit was made in
 * @param txHash the transaction hash of the deposit
 * @param walletId the ID of the wallet used to perform the deposit
 */
export const trackDeposit = async (chainId: number, txHash: `0x${string}`, walletId: string) => {
  try {
    await fetch(`${WALLET_STATS_API_URL}/addDeposit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chainId, txHash, walletId })
    })
  } catch (e) {
    console.error(e)
  }
}

/**
 * Returns a clean, concise URI for display purposes
 * @param uri a URI to clean up
 * @returns
 */
export const getCleanURI = (URI: string) => {
  if (URI.startsWith('http')) {
    return /^(?:https?:\/\/)?(?:[^@\/\n]+@)?(?:www\.)?([^:\/?\n]+)/i.exec(URI)?.[1] ?? ''
  } else if (URI.startsWith('ipfs://') || URI.startsWith('ipns://')) {
    return `${URI.slice(0, 15)}...`
  } else {
    return URI
  }
}

/**
 * Returns a formatted token amount rounded down to an appropriate number of fractional digits
 * @param amount a token amount to format
 * @param decimals the token's decimals
 * @returns
 */
export const getRoundedDownFormattedTokenAmount = (amount: bigint, decimals: number) => {
  const shiftedAmount = formatUnits(amount, decimals)

  const fractionDigits = shiftedAmount.split('.')[1] ?? ''
  const numFractionLeadingZeroes = (fractionDigits.match(/^0+/) || [''])[0].length
  const maximumFractionDigits = Math.max(Math.min(numFractionLeadingZeroes + 1, 4), 3)

  const roundingMultiplier = 10 ** maximumFractionDigits
  const roundedAmount =
    Math.floor(parseFloat(shiftedAmount) * roundingMultiplier) / roundingMultiplier

  return formatNumberForDisplay(roundedAmount, { maximumFractionDigits })
}

// /**
//  * Connects to a Farcaster wallet if available
//  */
// export const connectFarcasterWallet = async (connect: ConnectMutate<Config, unknown>) => {
//   const frameSdk = (await import('@farcaster/frame-sdk')).default

//   const farcasterContext = await frameSdk.context

//   if (!!farcasterContext?.client?.clientFid) {
//     const frameConnector = (
//       await import('@farcaster/frame-wagmi-connector')
//     ).default() as CreateConnectorFn

//     connect({ connector: frameConnector })
//     frameSdk.actions.ready()
//   }
// }

// export const signInWithWallet = async (setUserAddress: (address: Address | undefined) => void) => {
//   setUserAddress(walletAddress)
// }

// export const signInDisconnect = async (setUserAddress: (address: Address | undefined) => void) => {
//   setUserAddress(undefined)
// }
