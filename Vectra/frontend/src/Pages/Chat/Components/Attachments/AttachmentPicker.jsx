import { useRef, useState } from 'react'
import { Paperclip } from 'lucide-react'
import {
  validateImageFiles,
  MAX_ATTACHMENTS,
} from './attachmentutilities'

const AttachmentPicker = ({
  onFilesSelected,
  disabled = false,
  currentCount = 0,
}) => {
  const inputRef = useRef(null)
  const [error, setError] = useState('')

  const handleFileChange = (event) => {
    const selectedFiles = Array.from(event.target.files || [])

    if (!selectedFiles.length) return

    const { validFiles, errors } = validateImageFiles(selectedFiles)

    const remainingSlots = MAX_ATTACHMENTS - currentCount
    const filesToAdd = validFiles.slice(0, Math.max(0, remainingSlots))

    if (validFiles.length > remainingSlots) {
      errors.push(`You can attach a maximum of ${MAX_ATTACHMENTS} images.`)
    }

    setError(errors.join(' '))

    if (filesToAdd.length > 0) {
      onFilesSelected?.(filesToAdd)
    }

    // Allow selecting the same file again after removing it.
    event.target.value = ''
  }

  return (
    <div className="relative shrink-0">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileChange}
        disabled={disabled}
        className="hidden"
      />

      <button
        type="button"
        onClick={() => {
          setError('')
          inputRef.current?.click()
        }}
        disabled={disabled || currentCount >= MAX_ATTACHMENTS}
        title="Attach images"
        aria-label="Attach images"
        className="flex h-9 w-9 items-center justify-center rounded-lg text-white/50 transition hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-25"
      >
        <Paperclip size={17} />
      </button>

      {error && (
        <div className="absolute bottom-12 left-0 z-50 w-64 rounded-lg border border-red-500/20 bg-[#171717] p-3 text-xs leading-5 text-red-400 shadow-xl">
          {error}
        </div>
      )}
    </div>
  )
}

export default AttachmentPicker