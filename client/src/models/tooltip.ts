export type Placement = 'top' | 'bottom' | 'left' | 'right'
export type Align = 'start' | 'center' | 'end'
export interface TooltipProps {
  className?: string
  ref: React.RefObject<HTMLElement>
  targetRef: React.RefObject<HTMLElement> | null
  children: React.ReactNode
  placement: Placement
  align: Align
}
