import { useState, useEffect } from 'react'
export const tooltipPosition = (targetRef: React.RefObject<HTMLElement> | null) => {
  const [position, setPosition] = useState({ top: 0, left: 0 })

  useEffect(() => {
    if (!targetRef) return
    if (targetRef.current) {
      const rect = targetRef.current.getBoundingClientRect()
      setPosition({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
      })
    }
  }, [targetRef])
  return position
}
