"use client"

import { Progress } from "@/components/ui/progress"
import { Card } from "@/components/ui/card"
import { CheckCircle2, AlertCircle, Loader2 } from "lucide-react"
import type { ProcessingProgress as ProgressType } from "@/lib/types"

interface ProcessingProgressProps {
  progress: ProgressType
}

export function ProcessingProgress({ progress }: ProcessingProgressProps) {
  const percentage = (progress.currentRow / progress.totalRows) * 100

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-foreground">Processing Status</h3>
          {progress.status === "processing" && <Loader2 className="h-5 w-5 animate-spin text-primary" />}
          {progress.status === "complete" && <CheckCircle2 className="h-5 w-5 text-accent" />}
          {progress.status === "error" && <AlertCircle className="h-5 w-5 text-destructive" />}
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">
              Processing: <span className="font-medium text-foreground">{progress.currentSku}</span>
            </span>
            <span className="font-medium text-foreground">
              {progress.currentRow} / {progress.totalRows}
            </span>
          </div>
          <Progress value={percentage} className="h-2" />
        </div>

        {progress.status === "complete" && (
          <div className="rounded-lg bg-accent/10 p-3 border border-accent/20">
            <p className="text-sm font-medium text-accent">Processing complete!</p>
          </div>
        )}

        {progress.status === "error" && progress.error && (
          <div className="rounded-lg bg-destructive/10 p-3 border border-destructive/20">
            <p className="text-sm font-medium text-destructive">{progress.error}</p>
          </div>
        )}
      </div>
    </Card>
  )
}
