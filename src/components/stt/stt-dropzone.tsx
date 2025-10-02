'use client'

import { Button, buttonVariants } from '@/components/ui/button'
import {
  Dropzone,
  DropzoneDescription,
  DropzoneGroup,
  DropzoneInput,
  DropzoneTrigger,
  DropzoneUploadIcon,
  DropzoneZone,
} from '@/components/ui/dropzone'
import { FolderIcon, MicIcon } from 'lucide-react'
import React from 'react'
import type { FileRejection } from 'react-dropzone'

interface STTDropzoneProps {
  onFilesDropAction: (files: File[]) => void
  onRecordClickAction: () => void
  onErrorAction: (error: Error) => void
  fileSizeLimit: number
  disabled?: boolean
}

export function STTDropzone({
  onFilesDropAction,
  onRecordClickAction,
  onErrorAction,
  fileSizeLimit,
  disabled = false,
}: STTDropzoneProps) {
  const handleDropAccepted = (acceptedFiles: File[]) => {
    onFilesDropAction(acceptedFiles)
  }

  const handleDropRejected = (fileRejections: FileRejection[]) => {
    if (fileRejections.length > 0) {
      const error = fileRejections[0].errors[0]
      onErrorAction(new Error(error.message))
    }
  }

  return (
    <Dropzone
      accept={{
        'audio/wav': ['.wav'],
        'audio/x-wav': ['.wav'],
      }}
      maxSize={fileSizeLimit}
      maxFiles={1}
      onDropAccepted={handleDropAccepted}
      onDropRejected={handleDropRejected}
      disabled={disabled}
    >
      <DropzoneZone className="w-full p-8">
        <DropzoneInput />
        <DropzoneGroup className="gap-4">
          <div className="flex items-center gap-2">
            <DropzoneUploadIcon />
            <p className="text-foreground text-sm">
              Drag and drop your audio file here
            </p>
          </div>
          <DropzoneGroup>
            <p className="text-muted-foreground text-sm">or</p>
          </DropzoneGroup>
        </DropzoneGroup>
        <div className="mt-6 flex justify-center gap-4">
          <DropzoneTrigger
            className={buttonVariants()}
            onClick={(e) => {
              e.stopPropagation()
            }}
          >
            <FolderIcon />
            Choose File
          </DropzoneTrigger>
          <Button
            onClick={(e) => {
              e.stopPropagation()
              onRecordClickAction()
            }}
            disabled={disabled}
          >
            <MicIcon />
            Record
          </Button>
        </div>
        <div className="mt-4 text-center">
          <DropzoneDescription>
            Compatible formats: WAV • File size: up to{' '}
            {fileSizeLimit / 1024 / 1024}MB
          </DropzoneDescription>
        </div>
      </DropzoneZone>
    </Dropzone>
  )
}
