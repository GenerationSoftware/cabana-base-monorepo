import { NO_REFETCH } from '@shared/generic-react-hooks'
import { getPoolWidePromotionRewardsClaimedEvents } from '@shared/utilities'
import { useQueries, useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import { Address } from 'viem'
import { usePublicClientsByChain, useWorldPublicClient } from '../blockchain/useClients'
import { QUERY_KEYS } from '../constants'

/**
 * Returns pool-wide `RewardsClaimed` events
 * @param chainId the chain ID to query for promotion events in
 * @param options optional settings
 * @returns
 */
export const usePoolWidePromotionRewardsClaimedEvents = (
  chainId: number,
  options?: {
    promotionIds?: bigint[]
    userAddresses?: Address[]
    vaultAddresses?: Address[]
    fromBlock?: bigint
    toBlock?: bigint
  }
) => {
  const publicClient = useWorldPublicClient()

  const queryKey = [
    QUERY_KEYS.poolWidePromotionRewardsClaimedEvents,
    chainId,
    options?.promotionIds?.map(String),
    options?.userAddresses,
    options?.vaultAddresses,
    options?.fromBlock?.toString(),
    options?.toBlock?.toString() ?? 'latest'
  ]

  return useQuery({
    queryKey,
    queryFn: async () => {
      if (!!publicClient) {
        return await getPoolWidePromotionRewardsClaimedEvents(publicClient, options)
      }
    },
    enabled: !!chainId && !!publicClient,
    ...NO_REFETCH
  })
}

/**
 * Returns pool-wide `RewardsClaimed` events across many chains
 * @param chainIds the chain IDs to query for promotion events in
 * @param options optional settings
 * @returns
 */
export const usePoolWidePromotionRewardsClaimedEventsAcrossChains = (
  chainIds: number[],
  options?: {
    [chainId: number]: {
      promotionIds?: bigint[]
      userAddresses?: Address[]
      vaultAddresses?: Address[]
      fromBlock?: bigint
      toBlock?: bigint
    }
  }
) => {
  const publicClients = usePublicClientsByChain()

  const results = useQueries({
    queries: chainIds.map((chainId) => {
      const publicClient = publicClients[chainId]

      const queryKey = [
        QUERY_KEYS.poolWidePromotionRewardsClaimedEvents,
        chainId,
        options?.[chainId]?.promotionIds?.map(String),
        options?.[chainId]?.userAddresses,
        options?.[chainId]?.vaultAddresses,
        options?.[chainId]?.fromBlock?.toString(),
        options?.[chainId]?.toBlock?.toString() ?? 'latest'
      ]

      return {
        queryKey,
        queryFn: async () =>
          await getPoolWidePromotionRewardsClaimedEvents(publicClient, options?.[chainId]),
        enabled: !!chainId && !!publicClient,
        ...NO_REFETCH
      }
    })
  })

  return useMemo(() => {
    const isFetched = results?.every((result) => result.isFetched)
    const refetch = () => results?.forEach((result) => result.refetch())

    const data: {
      [chainId: number]: Awaited<ReturnType<typeof getPoolWidePromotionRewardsClaimedEvents>>
    } = {}
    results.forEach((result, i) => {
      if (!!result.data) {
        data[chainIds[i]] = result.data
      }
    })

    return { isFetched, refetch, data }
  }, [results])
}
