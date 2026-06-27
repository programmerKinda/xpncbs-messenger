import React from 'react'
import { useModalStore } from '@/controllers/modalController'
interface ModalProviderProps {
  children: React.ReactElement<any>
  modal: React.ReactNode
}
const ModalProvider = ({ children, modal }: ModalProviderProps) => {
  const { setModalChildren, resetModalChildren } = useModalStore()
  const handleClick = (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault()
    setModalChildren(modal)
  }
  return (
    <div className="inline-flex">
      {React.cloneElement(children, { onClick: handleClick } as any)}
    </div>
  )
}
export default ModalProvider
