'use client'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Key, Activity, Clock } from 'lucide-react'

interface ApiKeyStats {
  totalKeys: number
  activeKeys: number
  totalUsage: number
}

interface ApiKeyUsageStatsProps {
  initialStats: ApiKeyStats
}

export function ApiKeyUsageStats({ initialStats }: ApiKeyUsageStatsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>API Key Stats</CardTitle>
        <CardDescription>Overview of your API key usage</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center space-x-2">
          <Key className="text-muted-foreground h-4 w-4" />
          <div>
            <p className="text-sm font-medium">Total Keys</p>
            <p className="text-2xl font-bold">{initialStats.totalKeys}</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Activity className="text-muted-foreground h-4 w-4" />
          <div>
            <p className="text-sm font-medium">Active Keys</p>
            <p className="text-2xl font-bold">{initialStats.activeKeys}</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Clock className="text-muted-foreground h-4 w-4" />
          <div>
            <p className="text-sm font-medium">Keys Used</p>
            <p className="text-2xl font-bold">{initialStats.totalUsage}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
