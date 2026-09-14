"use client"
import React, { useEffect } from 'react'
import { useRouter } from 'next/navigation'
const page = () => {
  const router = useRouter()
  useEffect(() => {
    window.location.replace('tradesperson/home');
  }, [])
  return (
    <div className="content max-w-7xl mx-auto w-screen px-4 sm:px-6 lg:px-8 bg-muted">
      <div className="bg-surface p-6 rounded-lg  w-full max-w-md border border-neutral-200  justify-center mb-2">
        <div style={{ margin: 'auto 0' }} className='flex items-center h-full justify-center'>
          <div className="spinner-border animate-spin w-8 h-8 border-4 rounded-full border-t-accent"></div>
        </div>
      </div>

    </div>

  )
}

export default page