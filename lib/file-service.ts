import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage"
import { storage } from "@/app/lib/firebase"

// File validation constants
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
const ALLOWED_FILE_TYPES = ["application/pdf"]

// Validate PDF file
export function validatePDFFile(file: File): { isValid: boolean; error?: string } {
  if (!file) {
    return { isValid: false, error: "No file selected" }
  }

  if (!ALLOWED_FILE_TYPES.includes(file.type)) {
    return { isValid: false, error: "Only PDF files are allowed" }
  }

  if (file.size > MAX_FILE_SIZE) {
    return { isValid: false, error: `File size must be less than ${formatFileSize(MAX_FILE_SIZE)}` }
  }

  return { isValid: true }
}

// Format file size for display
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes"

  const k = 1024
  const sizes = ["Bytes", "KB", "MB", "GB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
}

// Upload PDF file to Firebase Storage
export async function uploadJobPDF(file: File, jobId: string): Promise<string> {
  try {
    // Validate file first
    const validation = validatePDFFile(file)
    if (!validation.isValid) {
      throw new Error(validation.error)
    }

    // Generate unique filename
    const timestamp = new Date().getTime()
    const filename = `job-${jobId}-${timestamp}.pdf`
    const filePath = `job-pdfs/${filename}`

    // Create storage reference
    const storageRef = ref(storage, filePath)

    // Upload file
    console.log("📤 Uploading PDF to Firebase Storage:", filename)
    const snapshot = await uploadBytes(storageRef, file)

    // Get download URL
    const downloadURL = await getDownloadURL(snapshot.ref)
    console.log("✅ PDF uploaded successfully:", downloadURL)

    return downloadURL
  } catch (error: any) {
    console.error("❌ Error uploading PDF:", error)
    throw new Error(`Failed to upload PDF: ${error.message}`)
  }
}

// Delete PDF file from Firebase Storage
export async function deleteJobPDF(pdfUrl: string): Promise<void> {
  try {
    if (!pdfUrl) {
      throw new Error("No PDF URL provided")
    }

    // Extract file path from URL
    const url = new URL(pdfUrl)
    const pathname = decodeURIComponent(url.pathname)
    const filePath = pathname.split('/o/')[1]?.split('?')[0]

    if (!filePath) {
      throw new Error("Invalid PDF URL format")
    }

    // Create storage reference
    const storageRef = ref(storage, filePath)

    // Delete file
    console.log("🗑️ Deleting PDF from Firebase Storage:", filePath)
    await deleteObject(storageRef)
    console.log("✅ PDF deleted successfully")
  } catch (error: any) {
    console.error("❌ Error deleting PDF:", error)
    
    // Don't throw for "file not found" errors
    if (error.code === 'storage/object-not-found') {
      console.log("ℹ️ PDF file was already deleted or doesn't exist")
      return
    }
    
    throw new Error(`Failed to delete PDF: ${error.message}`)
  }
}

// Get file information from URL
export function getFileInfoFromURL(url: string): { name: string; path: string } | null {
  try {
    const urlObj = new URL(url)
    const pathname = decodeURIComponent(urlObj.pathname)
    const filePath = pathname.split('/o/')[1]?.split('?')[0]
    
    if (!filePath) {
      return null
    }

    const fileName = filePath.split('/').pop() || "unknown"
    
    return {
      name: fileName,
      path: filePath
    }
  } catch (error) {
    console.error("Error parsing file URL:", error)
    return null
  }
}

// Generate preview URL for PDF (for iframe or download)
export function generatePDFPreviewUrl(pdfUrl: string): string {
  if (!pdfUrl) return ""
  
  // For Firebase Storage URLs, they're already public and can be used directly
  return pdfUrl
}

// Download file from URL
export function downloadFile(url: string, filename?: string): void {
  try {
    const link = document.createElement('a')
    link.href = url
    link.download = filename || 'download'
    link.target = '_blank'
    
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  } catch (error) {
    console.error("Error downloading file:", error)
    // Fallback: open in new tab
    window.open(url, '_blank')
  }
}

// Check if URL is a valid Firebase Storage URL
export function isValidFirebaseStorageURL(url: string): boolean {
  try {
    const urlObj = new URL(url)
    return urlObj.hostname === 'firebasestorage.googleapis.com'
  } catch {
    return false
  }
}

// Get file extension from filename or URL
export function getFileExtension(filename: string): string {
  return filename.split('.').pop()?.toLowerCase() || ''
}

// Check if file is PDF
export function isPDFFile(filename: string): boolean {
  return getFileExtension(filename) === 'pdf'
} 