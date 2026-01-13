"use client"

import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import type { CropDimensions } from "@/lib/types"
import { Plus, X } from "lucide-react"
import { useState } from "react"

interface CropDimensionsInputProps {
  dimensions: CropDimensions
  onChange: (dimensions: CropDimensions) => void
}

interface DimensionPreset {
  width: number
  height: number
  label: string
}

const DEFAULT_PRESETS: DimensionPreset[] = [{ width: 940, height: 1215, label: "940×1215" }]

export function CropDimensionsInput({ dimensions, onChange }: CropDimensionsInputProps) {
  const [presets, setPresets] = useState<DimensionPreset[]>(DEFAULT_PRESETS)
  const [showAddPreset, setShowAddPreset] = useState(false)
  const [newPresetWidth, setNewPresetWidth] = useState("")
  const [newPresetHeight, setNewPresetHeight] = useState("")

  const handleAddPreset = () => {
    const width = Number.parseInt(newPresetWidth)
    const height = Number.parseInt(newPresetHeight)

    if (width > 0 && height > 0) {
      setPresets([...presets, { width, height, label: `${width}×${height}` }])
      setNewPresetWidth("")
      setNewPresetHeight("")
      setShowAddPreset(false)
    }
  }

  const handleRemovePreset = (index: number) => {
    setPresets(presets.filter((_, i) => i !== index))
  }

  const handleApplyPreset = (preset: DimensionPreset) => {
    onChange({ width: preset.width, height: preset.height })
  }

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-4">Crop Dimensions</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Specify the target dimensions for image cropping (pixels)
          </p>
        </div>

        {presets.length > 0 && (
          <div className="space-y-2">
            <Label className="text-xs font-medium text-muted-foreground">Quick Presets</Label>
            <div className="flex flex-wrap gap-2">
              {presets.map((preset, index) => (
                <div key={index} className="relative group">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleApplyPreset(preset)}
                    className="h-8 pr-8"
                  >
                    {preset.label}
                  </Button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleRemovePreset(index)
                    }}
                    className="absolute right-1 top-1/2 -translate-y-1/2 p-1 rounded-sm opacity-0 group-hover:opacity-100 hover:bg-destructive/10 transition-opacity"
                  >
                    <X className="h-3 w-3 text-destructive" />
                  </button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowAddPreset(!showAddPreset)}
                className="h-8 gap-1"
              >
                <Plus className="h-3 w-3" />
                Add
              </Button>
            </div>
          </div>
        )}

        {showAddPreset && (
          <div className="rounded-lg border border-border bg-muted/30 p-3 space-y-3">
            <Label className="text-xs font-medium">New Preset</Label>
            <div className="grid grid-cols-2 gap-2">
              <Input
                type="number"
                min="1"
                value={newPresetWidth}
                onChange={(e) => setNewPresetWidth(e.target.value)}
                placeholder="Width"
                className="h-9"
              />
              <Input
                type="number"
                min="1"
                value={newPresetHeight}
                onChange={(e) => setNewPresetHeight(e.target.value)}
                placeholder="Height"
                className="h-9"
              />
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                size="sm"
                onClick={handleAddPreset}
                disabled={!newPresetWidth || !newPresetHeight}
                className="flex-1"
              >
                Save Preset
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => {
                  setShowAddPreset(false)
                  setNewPresetWidth("")
                  setNewPresetHeight("")
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="width" className="text-sm font-medium">
              Width (px)
            </Label>
            <Input
              id="width"
              type="number"
              min="1"
              value={dimensions.width}
              onChange={(e) => onChange({ ...dimensions, width: Number.parseInt(e.target.value) || 0 })}
              placeholder="940"
              className="h-10"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="height" className="text-sm font-medium">
              Height (px)
            </Label>
            <Input
              id="height"
              type="number"
              min="1"
              value={dimensions.height}
              onChange={(e) => onChange({ ...dimensions, height: Number.parseInt(e.target.value) || 0 })}
              placeholder="1215"
              className="h-10"
            />
          </div>
        </div>

        <div className="rounded-lg bg-muted/50 p-3">
          <p className="text-xs text-muted-foreground">
            Images will be scaled to fit within these dimensions while maintaining aspect ratio
          </p>
        </div>
      </div>
    </Card>
  )
}
