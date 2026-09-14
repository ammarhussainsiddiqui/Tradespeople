'use client'
import React, { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter()
  useEffect(() => {
    window.location.replace(`/user/myjobs`)
  }, [])
  return (
    <div className="flex flex-col items-center justify-center md:min-h-screen bg-muted p-2 md:p-4">
      <div style={{ margin: 'auto 0' }} className='flex items-center h-full justify-center'>
        <div className="spinner-border animate-spin w-8 h-8 border-4 rounded-full border-t-accent"></div>
      </div>
    </div>
  );
}
