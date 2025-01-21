import { Address } from 'viem'
import { NETWORK_KEYS } from './constants'
import { ChainTokenPrices, LpTokens, SUPPORTED_NETWORK } from './types'
import { updateCachedLpTokens, updateHandler } from './updateHandler'
import { calcLpTokenPrices, getLpTokenInfo, getOnchainTokenPrices } from './utils'

export const fetchTokenPrices = async (
  event: FetchEvent,
  chainId: SUPPORTED_NETWORK,
  tokens?: Address[],
  options?: {
    includeHistory?: boolean
  }
) => {
  try {
    const { value: allCachedChainTokenPrices } = await TOKEN_PRICES.getWithMetadata(
      NETWORK_KEYS[chainId]
    )
    const parsedAllCachedChainTokenPrices = !!allCachedChainTokenPrices
      ? (JSON.parse(allCachedChainTokenPrices) as ChainTokenPrices)
      : undefined

    if (!!tokens) {
      const chainTokenPrices: ChainTokenPrices = {}
      const tokenSet = new Set(tokens)

      // Getting prices from existing cache
      if (!!parsedAllCachedChainTokenPrices) {
        tokenSet.forEach((address) => {
          const cachedPrices = parsedAllCachedChainTokenPrices[address]
          if (!!cachedPrices) {
            if (options?.includeHistory) {
              chainTokenPrices[address] = cachedPrices
            } else {
              chainTokenPrices[address] = [cachedPrices[0]]
            }
            tokenSet.delete(address)
          }
        })
      }

      // Querying missing tokens' prices
      if (tokenSet.size > 0) {
        // TODO: should not query known lp tokens
        const missingTokenPrices = await getOnchainTokenPrices(chainId, Array.from(tokenSet))
        for (const strAddress in missingTokenPrices) {
          const address = strAddress as Address
          chainTokenPrices[address] = options?.includeHistory
            ? missingTokenPrices[address]
            : [missingTokenPrices[address][0]]
          tokenSet.delete(address)
        }
        await updateHandler(event, { [chainId]: missingTokenPrices })
      }

      // Querying missing LP token prices
      if (tokenSet.size > 0) {
        const tokenAddresses = Array.from(tokenSet)
        const lpTokenInfo = await getLpTokenInfo(chainId, tokenAddresses)

        const lpTokenAddresses = Object.keys(lpTokenInfo) as Address[]
        const invalidTokenAddresses = tokenAddresses.filter(
          (address) => !lpTokenAddresses.includes(address)
        )

        const newLpTokens: LpTokens = {}
        invalidTokenAddresses.forEach((address) => {
          newLpTokens[address.toLowerCase() as Lowercase<Address>] = { isLp: false }
        })
        Object.entries(lpTokenInfo).forEach(([_lpTokenAddress, info]) => {
          const lpTokenAddress = _lpTokenAddress.toLowerCase() as Lowercase<Address>
          newLpTokens[lpTokenAddress] = {
            isLp: true,
            underlying: info.underlyingTokens.map((token) => token.address) as [
              Address,
              Address,
              ...Address[]
            ]
          }
        })
        await updateCachedLpTokens(event, chainId, newLpTokens)

        if (lpTokenAddresses.length > 0) {
          const underlyingTokenAddresses = new Set<Lowercase<Address>>()
          Object.values(lpTokenInfo).forEach((entry) => {
            entry.underlyingTokens.forEach((token) => underlyingTokenAddresses.add(token.address))
          })

          const strUnderlyingTokenPrices = await fetchTokenPrices(event, chainId, [
            ...underlyingTokenAddresses
          ])
          const underlyingTokenPrices = !!strUnderlyingTokenPrices
            ? (JSON.parse(strUnderlyingTokenPrices) as ChainTokenPrices)
            : {}

          const lpTokenPrices = calcLpTokenPrices(lpTokenInfo, underlyingTokenPrices)
          for (const strAddress in lpTokenPrices) {
            const address = strAddress as Address
            chainTokenPrices[address] = lpTokenPrices[address]
          }
          await updateHandler(event, { [chainId]: lpTokenPrices })
        }
      }

      return JSON.stringify(chainTokenPrices)
    } else {
      if (!!parsedAllCachedChainTokenPrices) {
        Object.keys(parsedAllCachedChainTokenPrices).forEach((strAddress) => {
          const address = strAddress as Address
          parsedAllCachedChainTokenPrices[address].splice(1)
        })
        return JSON.stringify(parsedAllCachedChainTokenPrices)
      } else {
        return JSON.stringify({})
      }
    }
  } catch (e) {
    return null
  }
}
