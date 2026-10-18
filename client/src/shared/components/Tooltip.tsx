import { tooltipPosition } from '@/utils/tooltipPosition'
import ReactDOM from 'react-dom'
import { forwardRef, useRef } from 'react'
import { usePopupStore } from '@/controllers/popupController'

type Props = {
  className?: string
  targetRef: React.RefObject<HTMLElement | null>
  children: React.ReactNode
  placement?: 'top' | 'bottom' | 'left' | 'right'
  align?: 'start' | 'center' | 'end'
  flip?: boolean
  width?: string
  isClosing?: boolean
  onAnimationEnd?: (event: React.AnimationEvent<HTMLDivElement>) => void
}

const Tooltip = forwardRef<HTMLDivElement, Props>(
  (
    {
      className,
      targetRef,
      children,
      placement = 'bottom',
      align = 'start',
      flip = true,
      width,
      isClosing = false,
      onAnimationEnd,
    },
    ref
  ) => {
    const parent = usePopupStore((s) => s.parent)
    const tooltipRef = useRef<HTMLDivElement>(null)

    const {
      top,
      left,
      ready,
      placement: resolvedPlacement,
    } = tooltipPosition(targetRef, tooltipRef, parent, placement, align, flip)

    if (!parent) return null

    let transformOrigin = '50% 50%'
    if (ready && targetRef.current && tooltipRef.current) {
      const targetRect = targetRef.current.getBoundingClientRect()
      const parentRect = parent.getBoundingClientRect()
      const popupLeft = left + parentRect.left
      const popupTop = top + parentRect.top
      const popupWidth = tooltipRef.current.offsetWidth
      const popupHeight = tooltipRef.current.offsetHeight
      const clamp = (value: number, max: number) => Math.max(0, Math.min(value, max))
      const targetCenterX = targetRect.left + targetRect.width / 2
      const targetCenterY = targetRect.top + targetRect.height / 2
      const originX =
        resolvedPlacement === 'left'
          ? popupWidth
          : resolvedPlacement === 'right'
            ? 0
            : clamp(targetCenterX - popupLeft, popupWidth)
      const originY =
        resolvedPlacement === 'top'
          ? popupHeight
          : resolvedPlacement === 'bottom'
            ? 0
            : clamp(targetCenterY - popupTop, popupHeight)
      transformOrigin = `${originX}px ${originY}px`
    }

    return ReactDOM.createPortal(
      <div
        ref={(node) => {
          tooltipRef.current = node
          if (typeof ref === 'function') ref(node)
          else if (ref) (ref as any).current = node
        }}
        onPointerDown={(e) => e.preventDefault()}
        style={{
          position: 'absolute',
          top,
          left,
          width:
            width === '100%' && targetRef.current
              ? `${targetRef.current.getBoundingClientRect().width}px`
              : width,
          zIndex: 1000,
          opacity: ready ? 1 : 0, // 👈 убирает мигание
        }}
      >
        <div
          className={className}
          data-popup-closing={isClosing || undefined}
          onAnimationEnd={onAnimationEnd}
          style={{ transformOrigin }}
        >
          {children}
        </div>
      </div>,
      parent
    )
  }
)

export default Tooltip
