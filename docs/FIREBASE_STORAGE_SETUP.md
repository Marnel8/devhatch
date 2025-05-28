# Firebase Storage Setup Guide

This guide will help you configure Firebase Storage to fix CORS issues and enable file uploads for the DevHatch OJT Portal.

## Problem

You're encountering this CORS error:
```
Access to XMLHttpRequest at 'https://firebasestorage.googleapis.com/...' from origin 'http://localhost:3001' has been blocked by CORS policy
```

## Solution

### Option 1: Deploy Storage Rules via Firebase CLI (Recommended)

1. **Install Firebase CLI** (if not already installed):
   ```bash
   npm install -g firebase-tools
   ```

2. **Login to Firebase**:
   ```bash
   firebase login
   ```

3. **Initialize Firebase** (if not already done):
   ```bash
   firebase init
   ```
   Select "Storage" when prompted and choose your existing Firebase project.

4. **Deploy the storage rules**:
   ```bash
   firebase deploy --only storage
   ```

### Option 2: Manual Setup via Firebase Console

1. **Go to Firebase Console**: https://console.firebase.google.com/
2. **Select your project** (`devhatch-ca252`)
3. **Navigate to Storage** > **Rules**
4. **Replace the existing rules** with the content from `storage.rules` file:

```javascript
rules_version = '2';

service firebase.storage {
  match /b/{bucket}/o {
    // Allow anyone to read public files (like job PDFs)
    match /job-pdfs/{filename} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    // Resume uploads - allow anyone to upload resumes for applications
    match /resumes/{applicationId}/{filename} {
      allow read: if true;
      allow write: if filename.matches('.*\\.pdf$') // Only PDF files
                   && request.resource.size < 10 * 1024 * 1024; // Max 10MB
    }
    
    // Admin uploads
    match /admin/{allPaths=**} {
      allow read, write: if request.auth != null;
    }
    
    // Default - deny all other access
    match /{allPaths=**} {
      allow read, write: if false;
    }
  }
}
```

5. **Click "Publish"** to deploy the rules

## Verification

After applying the rules, test the file upload by:

1. **Go to the apply page**: http://localhost:3001/apply
2. **Fill out the form** and try uploading a PDF resume
3. **Check the browser console** for any remaining errors
4. **Verify in Firebase Console** > **Storage** that the file was uploaded to `/resumes/{applicationId}/`

## Security Notes

The current rules allow unauthenticated uploads for resumes to support the public application form. Consider these security measures:

### Current Security Features:
- ✅ Only PDF files allowed for resumes
- ✅ 10MB file size limit
- ✅ Files organized by application ID
- ✅ Admin operations require authentication

### Future Improvements:
- 🔄 Implement rate limiting for uploads
- 🔄 Add virus scanning for uploaded files
- 🔄 Implement cleanup for orphaned files
- 🔄 Add authentication for applicants

## Troubleshooting

### If you still get CORS errors:

1. **Wait a few minutes** - Firebase rules can take time to propagate
2. **Clear browser cache** and try again
3. **Check Firebase Console** > **Storage** > **Rules** to ensure rules are deployed
4. **Verify your Firebase project ID** in the error message matches your project

### If uploads fail with permission errors:

1. **Check the storage rules** are correctly deployed
2. **Verify file type** is PDF
3. **Check file size** is under 10MB
4. **Look at browser console** for specific error codes

### Common Error Codes:

- `storage/unauthorized` - Rules not allowing the operation
- `storage/invalid-format` - File type not allowed
- `storage/quota-exceeded` - Storage limit reached
- `storage/unknown` - Network connectivity issue

## File Structure

After successful uploads, your Firebase Storage will have this structure:

```
/resumes/
  /{applicationId}/
    /1234567890_John_Doe_Resume.pdf
    /1234567891_Jane_Smith_Resume.pdf
/job-pdfs/
  /job-123-details.pdf
/admin/
  /uploads/
```

## Next Steps

1. **Deploy the storage rules** using one of the methods above
2. **Test file uploads** on the apply page
3. **Monitor Firebase Console** for successful uploads
4. **Check application data** in Realtime Database includes resume URLs

## Support

If you continue experiencing issues:

1. Check the browser's Network tab for detailed error information
2. Look at Firebase Console > Storage > Usage for any quota issues
3. Verify your Firebase project configuration in `app/lib/firebase.ts` 