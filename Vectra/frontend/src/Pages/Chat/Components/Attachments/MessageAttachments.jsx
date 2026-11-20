
import { useEffect, useState } from 'react'
import { API_BASE } from '../../../../config'

const EMPTY_IDS = []

const MessageAttachments = ({ attachmentIds = EMPTY_IDS }) => {
  const [images, setImages] = useState([])

  useEffect(() => {
    let cancelled = false
    const objectUrls = []

    const loadImages = async () => {
      try {
        const loadedImages = await Promise.all(
          attachmentIds.map(async (id) => {
            try {
              const response = await fetch(
                `${API_BASE}/api/attachments/${encodeURIComponent(id)}/content`,
                { credentials: 'include' }
              )

              if (!response.ok) {
                console.error(`Image fetch failed: ${id}`, response.status)
                return null
              }

              const blob = await response.blob()
              const url = URL.createObjectURL(blob)
              objectUrls.push(url)

              return { id, url }
            } catch (error) {
              console.error('Failed to load attachment:', id, error)
              return null
            }
          })
        )

        if (!cancelled) {
          setImages(loadedImages.filter(Boolean))
        }
      } catch (error) {
        console.error('Failed to load message attachments:', error)
      }
    }

    if (attachmentIds.length > 0) {
      loadImages()
    } else {
      setImages([])
    }

    return () => {
      cancelled = true
      objectUrls.forEach((url) => URL.revokeObjectURL(url))
    }
  }, [attachmentIds])

  if (!images.length) return null

  return (
    <div className="mb-3 flex flex-wrap gap-2">
      {images.map((image) => (
        <img
          key={image.id}
          src={image.url}
          alt="Message attachment"
          className="max-h-64 max-w-full rounded-xl border border-black/10 object-contain"
        />
      ))}
    </div>
  )
}

export default MessageAttachments
    