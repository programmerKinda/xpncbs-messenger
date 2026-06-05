import React, { useRef } from 'react'
import { usePopupStore } from '@/controllers/popupController'
import { type Placement, type Align } from '@/models/tooltip'
interface PopupProviderProps {
  children: React.ReactElement<any>
  popup: React.ReactNode
  placement: Placement
  align: Align
}

export const PopupProvider: React.FC<PopupProviderProps> = ({
  children,
  popup,
  placement,
  align,
}) => {
  const targetRef = useRef<HTMLElement | null>(null)

  const { targetRef: activeRef, setPopup, onClose } = usePopupStore()

  const handleClick = (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault()
    if (!targetRef.current) return

    if (activeRef?.current === targetRef.current) {
      onClose()
      return
    }

    setPopup({
      ref: targetRef as React.RefObject<HTMLElement>,
      children: popup,
      placement: placement,
      align: align,
    })
  }

  const handleMouseDown = (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault()
    if (children.props.onMouseDown) {
      children.props.onMouseDown(e)
    }
  }

  const handlePointerDown = (e: React.PointerEvent<HTMLElement>) => {
    e.preventDefault()
    if (children.props.onPointerDown) {
      children.props.onPointerDown(e)
    }
  }

  return (
    <div className="relative inline-flex">
      {React.cloneElement(children, {
        ref: targetRef,
        onClick: handleClick,
        onMouseDown: handleMouseDown,
        onPointerDown: handlePointerDown,
      } as any)}
    </div>
  )
}
