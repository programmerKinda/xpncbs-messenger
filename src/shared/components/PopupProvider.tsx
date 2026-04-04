import React, { useRef } from 'react'
import { usePopupStore } from '@/controllers/popupController'

interface PopupProviderProps {
  children: React.ReactElement<any>
  popup: React.ReactNode
}

export const PopupProvider: React.FC<PopupProviderProps> = ({ children, popup }) => {
  const targetRef = useRef<HTMLElement | null>(null)

  const { targetRef: activeRef, setTargetRef, setChildren, onClose } = usePopupStore()

  const handleClick = () => {
    if (!targetRef.current) return

    if (activeRef === targetRef) {
      onClose()
      return
    }

    setTargetRef(targetRef as React.RefObject<HTMLElement>)
    setChildren(popup)
  }

  return (
    <div className="relative">
      {React.cloneElement(children, {
        ref: targetRef,
        onClick: handleClick,
      } as any)}
    </div>
  )
}
