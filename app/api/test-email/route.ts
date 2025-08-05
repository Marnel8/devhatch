import { testEmailSetup } from '@/app/actions/email-actions';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const result = await testEmailSetup();
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to test email setup',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 