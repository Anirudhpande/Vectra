import { X, Image as ImageIcon } from 'lucide-react'
import { formatFileSize } from './attachmentutilities'

const AttachmentPreview = ({ attachments = [], onRemove }) => {
  if (!attachments.length) return null

  return (
    <div className="mb-3 flex flex-wrap gap-3">
      {attachments.map((attachment) => (
        <div
          key={attachment.localId}
          className="group relative w-24 overflow-hidden rounded-xl border border-white/10 bg-white/[0.04]"
        >
          <div className="relative h-20 w-full overflow-hidden bg-black/30">
            {attachment.previewUrl ? (
              <img
                src={attachment.previewUrl}
                alt={attachment.file?.name || 'Image attachment'}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center">
                <ImageIcon size={24} className="text-white/30" />
              </div>
            )}

            <button
              type="button"
              onClick={() => onRemove?.(attachment.localId)}
              aria-label={`Remove ${attachment.file?.name || 'attachment'}`}
              title="Remove image"
              className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/75 text-white opacity-100 transition hover:bg-red-500 sm:opacity-0 sm:group-hover:opacity-100"
            >
              <X size={13} />
            </button>
          </div>

          <div className="px-2 py-1.5">
            <p
              className="truncate text-[10px] text-white/75"
              title={attachment.file?.name}
            >
              {attachment.file?.name || 'Image'}
            </p>

            <p className="text-[9px] text-white/35">
              {attachment.file
                ? formatFileSize(attachment.file.size)
                : ''}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}

export default AttachmentPreview