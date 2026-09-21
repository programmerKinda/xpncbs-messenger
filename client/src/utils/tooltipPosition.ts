import { useState, useLayoutEffect, useRef } from 'react'

type Placement = 'top' | 'bottom' | 'left' | 'right'
type Align = 'start' | 'center' | 'end'

export const tooltipPosition = (
  targetRef: React.RefObject<HTMLElement | null> | null,
  tooltipRef: React.RefObject<HTMLElement | null> | null,
  parent: HTMLElement | null,
  placement: Placement = 'bottom',
  align: Align = 'start',
  flip = true
) => {
  const [position, setPosition] = useState({ top: 0, left: 0, ready: false })
  const observerRef = useRef<ResizeObserver | null>(null)

  const calculatePosition = () => {
    if (!targetRef?.current || !tooltipRef?.current) return

    const targetRect = targetRef.current.getBoundingClientRect()
    const tooltipRect = tooltipRef.current.getBoundingClientRect()

    const OFFSET = 8

    const viewportWidth = window.innerWidth
    const viewportHeight = window.innerHeight

    const getAlignedLeft = () => {
      switch (align) {
        case 'start':
          return targetRect.left
        case 'center':
          return targetRect.left + targetRect.width / 2 - tooltipRect.width / 2
        case 'end':
          return targetRect.right - tooltipRect.width
      }
    }

    const getAlignedTop = () => {
      switch (align) {
        case 'start':
          return targetRect.top
        case 'center':
          return targetRect.top + targetRect.height / 2 - tooltipRect.height / 2
        case 'end':
          return targetRect.bottom - tooltipRect.height
      }
    }

    let top = 0
    let left = 0

    // базовая позиция
    switch (placement) {
      case 'top':
        top = targetRect.top - tooltipRect.height - OFFSET
        left = getAlignedLeft()
        break

      case 'bottom':
        top = targetRect.bottom + OFFSET
        left = getAlignedLeft()
        break

      case 'left':
        top = getAlignedTop()
        left = targetRect.left - tooltipRect.width - OFFSET
        break

      case 'right':
        top = getAlignedTop()
        left = targetRect.right + OFFSET
        break
    }

    // 🔥 FLIP
    if (flip && placement === 'top' && top < 0) {
      top = targetRect.bottom + OFFSET
    }

    if (flip && placement === 'bottom' && top + tooltipRect.height > viewportHeight) {
      top = targetRect.top - tooltipRect.height - OFFSET
    }

    if (placement === 'left' && left < 0) {
      left = targetRect.right + OFFSET
    }

    if (placement === 'right' && left + tooltipRect.width > viewportWidth) {
      left = targetRect.left - tooltipRect.width - OFFSET
    }

    // 🔥 CLAMP (чтобы не вылезал за экран)
    left = Math.max(8, Math.min(left, viewportWidth - tooltipRect.width - 8))
    top = flip
      ? Math.max(8, Math.min(top, viewportHeight - tooltipRect.height - 8))
      : Math.max(8, top)

    // если есть parent (portal внутри контейнера)
    if (parent) {
      const parentRect = parent.getBoundingClientRect()
      top -= parentRect.top
      left -= parentRect.left
    } else {
      top += window.scrollY
      left += window.scrollX
    }

    setPosition({ top, left, ready: true })
  }

  useLayoutEffect(() => {
    calculatePosition()

    if (tooltipRef?.current) {
      observerRef.current = new ResizeObserver(calculatePosition)
      observerRef.current.observe(tooltipRef.current)
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
        observerRef.current = null
      }
    }
  }, [targetRef?.current, tooltipRef?.current, parent, placement, align])

  return position
}
