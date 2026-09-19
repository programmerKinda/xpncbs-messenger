import { forwardRef } from 'react'
import Tooltip from './Tooltip'

const Popup = forwardRef<HTMLDivElement, any>(
  ({ targetRef, children, placement, align, flip }, ref) => {
    return (
      <Tooltip
        ref={ref}
        targetRef={targetRef}
        placement={placement}
        align={align}
        flip={flip}
        className="w-max bg-white dark:bg-[#2a2a2a] rounded-xl shadow-lg border border-gray-200 dark:border-[#3a3a3a] py-1"
      >
        {children}
      </Tooltip>
    )
  }
)

export default Popup
