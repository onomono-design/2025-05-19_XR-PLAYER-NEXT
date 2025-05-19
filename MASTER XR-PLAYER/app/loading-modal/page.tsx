"use client"

import { useState } from "react"
import { LoadingModal } from "@/components/loading-modal"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Input } from "@/components/ui/input"
import { HexColorPicker } from "react-colorful"

export default function LoadingModalDemo() {
  // Modal state
  const [isOpen, setIsOpen] = useState(false)

  // Configuration options
  const [loadingText, setLoadingText] = useState("Loading")
  const [size, setSize] = useState(200)
  const [spinnerColor, setSpinnerColor] = useState("#ffffff")
  const [textColor, setTextColor] = useState("#ffffff")
  const [closeOnOutsideClick, setCloseOnOutsideClick] = useState(false)
  const [autoClose, setAutoClose] = useState(false)
  const [autoCloseTime, setAutoCloseTime] = useState(3000)

  // Color picker visibility
  const [showSpinnerColorPicker, setShowSpinnerColorPicker] = useState(false)
  const [showTextColorPicker, setShowTextColorPicker] = useState(false)

  const handleClose = () => {
    setIsOpen(false)
  }

  return (
    <div className="min-h-screen bg-white p-4 md:p-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Loading Modal</h1>
          <p className="text-gray-500">A customizable loading modal component</p>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Preview</CardTitle>
            <CardDescription>Click the button below to show the loading modal</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Button size="lg" onClick={() => setIsOpen(true)} className="px-8">
              Show Loading Modal
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Configuration</CardTitle>
            <CardDescription>Customize the appearance and behavior of the loading modal</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Text configuration */}
            <div className="space-y-2">
              <Label htmlFor="loading-text">Loading Text</Label>
              <Input
                id="loading-text"
                value={loadingText}
                onChange={(e) => setLoadingText(e.target.value)}
                placeholder="Enter loading text"
              />
            </div>

            {/* Size configuration */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="size">Size: {size}px</Label>
              </div>
              <Slider
                id="size"
                min={100}
                max={400}
                step={10}
                value={[size]}
                onValueChange={(value) => setSize(value[0])}
              />
            </div>

            {/* Color configuration */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Spinner color */}
              <div className="space-y-2">
                <Label htmlFor="spinner-color">Spinner Color</Label>
                <div className="flex items-center gap-2">
                  <div
                    className="w-8 h-8 rounded border cursor-pointer"
                    style={{ backgroundColor: spinnerColor }}
                    onClick={() => setShowSpinnerColorPicker(!showSpinnerColorPicker)}
                  ></div>
                  <Input id="spinner-color" value={spinnerColor} onChange={(e) => setSpinnerColor(e.target.value)} />
                </div>
                {showSpinnerColorPicker && (
                  <div className="mt-2">
                    <HexColorPicker color={spinnerColor} onChange={setSpinnerColor} />
                  </div>
                )}
              </div>

              {/* Text color */}
              <div className="space-y-2">
                <Label htmlFor="text-color">Text Color</Label>
                <div className="flex items-center gap-2">
                  <div
                    className="w-8 h-8 rounded border cursor-pointer"
                    style={{ backgroundColor: textColor }}
                    onClick={() => setShowTextColorPicker(!showTextColorPicker)}
                  ></div>
                  <Input id="text-color" value={textColor} onChange={(e) => setTextColor(e.target.value)} />
                </div>
                {showTextColorPicker && (
                  <div className="mt-2">
                    <HexColorPicker color={textColor} onChange={setTextColor} />
                  </div>
                )}
              </div>
            </div>

            {/* Behavior configuration */}
            <div className="space-y-4 pt-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="close-outside">Close on Outside Click</Label>
                <Switch id="close-outside" checked={closeOnOutsideClick} onCheckedChange={setCloseOnOutsideClick} />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="auto-close">Auto Close</Label>
                <Switch id="auto-close" checked={autoClose} onCheckedChange={setAutoClose} />
              </div>

              {autoClose && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="auto-close-time">Auto Close Time: {autoCloseTime}ms</Label>
                  </div>
                  <Slider
                    id="auto-close-time"
                    min={1000}
                    max={10000}
                    step={500}
                    value={[autoCloseTime]}
                    onValueChange={(value) => setAutoCloseTime(value[0])}
                  />
                </div>
              )}
            </div>

            {/* Code example */}
            <div className="pt-4">
              <h3 className="text-sm font-medium mb-2">Code Example:</h3>
              <pre className="bg-muted p-4 rounded-md overflow-x-auto text-sm">
                {`<LoadingModal
  isOpen={${isOpen}}
  loadingText="${loadingText}"
  size={${size}}
  spinnerColor="${spinnerColor}"
  textColor="${textColor}"
  closeOnOutsideClick={${closeOnOutsideClick}}
  autoClose={${autoClose}}${
    autoClose
      ? `
  autoCloseTime={${autoCloseTime}}`
      : ""
  }
  onClose={() => setIsOpen(false)}
/>`}
              </pre>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* The actual loading modal */}
      <LoadingModal
        isOpen={isOpen}
        loadingText={loadingText}
        size={size}
        spinnerColor={spinnerColor}
        textColor={textColor}
        closeOnOutsideClick={closeOnOutsideClick}
        autoClose={autoClose}
        autoCloseTime={autoCloseTime}
        onClose={handleClose}
      />
    </div>
  )
}
