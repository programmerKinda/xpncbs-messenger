import { tooltipPosition } from '@/utils/tooltipPosition'
import ReactDOM from 'react-dom'
import { forwardRef } from 'react'
import { type TooltipProps } from '../../models/tooltip'
import { usePopupStore } from '@/controllers/popupController'

const Tooltip = forwardRef<HTMLDivElement, TooltipProps>(
  ({ className, targetRef, children }, ref) => {
    const parent = usePopupStore((state) => state.parent)
    const position = tooltipPosition(targetRef, parent)

    if (!parent) return null

    return ReactDOM.createPortal(
      <div
        className={className}
        ref={ref}
        style={{
          position: 'absolute',
          top: position.top,
          left: position.left,
          zIndex: 1000,
        }}
      >
        {children}
      </div>,
      parent
    )
  }
)

export default Tooltip
