# PDF Preview Troubleshooting Guide

## Common Issues and Solutions

### Issue: "This page has been blocked by Chrome"

**Why this happens:**
- Chrome has strict security policies for cross-origin content
- PDF files from external domains (like Cloudinary) are sometimes blocked
- This is a browser security feature, not an error in the application

**Solutions:**

#### Option 1: Open in New Tab (Recommended)
1. Click the **"Open in New Tab"** button
2. The PDF will open in a new browser tab
3. This bypasses the embedding restrictions

#### Option 2: Download the PDF
1. Click the **"Download PDF"** button  
2. The file will be saved to your Downloads folder
3. Open it with your preferred PDF viewer

#### Option 3: Enable PDF Embedding (Advanced)
1. In Chrome, go to `chrome://settings/content/pdfDocuments`
2. Make sure "Download PDF files instead of automatically opening them in Chrome" is **disabled**
3. Refresh the page and try again

### Issue: PDF Preview Shows Blank/White Page

**Possible causes:**
- Slow internet connection
- Large PDF file size
- Browser compatibility issues

**Solutions:**
1. Wait a few more seconds for the PDF to load
2. Click the **"Try Again"** button if available
3. Use **"Open in New Tab"** instead
4. Check your internet connection

### Issue: PDF Preview Not Working in Safari

**Safari-specific behavior:**
- Safari has its own PDF viewing policies
- May require user interaction before displaying PDFs

**Solutions:**
1. Click anywhere in the preview area to activate Safari's PDF viewer
2. Use **"Open in New Tab"** for better compatibility
3. Download the PDF if preview continues to fail

### Issue: PDF Preview Not Working in Firefox

**Firefox notes:**
- Generally has good PDF support
- May show a download prompt instead of inline preview

**Solutions:**
1. If Firefox asks to download, choose "Open with Firefox"
2. Check Firefox PDF settings in `about:preferences#general`
3. Ensure "Portable Document Format (PDF)" is set to "Preview in Firefox"

## Browser Compatibility

| Browser | Inline Preview | New Tab | Download |
|---------|---------------|---------|----------|
| Chrome  | ⚠️ Sometimes | ✅ Yes  | ✅ Yes   |
| Firefox | ✅ Yes       | ✅ Yes  | ✅ Yes   |
| Safari  | ⚠️ Sometimes | ✅ Yes  | ✅ Yes   |
| Edge    | ✅ Yes       | ✅ Yes  | ✅ Yes   |

**Legend:**
- ✅ Fully supported
- ⚠️ May have restrictions

## For Administrators

### Cloudinary Configuration
If PDFs are consistently failing to load:

1. **Check Cloudinary Settings:**
   - Log into Cloudinary Console
   - Go to Settings → Security
   - Ensure "PDF and ZIP files delivery" is enabled

2. **Verify URL Format:**
   - URLs should follow this pattern: `https://res.cloudinary.com/[cloud-name]/raw/upload/[path]/file.pdf`
   - Check that files are uploaded with `resource_type: 'raw'`

3. **Test Direct Access:**
   - Copy the PDF URL and paste it directly in browser
   - If it shows 401 error, there's a Cloudinary configuration issue

### Application Configuration
1. **Environment Variables:**
   ```bash
   NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
   NEXT_PUBLIC_CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_secret
   ```

2. **Next.js Configuration:**
   - Ensure Cloudinary is added to `remotePatterns` in `next.config.mjs`

## Security Notes

**Why browsers block PDFs:**
- Cross-site scripting (XSS) protection
- Content Security Policy (CSP) restrictions  
- Mixed content policies (HTTP vs HTTPS)

**What we do to help:**
- Provide multiple viewing options
- Graceful fallbacks when embedding fails
- Clear error messages and solutions

## User Tips

### Best Practices
1. **Always try "Open in New Tab" first** - it's the most reliable method
2. **Keep your browser updated** for best PDF support
3. **Use Download option** if you need to save the file locally
4. **Clear browser cache** if you're seeing old versions of PDFs

### Mobile Devices
- PDF preview may work differently on mobile browsers
- Consider downloading the PDF for better mobile viewing experience
- Some mobile browsers may automatically download PDFs instead of previewing

## Still Having Issues?

If you continue to experience problems:

1. **Check your browser version** - older browsers may have limited PDF support
2. **Try a different browser** - Chrome, Firefox, Safari, or Edge
3. **Disable browser extensions** temporarily to see if they're interfering
4. **Contact support** with details about your browser and operating system 