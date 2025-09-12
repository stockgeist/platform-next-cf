'use client'

import { Button } from '@/components/ui/button'
import {
  Dropzone,
  DropzoneContent,
  DropzoneEmptyState,
} from '@/components/ui/dropzone'
import { FolderOpen, MicIcon, Upload } from 'lucide-react'
import React, { useRef } from 'react'

interface STTDropzoneProps {
  uploadedFiles: File[]
  onFilesDropAction: (files: File[]) => void
  onRecordClickAction: () => void
  onErrorAction: (error: Error) => void
  fileSizeLimit: number
  disabled?: boolean
}

export function STTDropzone({
  uploadedFiles,
  onFilesDropAction,
  onRecordClickAction,
  onErrorAction,
  fileSizeLimit,
  disabled = false,
}: STTDropzoneProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileInputChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const files = event.target.files
    if (files) {
      onFilesDropAction(Array.from(files))
    }
  }

  return (
    <div>
      <Dropzone
        accept={{ 'audio/wav': ['.wav'], 'audio/x-wav': ['.wav'] }}
        maxFiles={1}
        maxSize={fileSizeLimit}
        onDrop={onFilesDropAction}
        onError={onErrorAction}
        src={uploadedFiles}
        className="text-center"
        disabled={disabled}
      >
        <DropzoneEmptyState>
          <div className="flex flex-col items-center justify-center">
            <Upload className="mx-auto mb-4 h-12 w-12 text-gray-400" />
            <p className="mb-2 text-lg font-medium">
              Drag and drop your audio file here
            </p>
            <p className="mb-4 text-sm text-gray-500">or</p>
            <div className="flex justify-center gap-4">
              <Button
                onClick={(e) => {
                  e.stopPropagation()
                  fileInputRef.current?.click()
                }}
                variant="outline"
                className="flex items-center gap-2"
                disabled={disabled}
              >
                <FolderOpen className="h-4 w-4" />
                Choose File
              </Button>
              <Button
                onClick={(e) => {
                  e.stopPropagation()
                  onRecordClickAction()
                }}
                className="flex items-center gap-2"
                disabled={disabled}
              >
                <MicIcon className="h-4 w-4" />
                Record Audio
              </Button>
            </div>
            <p className="mt-4 text-xs text-gray-500">
              Compatible formats: WAV • File size: up to{' '}
              {fileSizeLimit / 1024 / 1024}MB
            </p>
            <p className="mt-2 text-xs text-blue-600">
              This uploads directly to the server and saves to R2
            </p>
          </div>
        </DropzoneEmptyState>
        <DropzoneContent>
          <div className="flex flex-col items-center justify-center">
            <p className="mb-4 text-sm text-gray-500">or</p>
            <div className="flex justify-center gap-4">
              <Button
                onClick={(e) => {
                  e.stopPropagation()
                  fileInputRef.current?.click()
                }}
                variant="outline"
                className="flex items-center gap-2"
                disabled={disabled}
              >
                <FolderOpen className="h-4 w-4" />
                Choose File
              </Button>
              <Button
                onClick={(e) => {
                  e.stopPropagation()
                  onRecordClickAction()
                }}
                className="flex items-center gap-2"
                disabled={disabled}
              >
                <MicIcon className="h-4 w-4" />
                Record Audio
              </Button>
            </div>
            <p className="mt-4 text-xs text-gray-500">
              Drag and drop or click to replace
            </p>
          </div>
        </DropzoneContent>
      </Dropzone>

      <input
        ref={fileInputRef}
        type="file"
        accept="audio/wav,audio/x-wav"
        onChange={handleFileInputChange}
        className="hidden"
        disabled={disabled}
      />
    </div>
  )
}
