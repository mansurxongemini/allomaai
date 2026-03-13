import { useEffect, useRef } from "react"

export function useAutosave<T>(
  value: T | null,
  saveFn: (nextValue: T) => Promise<void> | void,
  delay = 5000
) {
  const timerRef = useRef<number | null>(null)

  useEffect(() => {
    if (value == null) return

    if (timerRef.current) {
      window.clearTimeout(timerRef.current)
    }

    timerRef.current = window.setTimeout(() => {
      Promise.resolve(saveFn(value)).catch((error) => {
        console.error("Autosave failed", error)
      })
    }, delay)

    return () => {
      if (timerRef.current) {
        window.clearTimeout(timerRef.current)
      }
    }
  }, [value, saveFn, delay])
}