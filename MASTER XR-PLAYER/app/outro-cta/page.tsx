"use client"

import { useState, useEffect, useRef } from "react"
import { OutroCTA } from "@/components/outro-cta"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { AlertCircle, Clock, Play, Square, Settings, EyeOff } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import Image from "next/image"

export default function OutroCTAPreview() {
  const [showCTA, setShowCTA] = useState(false)
  const [ctaText, setCtaText] = useState("click here")
  const [ctaUrl, setCtaUrl] = useState("https://apple.com")
  const [showClosedAlert, setShowClosedAlert] = useState(false)
  const [timeInSeconds, setTimeInSeconds] = useState(5)
  const [devMode, setDevMode] = useState(true)

  // Timer state
  const [timerRunning, setTimerRunning] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState(0)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  // Check for dev mode in URL query param
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const devParam = urlParams.get("dev")
    if (devParam === "false") {
      setDevMode(false)
    }
  }, [])

  const handleCtaClick = () => {
    console.log("CTA clicked!")
  }

  const handleCtaClosed = () => {
    setShowCTA(false)
    setShowClosedAlert(true)

    // Hide the alert after 3 seconds
    setTimeout(() => {
      setShowClosedAlert(false)
    }, 3000)
  }

  const startTimer = () => {
    // Reset any existing timer
    if (timerRef.current) {
      clearInterval(timerRef.current)
    }

    // Hide CTA if it's currently shown
    setShowCTA(false)

    // Set initial time remaining
    setTimeRemaining(timeInSeconds)

    // Start the timer
    setTimerRunning(true)

    // Update time remaining every second
    timerRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          // Timer complete, show CTA
          clearInterval(timerRef.current as NodeJS.Timeout)
          setTimerRunning(false)
          setShowCTA(true)
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
    setTimerRunning(false)
  }

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [])

  // Toggle dev mode and update URL
  const toggleDevMode = () => {
    const newDevMode = !devMode
    setDevMode(newDevMode)

    // Update URL without refreshing the page
    const url = new URL(window.location.href)
    if (newDevMode) {
      url.searchParams.delete("dev")
    } else {
      url.searchParams.set("dev", "false")
    }
    window.history.pushState({}, "", url.toString())
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <OutroCTA
        outroCTA_text={ctaText}
        outroCTA_backlink={ctaUrl}
        onClick={handleCtaClick}
        isVisible={showCTA}
        onClose={handleCtaClosed}
        outroCTA_timeIn_seconds={timeInSeconds}
      />

      {showClosedAlert && (
        <div className="fixed top-4 right-4 z-50 w-80">
          <Alert variant="default">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>CTA Closed</AlertTitle>
            <AlertDescription>The CTA was closed by clicking outside the link area.</AlertDescription>
          </Alert>
        </div>
      )}

      {/* Dev Mode Toggle */}
      <div className="fixed top-4 right-4 z-10">
        <Button variant="outline" size="sm" onClick={toggleDevMode} className="flex items-center gap-2">
          {devMode ? (
            <>
              <EyeOff className="h-4 w-4" />
              <span className="hidden sm:inline">Hide Controls</span>
            </>
          ) : (
            <>
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">Show Controls</span>
            </>
          )}
        </Button>
      </div>

      {/* Production View (when dev mode is off) - completely minimal */}
      {!devMode && (
        <div className="fixed bottom-4 left-4 z-10 bg-black/10 p-2 rounded-md text-xs text-muted-foreground">
          <p>OutroCTA is hidden. It will appear when triggered by an event.</p>
          <p className="mt-1">Possible triggers:</p>
          <ul className="list-disc pl-5 mt-1">
            <li>Timer completion</li>
            <li>showOutroCTA() function call</li>
            <li>Custom event dispatch</li>
          </ul>
        </div>
      )}

      {/* Dev Controls */}
      {devMode && (
        <div className="max-w-md mx-auto mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Outro CTA Controls</CardTitle>
              <CardDescription>Customize the appearance and behavior of the CTA</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Logo preview */}
              <div className="flex justify-center mb-4">
                <div className="relative w-[150px] h-[100px] border rounded">
                  <Image src="/cmm-logo-rectangle.svg" alt="CMM Logo" fill className="object-contain p-2" />
                </div>
              </div>

              {/* Timer controls */}
              <div className="space-y-4 p-4 bg-muted rounded-md">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Timer Controls
                  </h3>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={startTimer}
                      disabled={timerRunning}
                      className="h-8 px-2"
                    >
                      <Play className="h-4 w-4 mr-1" />
                      Start Timer
                    </Button>

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={stopTimer}
                      disabled={!timerRunning}
                      className="h-8 px-2"
                    >
                      <Square className="h-4 w-4 mr-1" />
                      Stop
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="time-in-seconds">outroCTA_timeIn_seconds: {timeInSeconds}s</Label>
                    {timerRunning && (
                      <span className="text-xs text-muted-foreground">Time remaining: {timeRemaining}s</span>
                    )}
                  </div>
                  <Slider
                    id="time-in-seconds"
                    min={1}
                    max={30}
                    step={1}
                    value={[timeInSeconds]}
                    onValueChange={(value) => setTimeInSeconds(value[0])}
                    disabled={timerRunning}
                  />

                  {timerRunning && (
                    <Progress value={((timeInSeconds - timeRemaining) / timeInSeconds) * 100} className="h-2 mt-2" />
                  )}
                </div>
              </div>

              <div className="flex justify-center mb-4">
                <Button variant={showCTA ? "destructive" : "default"} onClick={() => setShowCTA(!showCTA)}>
                  {showCTA ? "Hide CTA" : "Show CTA"}
                </Button>
              </div>

              <div className="flex justify-center mb-4 mt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    // Import and use the utility function in real components
                    window.dispatchEvent(new Event("showOutroCTA"))
                  }}
                >
                  Trigger CTA via Event
                </Button>
              </div>

              <div className="space-y-2">
                <Label htmlFor="cta-text">outroCTA_text</Label>
                <Input
                  id="cta-text"
                  value={ctaText}
                  onChange={(e) => setCtaText(e.target.value)}
                  placeholder="Enter CTA text"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cta-url">outroCTA_backlink</Label>
                <Input
                  id="cta-url"
                  value={ctaUrl}
                  onChange={(e) => setCtaUrl(e.target.value)}
                  placeholder="Enter URL"
                />
              </div>

              <div className="pt-4">
                <h3 className="text-sm font-medium mb-2">Code Example:</h3>
                <pre className="bg-muted p-3 rounded-md overflow-x-auto text-xs">
                  {`<OutroCTA
  outroCTA_text="${ctaText}"
  outroCTA_backlink="${ctaUrl}"
  outroCTA_timeIn_seconds={${timeInSeconds}}
  onClick={() => console.log("CTA clicked!")}
  onClose={() => console.log("CTA closed")}
/>`}
                </pre>
              </div>

              <div className="bg-muted p-3 rounded-md mt-4">
                <p className="text-sm text-muted-foreground font-medium">
                  <strong>Features:</strong>
                </p>
                <ul className="list-disc pl-5 mt-1 space-y-1 text-sm text-muted-foreground">
                  <li>Click outside the CTA link area to close it</li>
                  <li>Set a timer to automatically show the CTA after a specified time</li>
                  <li>Customize appearance and behavior</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
