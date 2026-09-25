import { useEffect, useState } from 'react'
import Cropper, { type Area } from 'react-easy-crop'
import { Check, RotateCcw } from 'lucide-react'

interface AvatarCropperProps {
  file: File
  onCancel: () => void
  onSave: (file: Blob) => Promise<void>
}

const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = reject
    image.src = url
  })

const createCroppedBlob = async (imageUrl: string, area: Area): Promise<Blob> => {
  const image = await createImage(imageUrl)
  const canvas = document.createElement('canvas')
  const context = canvas.getContext('2d')

  if (!context) throw new Error('Canvas недоступен')

  canvas.width = area.width
  canvas.height = area.height
  context.drawImage(
    image,
    area.x,
    area.y,
    area.width,
    area.height,
    0,
    0,
    area.width,
    area.height,
  )

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob)
      else reject(new Error('Не удалось подготовить аватар'))
    }, 'image/jpeg', 0.9)
  })
}

export default function AvatarCropper({ file, onCancel, onSave }: AvatarCropperProps) {
  const [imageUrl, setImageUrl] = useState('')
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [area, setArea] = useState<Area | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    const url = URL.createObjectURL(file)
    setImageUrl(url)
    return () => URL.revokeObjectURL(url)
  }, [file])

  const handleSave = async () => {
    if (!imageUrl || !area) return

    setIsSaving(true)
    try {
      await onSave(await createCroppedBlob(imageUrl, area))
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="avatar-cropper">
      <div className="avatar-cropper__viewport">
        {imageUrl && (
          <Cropper
            image={imageUrl}
            crop={crop}
            zoom={zoom}
            aspect={1}
            cropShape="round"
            showGrid
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={(_, croppedAreaPixels) => setArea(croppedAreaPixels)}
          />
        )}
      </div>

      <label className="avatar-cropper__zoom">
        <span>Масштаб</span>
        <input
          type="range"
          min={1}
          max={3}
          step={0.01}
          value={zoom}
          onChange={(event) => setZoom(Number(event.target.value))}
        />
      </label>

      <div className="avatar-cropper__actions">
        <button type="button" className="avatar-cropper__reset" onClick={() => setZoom(1)}>
          <RotateCcw size={17} /> Сбросить
        </button>
        <div>
          <button type="button" onClick={onCancel} disabled={isSaving}>
            Отмена
          </button>
          <button type="button" className="avatar-cropper__save" onClick={handleSave} disabled={isSaving}>
            <Check size={17} /> {isSaving ? 'Сохранение...' : 'Сохранить'}
          </button>
        </div>
      </div>
    </div>
  )
}