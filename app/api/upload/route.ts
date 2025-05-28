import { NextRequest, NextResponse } from 'next/server';
import { uploadResumeToCloudinary } from '@/lib/cloudinary';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const applicationId = formData.get('applicationId') as string;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (!applicationId) {
      return NextResponse.json({ error: 'No application ID provided' }, { status: 400 });
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
    const uploadUrl = await uploadResumeToCloudinary(file, applicationId);

    return NextResponse.json({ 
      success: true, 
      url: uploadUrl,
      message: 'File uploaded successfully'
    });

  } catch (error: any) {
    console.error('Upload API error:', error);
    return NextResponse.json(
      { error: error.message || 'Upload failed' }, 
      { status: 500 }
    );
  }
} 