/**
 * Browser detection and PDF support utilities
 */

export interface BrowserInfo {
  name: string
  version: string
  supportsPDFViewing: boolean
  hasStrictSecurity: boolean
}

export function getBrowserInfo(): BrowserInfo {
  const userAgent = navigator.userAgent.toLowerCase()
  
  let name = 'unknown'
  let version = 'unknown'
  let supportsPDFViewing = false
  let hasStrictSecurity = false

  // Chrome detection
  if (userAgent.includes('chrome') && !userAgent.includes('edge')) {
    name = 'chrome'
    const match = userAgent.match(/chrome\/([0-9.]+)/)
    version = match ? match[1] : 'unknown'
    supportsPDFViewing = true
    hasStrictSecurity = true // Chrome has strict security policies
  }
  // Firefox detection
  else if (userAgent.includes('firefox')) {
    name = 'firefox'
    const match = userAgent.match(/firefox\/([0-9.]+)/)
    version = match ? match[1] : 'unknown'
    supportsPDFViewing = true
    hasStrictSecurity = false
  }
  // Safari detection
  else if (userAgent.includes('safari') && !userAgent.includes('chrome')) {
    name = 'safari'
    const match = userAgent.match(/version\/([0-9.]+)/)
    version = match ? match[1] : 'unknown'
    supportsPDFViewing = true
    hasStrictSecurity = true // Safari has strict security policies
  }
  // Edge detection
  else if (userAgent.includes('edge')) {
    name = 'edge'
    const match = userAgent.match(/edge\/([0-9.]+)/)
    version = match ? match[1] : 'unknown'
    supportsPDFViewing = true
    hasStrictSecurity = true
  }

  return {
    name,
    version,
    supportsPDFViewing,
    hasStrictSecurity
  }
}

export function canDisplayPDFInline(): boolean {
  const browser = getBrowserInfo()
  
  // Check if browser supports PDF viewing
  if (!browser.supportsPDFViewing) {
    return false
  }
  
  // Additional checks for known issues
  if (browser.name === 'chrome') {
    // Chrome sometimes blocks PDFs from external domains
    return typeof window !== 'undefined' && window.location.protocol === 'https:'
  }
  
  return true
}

export function getPDFViewingRecommendation(): string {
  const browser = getBrowserInfo()
  
  if (!browser.supportsPDFViewing) {
    return 'Your browser does not support PDF viewing. Please download the file to view it.'
  }
  
  if (browser.hasStrictSecurity) {
    return 'If the PDF preview is blocked, try opening it in a new tab or downloading the file.'
  }
  
  return 'PDF should display normally in your browser.'
}

export function isSecureContext(): boolean {
  return typeof window !== 'undefined' && (
    window.location.protocol === 'https:' || 
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1'
  )
} 