export interface TooltipProps {
    ref: React.RefObject<HTMLElement> ;
  targetRef: React.RefObject<HTMLElement> | null;
  children: React.ReactNode;
  onClose: () => void;
}
