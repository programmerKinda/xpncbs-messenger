import { useModalStore } from '@/controllers/modalController'
import { X } from 'lucide-react'
const Modal = ({ children }: { children: React.ReactNode }) => {
  const { resetModalChildren, resetModalHeaderContent, modalHeaderContent } = useModalStore()

  return (
    <div className="modal">
      <div
        className="modal__overlay"
        onClick={(e) => {
          e.stopPropagation()
          resetModalChildren()
          resetModalHeaderContent()
        }}
      />
      <div className="modal__content">
        <div className="modal__content-header">
          <button
            onClick={(e) => {
              e.stopPropagation()
              resetModalChildren()
              resetModalHeaderContent()
            }}
          >
            <X />
          </button>
          {modalHeaderContent}
        </div>
        {children}
      </div>
    </div>
  )
}
export default Modal
