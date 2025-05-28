"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { FileText, ExternalLink, Download, RefreshCw } from "lucide-react"

interface PDFViewerProps {
  url: string
  filename?: string
  className?: string
}

export function PDFViewer({ url, filename = "document.pdf", className = "" }: PDFViewerProps) {
  const [viewerError, setViewerError] = useState(false)
  const [retryCount, setRetryCount] = useState(0)

  // Reset error state when URL changes
  useEffect(() => {
    setViewerError(false)
    setRetryCount(0)
  }, [url])

  const handleError = () => {
    setViewerError(true)
  }

  const handleRetry = () => {
    setViewerError(false)
    setRetryCount(prev => prev + 1)
  }

  const handleDownload = () => {
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    link.target = '_blank'
    link.rel = 'noopener noreferrer'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleOpenInNewTab = () => {
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  // Check if browser supports PDF viewing
  const isBrowserCompatible = () => {
    const userAgent = navigator.userAgent.toLowerCase()
    const isChrome = userAgent.includes('chrome') && !userAgent.includes('edge')
    const isFirefox = userAgent.includes('firefox')
    const isSafari = userAgent.includes('safari') && !userAgent.includes('chrome')
    const isEdge = userAgent.includes('edge')
    
    return isChrome || isFirefox || isSafari || isEdge
  }

  if (viewerError || !isBrowserCompatible()) {
    return (
      <div className={`flex flex-col items-center justify-center bg-gray-50 border rounded-lg p-8 text-center ${className}`}>
        <FileText className="w-16 h-16 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          {viewerError ? "PDF Preview Blocked" : "PDF Preview Not Supported"}
        </h3>
        <p className="text-gray-600 mb-6 max-w-md">
          {viewerError 
            ? "Your browser has blocked the PDF preview for security reasons. You can still view or download the PDF using the options below."
            : "Your browser doesn't support inline PDF viewing. Use the options below to view the document."
          }
        </p>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            onClick={handleOpenInNewTab}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Open in New Tab
          </Button>
          
          <Button
            variant="outline"
            onClick={handleDownload}
          >
            <Download className="w-4 h-4 mr-2" />
            Download PDF
          </Button>
          
          {viewerError && retryCount < 2 && (
            <Button
              variant="outline"
              onClick={handleRetry}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          )}
        </div>
        
        <p className="text-xs text-gray-500 mt-4">
          File: {filename}
        </p>
      </div>
    )
  }

  return (
    <div className={`relative ${className}`}>
      {/* Try multiple PDF viewing methods */}
      
      {/* Method 1: Object tag (most compatible) */}
      <object
        key={`object-${retryCount}`}
        data={`${url}#toolbar=0&navpanes=0&scrollbar=0&zoom=page-fit`}
        type="application/pdf"
        className="w-full h-full"
        onError={handleError}
      >
        {/* Method 2: Embed tag (fallback) */}
        <embed
          src={`${url}#toolbar=0&navpanes=0&scrollbar=0&zoom=page-fit`}
          type="application/pdf"
          className="w-full h-full"
          onError={handleError}
        />
      </object>
      
      {/* Loading overlay for slow connections */}
      <div className="absolute inset-0 bg-gray-100 flex items-center justify-center pointer-events-none opacity-0 transition-opacity duration-1000">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-sm text-gray-600">Loading PDF...</p>
        </div>
      </div>
    </div>
  )
} 