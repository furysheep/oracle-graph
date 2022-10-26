import { useEffect } from 'react'

const useDebouncedEffect = (fn: () => void, deps: any[], time: number) => {
  useEffect(() => {
    const timeout = setTimeout(fn, time)
    return () => {
      clearTimeout(timeout)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, fn, time])
}

export default useDebouncedEffect
