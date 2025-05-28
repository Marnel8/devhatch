import { NextRequest, NextResponse } from 'next/server';
import { uploadJobAttachmentToCloudinary } from '@/lib/cloudinary';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const jobId = formData.get('jobId') as string;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (!jobId) {
      return NextResponse.json({ error: 'No job ID provided' }, { status: 400 });
    }

    // Validate file type
    if (file.type !== 'application/pdf') {
      return NextResponse.json({ error: 'Only PDF files are allowed' }, { status: 400 });
    }

    // Validate file size (10MB limit)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json({ error: 'File size must be less than 10MB' }, { status: 400 });
    }

    // Upload to Cloudinary
    const uploadUrl = await uploadJobAttachmentToCloudinary(file, jobId);

    return NextResponse.json({ 
      success: true, 
      url: uploadUrl,
      message: 'Job attachment uploaded successfully'
    });

  } catch (error: any) {
    console.error('Job attachment upload API error:', error);
    return NextResponse.json(
      { error: error.message || 'Upload failed' }, 
      { status: 500 }
    );
  }
} 