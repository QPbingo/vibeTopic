import { api } from './api'

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10 MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']

interface UploadResult {
  url: string
  alt?: string
  title?: string
}

export function preflightCheck(file: File): string | null {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return `不支持的文件类型: ${file.type || '未知'}`
  }
  if (file.size > MAX_FILE_SIZE) {
    return `文件过大: ${(file.size / 1024 / 1024).toFixed(1)}MB (最大 10MB)`
  }
  if (file.size === 0) {
    return '文件为空'
  }
  return null
}

function readAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(new Error('读取文件失败'))
    reader.readAsDataURL(file)
  })
}

export async function uploadImage(file: File): Promise<UploadResult> {
  const err = preflightCheck(file)
  if (err) throw new Error(err)

  const dataUrl = await readAsDataURL(file)
  const response = await api.post<{ url: string; id: string; fileType: string; mimeType: string }>('/media/upload', {
    filename: file.name,
    mimeType: file.type,
    size: file.size,
    dataUrl,
  })

  if (!response.data) {
    throw new Error('上传失败: 服务器返回数据为空')
  }

  return {
    url: response.data.url,
    alt: file.name,
  }
}

export async function uploadImages(
  files: File[],
  onProgress?: (done: number, total: number) => void
): Promise<UploadResult[]> {
  const results: UploadResult[] = []
  let done = 0
  const total = files.length

  for (const file of files) {
    try {
      const result = await uploadImage(file)
      results.push(result)
    } catch {
      // Continue with next file on error
    }
    done++
    onProgress?.(done, total)
  }

  return results
}
