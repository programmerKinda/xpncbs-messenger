import { tooltipPosition } from '@/utils/tooltipPosition'
import ReactDOM from 'react-dom'
import { forwardRef } from 'react'
import { type TooltipProps } from '../../models/tooltip'

const Tooltip = forwardRef<HTMLDivElement, TooltipProps>(
  ({ className, targetRef, children }, ref) => {
    const position = tooltipPosition(targetRef)

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
      document.body
    )
  }
)

export default Tooltip
