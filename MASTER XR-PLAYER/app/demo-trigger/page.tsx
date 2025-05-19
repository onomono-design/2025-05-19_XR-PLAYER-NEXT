"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { OutroCTA, showOutroCTA } from "@/components/outro-cta"

export default function DemoTriggerPage() {
  const [showExplanation, setShowExplanation] = useState(false)

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      {/* Include the OutroCTA component (initially hidden) */}
      <OutroCTA outroCTA_text="You triggered the CTA!" outroCTA_backlink="https://example.com" />

      <div className="max-w-md mx-auto mt-8">
        <Card>
          <CardHeader>
            <CardTitle>OutroCTA Trigger Demo</CardTitle>
            <CardDescription>This demonstrates how to trigger the OutroCTA from another component</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center p-4 bg-muted rounded-md">
              <p className="mb-4">Click the button below to trigger the OutroCTA component from this separate page.</p>
              <Button
                onClick={() => {
                  // Show the OutroCTA using the utility function
                  showOutroCTA()
                  setShowExplanation(true)
                }}
              >
                Show Outro CTA
              </Button>
            </div>

            {showExplanation && (
              <div className="p-4 border rounded-md text-sm">
                <h3 className="font-medium mb-2">How it works:</h3>
                <ol className="list-decimal pl-5 space-y-2">
                  <li>
                    Import the utility function:
                    <code className="bg-muted px-1 rounded">
                      import {"{"} showOutroCTA {"}"} from "@/components/outro-cta"
                    </code>
                  </li>
                  <li>
                    Call the function when needed:
                    <code className="bg-muted px-1 rounded">showOutroCTA()</code>
                  </li>
                  <li>The OutroCTA component (placed anywhere in your app) will receive the event and display</li>
                </ol>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
