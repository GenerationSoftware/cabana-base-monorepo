import { NO_REFETCH } from '@shared/generic-react-hooks'
import { getTokenAllowances } from '@shared/utilities'
import { useQuery, useQueryClient, UseQueryResult } from '@tanstack/react-query'
import { Address, isAddress } from 'viem'
import { usePublicClient } from 'wagmi'
import { populateCachePerId } from '..'
import { QUERY_KEYS } from '../constants'

/**
 * Returns a dictionary keyed by the token addresses with allowances to a specific
 * contract for each token
 *
 * Stores queried allowances in cache
 * @param chainId chain ID
 * @param address address that issues the allowance
 * @param spenderAddress wallet address that spends the allowance
 * @param tokenAddresses token addresses to query allowances for
 * @param refetchInterval optional automatic refetching interval in ms
 * @returns
 */
export const useTokenAllowances = (
  chainId: number,
  address: Address,
  spenderAddress: Address,
  tokenAddresses: Address[],
  refetchInterval?: number
): UseQueryResult<{ [tokenAddress: Address]: bigint } | undefined, Error> => {
  const queryClient = useQueryClient()

  const publicClient = usePublicClient({ chainId })

  const enabled =
    !!chainId &&
    !!address &&
    !!spenderAddress &&
    tokenAddresses.every((tokenAddress) => !!tokenAddress && isAddress(tokenAddress)) &&
    Array.isArray(tokenAddresses) &&
    tokenAddresses.length > 0 &&
    !!publicClient

  const getQueryKey = (val: (string | number)[]) => [
    QUERY_KEYS.tokenAllowances,
    chainId,
    address,
    spenderAddress,
    val
  ]

  return useQuery({
    queryKey: getQueryKey(tokenAddresses),
    queryFn: async () => {
      if (!!publicClient) {
        const tokenAllowances = await getTokenAllowances(
          publicClient,
          address,
          spenderAddress,
          tokenAddresses
        )

        populateCachePerId(queryClient, getQueryKey, tokenAllowances)

        return tokenAllowances
      }
    },
    enabled,
    ...NO_REFETCH,
    refetchInterval: refetchInterval ?? false
  })
}

/**
 * Returns a token's allowance for a given address and spender contract
 *
 * Wraps {@link useTokenAllowances}
 * @param chainId chain ID
 * @param address address that issues the allowance
 * @param spenderAddress wallet address that spends the allowance
 * @param tokenAddress token address to query allowance for
 * @param refetchInterval optional automatic refetching interval in ms
 * @returns
 */
export const useTokenAllowance = (
  chainId: number,
  address: Address,
  spenderAddress: Address,
  tokenAddress: Address,
  refetchInterval?: number
): { data?: bigint } & Omit<
  UseQueryResult<{ [tokenAddress: Address]: bigint } | undefined, Error>,
  'data'
> => {
  const result = useTokenAllowances(
    chainId,
    address,
    spenderAddress,
    [tokenAddress],
    refetchInterval
  )
  return { ...result, data: result.data?.[tokenAddress] }
}
