/**
 * Format time in seconds to MM:SS or HH:MM:SS format
 */
export function formatTime(seconds: number): string {
  if (!isFinite(seconds) || seconds < 0) {
    return '0:00'
  }

  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const remainingSeconds = Math.floor(seconds % 60)

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}

/**
 * Format file size in bytes to human readable format
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'

  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

/**
 * Generate a unique ID for audio tracks
 */
export function generateAudioId(): string {
  return `audio_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

/**
 * Validate audio file type
 */
export function isValidAudioFile(file: File): boolean {
  // Only WAV files are allowed update if we support other file types
  const validTypes = ['audio/wav']

  return validTypes.includes(file.type)
}

/**
 * Get file extension from filename or URL
 */
export function getFileExtension(filename: string): string {
  return filename.split('.').pop()?.toLowerCase() || ''
}

/**
 * Convert seconds to percentage for progress bars
 */
export function secondsToPercentage(current: number, total: number): number {
  if (total === 0) return 0
  return Math.min(100, Math.max(0, (current / total) * 100))
}

/**
 * Convert percentage to seconds for progress bars
 */
export function percentageToSeconds(percentage: number, total: number): number {
  return (percentage / 100) * total
}
