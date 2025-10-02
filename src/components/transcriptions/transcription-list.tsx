'use client'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import type { Transcription } from '@/db/schema'
import { formatDistanceToNow } from 'date-fns'
import {
  CheckCircle,
  Clock,
  FileText,
  XCircle,
  Eye,
  Search,
} from 'lucide-react'
import { ActionButtons } from './action-buttons'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { useState, useMemo } from 'react'

interface TranscriptionListProps {
  transcriptions: Transcription[]
}

function TranscriptionTextDialog({
  transcription,
}: {
  transcription: Transcription
}) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Eye className="mr-2 h-4 w-4" />
          View Text
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{transcription.fileName}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {transcription.transcriptionText ? (
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Transcription:</h4>
              <div className="bg-muted rounded-md p-4">
                <p className="text-sm leading-relaxed whitespace-pre-wrap">
                  {transcription.transcriptionText}
                </p>
              </div>
            </div>
          ) : (
            <div className="py-8 text-center">
              <FileText className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
              <p className="text-muted-foreground">
                No transcription available
              </p>
            </div>
          )}

          {transcription.errorMessage && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-red-600">Error:</h4>
              <div className="rounded-md border border-red-200 bg-red-50 p-4">
                <p className="text-sm text-red-600">
                  {transcription.errorMessage}
                </p>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

export function TranscriptionList({ transcriptions }: TranscriptionListProps) {
  const [searchQuery, setSearchQuery] = useState('')

  const filteredTranscriptions = useMemo(() => {
    if (!searchQuery.trim()) {
      return transcriptions
    }

    return transcriptions.filter((transcription) =>
      transcription.fileName.toLowerCase().includes(searchQuery.toLowerCase()),
    )
  }, [transcriptions, searchQuery])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'processing':
        return <Clock className="h-4 w-4 text-yellow-500" />
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return (
          <Badge variant="default" className="bg-green-100 text-green-800">
            Completed
          </Badge>
        )
      case 'processing':
        return (
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
            Processing
          </Badge>
        )
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  if (transcriptions.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <FileText className="text-muted-foreground mb-4 h-12 w-12" />
          <h3 className="mb-2 text-lg font-semibold">No transcriptions yet</h3>
          <p className="text-muted-foreground text-center">
            Upload an audio file to get started with speech-to-text
            transcription.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <div className="relative max-w-sm flex-1">
          <Search className="text-muted-foreground absolute top-2.5 left-2 h-4 w-4" />
          <Input
            placeholder="Search transcriptions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>
        {searchQuery && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSearchQuery('')}
          >
            Clear
          </Button>
        )}
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>File Name</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Date</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredTranscriptions.length > 0 ? (
            filteredTranscriptions.map((transcription) => (
              <TableRow key={transcription.id}>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(transcription.status)}
                    <span className="font-medium">
                      {transcription.fileName}
                    </span>
                  </div>
                </TableCell>
                <TableCell>{getStatusBadge(transcription.status)}</TableCell>
                <TableCell>
                  {formatDistanceToNow(new Date(transcription.createdAt), {
                    addSuffix: true,
                  })}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end space-x-2">
                    <TranscriptionTextDialog transcription={transcription} />
                    <ActionButtons transcription={transcription} />
                  </div>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={4} className="h-24 text-center">
                No transcriptions found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
