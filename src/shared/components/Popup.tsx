import { forwardRef } from 'react'
import Tooltip from './Tooltip'
import { type TooltipProps } from '../../models/tooltip'

const Popup = forwardRef<HTMLDivElement, TooltipProps>(({ targetRef, children }, ref) => {
  return (
    <Tooltip
      ref={ref}
      className="w-44 
  bg-white dark:bg-[#2a2a2a] rounded-xl shadow-lg border border-gray-200 dark:border-[#3a3a3a]
  py-1"
      targetRef={targetRef}
    >
      {children}
    </Tooltip>
  )
})

export default Popup
