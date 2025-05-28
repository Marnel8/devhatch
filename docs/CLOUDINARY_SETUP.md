# Cloudinary Setup Guide

This guide will help you set up Cloudinary for file uploads instead of Firebase Storage.

## Why Cloudinary?

✅ **Generous Free Tier**: 25GB storage, 25GB bandwidth/month  
✅ **No CORS Issues**: Works out of the box  
✅ **Easy Setup**: No complex security rules  
✅ **Better Performance**: Automatic optimization and CDN  
✅ **File Management**: Built-in file management dashboard  

## Setup Steps

### 1. Create Cloudinary Account

1. Go to https://cloudinary.com/
2. Sign up for a free account
3. Verify your email address

### 2. Get Your Credentials

After signing up, you'll see your **Dashboard** with:
- **Cloud Name** (e.g., `dxy123abc`)
- **API Key** (e.g., `123456789012345`)
- **API Secret** (e.g., `abcdef123456789_abc123def`)

### 3. Add Environment Variables

Add these to your `.env.local` file:

```bash
# Cloudinary Configuration
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name_here
NEXT_PUBLIC_CLOUDINARY_API_KEY=your_api_key_here
CLOUDINARY_API_SECRET=your_api_secret_here
```

**Example:**
```bash
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=dxy123abc
NEXT_PUBLIC_CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=abcdef123456789_abc123def
```

### 4. Test the Upload

1. **Restart your development server**:
   ```bash
   pnpm dev
   ```

2. **Go to the apply page**: http://localhost:3001/apply

3. **Fill out the form** and upload a PDF resume

4. **Check the console** for success messages

5. **Verify in Cloudinary Dashboard** that the file was uploaded to `/devhatch/resumes/`

## File Organization

Files will be organized in Cloudinary as:

```
devhatch/
  └── resumes/
      └── {applicationId}/
          └── {timestamp}_{filename}.pdf
```

## Cloudinary Free Tier Limits

- ✅ **25GB Storage** (thousands of resumes)
- ✅ **25GB Bandwidth/month** (plenty for downloads)
- ✅ **25,000 Images/month** (PDFs count as raw files)
- ✅ **Unlimited transformations**

## Security Features

- 🔒 **Server-side validation** (file type, size)
- 🔒 **API key protection** (secret key is server-only)
- 🔒 **Organized storage** by application ID
- 🔒 **Automatic file tagging** for easy management

## Troubleshooting

### "Upload failed" error
1. Check your environment variables are correct
2. Restart the development server
3. Check network connectivity

### "Invalid credentials" error
1. Verify your Cloud Name, API Key, and API Secret
2. Make sure there are no extra spaces
3. Check the Cloudinary dashboard for correct values

### File not appearing in Cloudinary
1. Check the browser console for error messages
2. Verify the API route is working: http://localhost:3001/api/upload
3. Check the Cloudinary Media Library

### **401 Error - PDF Preview Not Working**

If you're getting a 401 error when trying to preview PDFs, this is because Cloudinary restricts PDF delivery by default:

#### **Fix: Enable PDF Delivery in Cloudinary**

1. **Log into Cloudinary Console**: https://console.cloudinary.com/
2. **Go to Settings** (gear icon at top-right)
3. **Navigate to Security section**
4. **Find "PDF and ZIP files delivery" option**
5. **Toggle it to "Allow delivery of PDF and ZIP files"**
6. **Click Save**

#### **Alternative: Check Account Restrictions**

Some Cloudinary accounts may have additional restrictions:
- Ensure your account plan supports raw file delivery
- Check if your account has any security policies enabled
- Contact Cloudinary support if the issue persists

#### **Verify the Fix**

After enabling PDF delivery:
1. Wait 2-3 minutes for settings to propagate
2. Clear your browser cache
3. Try previewing a resume again
4. Check that the URL format is: `https://res.cloudinary.com/your-cloud/raw/upload/...`

## Benefits Over Firebase Storage

| Feature | Cloudinary | Firebase Storage |
|---------|------------|------------------|
| Setup Complexity | ⭐ Simple | ⭐⭐⭐ Complex |
| Free Tier | 25GB | 5GB |
| CORS Issues | ❌ None | ⚠️ Common |
| File Management | ✅ Built-in UI | ⭐⭐ Basic |
| Performance | ✅ Global CDN | ⭐⭐ Good |
| Authentication Required | ❌ No | ✅ Yes |

## Next Steps

1. ✅ **Set up environment variables**
2. ✅ **Test file upload**
3. ✅ **Verify files in Cloudinary dashboard**
4. 🔄 **Optional**: Set up file transformations
5. 🔄 **Optional**: Configure upload presets for better security

## File Management

In the Cloudinary dashboard, you can:
- 📁 **Browse uploaded files**
- 🔍 **Search by tags** (application ID)
- 📊 **View usage statistics**
- 🗑️ **Delete files** if needed
- 🔧 **Configure transformations**

Your resume files will be tagged with:
- `resume`
- `application`
- `{applicationId}`

This makes it easy to find and manage files for specific applications. 