'use client'

import { CheckCircle2 } from "lucide-react"
import { Button } from "../../../../components/ui/button"
import { useEffect, useState } from "react"
import Link from "next/link"

export default function ThankYouPage({ searchParams }) {
  const sessionId = searchParams?.session_id || null
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState("Processing your payment...")

  useEffect(() => {
    if (sessionId) {
      setTimeout(() => {
        setMessage("Your subscription is now active. Welcome aboard!")
        setLoading(false)
      }, 1000)
    } else {
      setMessage("Payment was successful.")
      setLoading(false)
    }
  }, [sessionId])

  return (
    <div className="flex items-center justify-center  p-4">
      <div className="bg-surface rounded-xl shadow-lg border border-accent p-8 max-w-md w-full text-center">
        <CheckCircle2 className="w-16 h-16 text-accent mx-auto mb-4" />
        <h1 className="text-3xl font-bold text-accent mb-2">Thank You!</h1>
        <p className="text-ink-soft mb-6">
          {loading ? "Processing your payment..." : message}
        </p>
        <Button asChild className="bg-accent hover:bg-accent/90 text-ink-inverse">
          <Link href="/tradesperson/home">Continue</Link>
        </Button>
      </div>
    </div>
  )
}
