import { useEffect, useRef, useState } from "react"

/**
 * 常に最新の `callback` を呼ぶ、参照の変わらない関数を返す。
 *
 * `useCallback` の依存に最新値を入れると子の再レンダーや effect の再実行を招く場面で使う。
 * ref の更新は effect で行うため React Compiler の "Cannot access refs during render" に抵触しない。
 */
export function useLatestCallback<T extends (...args: never[]) => unknown>(callback: T): T {
  const callbackRef = useRef(callback)

  useEffect(() => {
    callbackRef.current = callback
  }, [callback])

  const [latestCallback] = useState(
    () => ((...args: Parameters<T>) => callbackRef.current(...args)) as T,
  )

  return latestCallback
}
