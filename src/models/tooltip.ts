export interface TooltipProps {
  className?: string
  ref: React.RefObject<HTMLElement>
  targetRef: React.RefObject<HTMLElement> | null
  children: React.ReactNode
}
