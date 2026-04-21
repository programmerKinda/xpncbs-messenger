import { useState, useLayoutEffect } from 'react'

export const tooltipPosition = (
  targetRef: React.RefObject<HTMLElement> | null,
  parent: HTMLElement | null
) => {
  const [position, setPosition] = useState({ top: 0, left: 0 })

  useLayoutEffect(() => {
    if (!targetRef?.current) return

    const targetRect = targetRef.current.getBoundingClientRect()

    if (parent) {
      const parentRect = parent.getBoundingClientRect()
      setPosition({
        top: targetRect.bottom - parentRect.top,
        left: targetRect.left - parentRect.left,
      })
    } else {
      setPosition({
        top: targetRect.bottom + window.scrollY,
        left: targetRect.left + window.scrollX,
      })
    }
  }, [targetRef, parent])

  return position
}