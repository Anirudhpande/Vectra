export const MAX_IMAGE_SIZE = 10 * 1024 * 1024 // 10 MB
export const MAX_ATTACHMENTS = 5

export const validateImageFiles = (files) => {
  const validFiles = []
  const errors = []

  for (const file of Array.from(files || [])) {
    if (!file.type.startsWith('image/')) {
      errors.push(`${file.name}: Only image files are supported.`)
      continue
    }

    if (file.size > MAX_IMAGE_SIZE) {
      errors.push(`${file.name}: Image must be smaller than 10 MB.`)
      continue
    }

    validFiles.push(file)
  }

  return { validFiles, errors }
}

export const createPreviewUrl = (file) => {
  return URL.createObjectURL(file)
}

export const revokePreviewUrl = (url) => {
  if (url) {
    URL.revokeObjectURL(url)
  }
}

export const formatFileSize = (bytes) => {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}