import { useModalStore } from '@/controllers/modalController'
const Modal = ({ children }: { children: React.ReactNode }) => {
  const { resetModalChildren } = useModalStore()

  return (
    <div className="modal">
      <div
        className="modal__overlay"
        onClick={(e) => {
          e.stopPropagation()
          resetModalChildren()
        }}
      />
      <div className="modal__content">{children}</div>
    </div>
  )
}
export default Modal
