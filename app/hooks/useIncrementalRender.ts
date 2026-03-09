import { useEffect, useState, useTransition } from "react"

/**
 * Hook for incrementally rendering large lists to improve performance.
 * @param totalItems Total number of items to render
 * @param batchSize Number of items to render per batch
 * @param enabled Whether incremental rendering is enabled
 * @returns Number of items to render currently
 */
export function useIncrementalRender(totalItems: number, batchSize = 50, enabled = true): number {
  const [visibleCount, setVisibleCount] = useState(
    enabled ? Math.min(batchSize, totalItems) : totalItems,
  )
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    if (!enabled || visibleCount >= totalItems) {
      return
    }

    const timeoutId = setTimeout(() => {
      startTransition(() => {
        setVisibleCount((prev) => Math.min(prev + batchSize, totalItems))
      })
    }, 0)

    return () => clearTimeout(timeoutId)
  }, [visibleCount, totalItems, batchSize, enabled])

  return enabled ? visibleCount : totalItems
}
