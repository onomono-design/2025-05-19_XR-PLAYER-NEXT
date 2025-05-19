"use client"

import { useState } from "react"
import { LoadingModal } from "@/components/loading-modal"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function LoadingModalUsageExample() {
  // Loading state
  const [isLoading, setIsLoading] = useState(false)

  // Simulate an async operation
  const handleFetchData = async () => {
    setIsLoading(true)

    try {
      // Simulate API call or data processing
      await new Promise((resolve) => setTimeout(resolve, 2000))
      console.log("Data fetched successfully")
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  // Simulate a form submission
  const handleSubmitForm = async () => {
    setIsLoading(true)

    try {
      // Simulate form validation and submission
      await new Promise((resolve) => setTimeout(resolve, 3000))
      console.log("Form submitted successfully")
    } catch (error) {
      console.error("Error submitting form:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="p-4 max-w-md mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>LoadingModal Usage Example</CardTitle>
          <CardDescription>Demonstrates how to use the LoadingModal component with async operations</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground mb-2">
              Click the buttons below to simulate async operations that show the loading modal
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <Button onClick={handleFetchData} disabled={isLoading}>
              Fetch Data (2s)
            </Button>

            <Button onClick={handleSubmitForm} disabled={isLoading}>
              Submit Form (3s)
            </Button>
          </div>

          <div className="text-xs text-muted-foreground mt-4 p-2 bg-muted rounded">
            <p>
              <strong>Note:</strong> The buttons are disabled while loading to prevent multiple simultaneous operations.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* The LoadingModal component */}
      <LoadingModal isOpen={isLoading} onClose={() => setIsLoading(false)} />
    </div>
  )
}
