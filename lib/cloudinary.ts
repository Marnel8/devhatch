import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true, // Force HTTPS
});

// Upload resume to Cloudinary
export async function uploadResumeToCloudinary(file: File, applicationId: string): Promise<string> {
  try {
    // Convert file to base64
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64 = buffer.toString('base64');
    const dataURI = `data:${file.type};base64,${base64}`;

    // Upload to Cloudinary with enhanced settings for PDF delivery
    const result = await cloudinary.uploader.upload(dataURI, {
      folder: `devhatch/resumes/${applicationId}`,
      resource_type: 'raw', // For PDF files
      public_id: `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`,
      format: 'pdf',
      tags: ['resume', 'application', applicationId],
      type: 'upload', // Ensure it's uploaded as public
      access_mode: 'public', // Make sure it's publicly accessible
      invalidate: true, // Invalidate CDN cache
      // Additional settings for better PDF delivery
      overwrite: false,
      unique_filename: true,
      use_filename: true,
    });

    console.log('✅ Resume uploaded to Cloudinary:', result.secure_url);
    return result.secure_url;
  } catch (error: any) {
    console.error('❌ Error uploading to Cloudinary:', error);
    throw new Error(`Upload failed: ${error.message || 'Unknown error'}`);
  }
}

// Upload job attachment to Cloudinary
export async function uploadJobAttachmentToCloudinary(file: File, jobId: string): Promise<string> {
  try {
    // Convert file to base64
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64 = buffer.toString('base64');
    const dataURI = `data:${file.type};base64,${base64}`;

    // Upload to Cloudinary with enhanced settings for PDF delivery
    const result = await cloudinary.uploader.upload(dataURI, {
      folder: `devhatch/job-attachments/${jobId}`,
      resource_type: 'raw', // For PDF files
      public_id: `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`,
      format: 'pdf',
      tags: ['job-attachment', 'job-posting', jobId],
      type: 'upload', // Ensure it's uploaded as public
      access_mode: 'public', // Make sure it's publicly accessible
      invalidate: true, // Invalidate CDN cache
      // Additional settings for better PDF delivery
      overwrite: false,
      unique_filename: true,
      use_filename: true,
    });

    console.log('✅ Job attachment uploaded to Cloudinary:', result.secure_url);
    return result.secure_url;
  } catch (error: any) {
    console.error('❌ Error uploading job attachment to Cloudinary:', error);
    throw new Error(`Upload failed: ${error.message || 'Unknown error'}`);
  }
}

// Delete resume from Cloudinary (for cleanup)
export async function deleteResumeFromCloudinary(publicId: string): Promise<void> {
  try {
    await cloudinary.uploader.destroy(publicId, { resource_type: 'raw' });
    console.log('✅ Resume deleted from Cloudinary');
  } catch (error: any) {
    console.error('❌ Error deleting from Cloudinary:', error);
    throw new Error(`Delete failed: ${error.message}`);
  }
}

// Delete job attachment from Cloudinary (for cleanup)
export async function deleteJobAttachmentFromCloudinary(publicId: string): Promise<void> {
  try {
    await cloudinary.uploader.destroy(publicId, { resource_type: 'raw' });
    console.log('✅ Job attachment deleted from Cloudinary');
  } catch (error: any) {
    console.error('❌ Error deleting job attachment from Cloudinary:', error);
    throw new Error(`Delete failed: ${error.message}`);
  }
}

export default cloudinary; 