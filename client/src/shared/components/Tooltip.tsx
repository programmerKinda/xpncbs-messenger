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
}

const Tooltip = forwardRef<HTMLDivElement, Props>(
  (
    { className, targetRef, children, placement = 'bottom', align = 'start', flip = true, width },
    ref
  ) => {
    const parent = usePopupStore((s) => s.parent)
    const tooltipRef = useRef<HTMLDivElement>(null)

    const { top, left, ready } = tooltipPosition(
      targetRef,
      tooltipRef,
      parent,
      placement,
      align,
      flip
    )

    if (!parent) return null

    return ReactDOM.createPortal(
      <div
        ref={(node) => {
          tooltipRef.current = node
          if (typeof ref === 'function') ref(node)
          else if (ref) (ref as any).current = node
        }}
        className={className}
        onPointerDown={(e) => e.preventDefault()}
        style={{
          position: 'absolute',
          top,
          left,
          width,
          zIndex: 1000,
          opacity: ready ? 1 : 0, // 👈 убирает мигание
          transition: 'opacity 0.15s ease',
        }}
      >
        {children}
      </div>,
      parent
    )
  }
)

export default Tooltip
