import { testEmailSetup } from '@/app/actions/email-actions';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    console.log('🧪 Starting email test...');
    
    // Test environment variables
    const envCheck = {
      SMTP_HOST: process.env.SMTP_HOST ? 'SET' : 'MISSING',
      SMTP_PORT: process.env.SMTP_PORT ? 'SET' : 'MISSING',
      SMTP_SERVICE: process.env.SMTP_SERVICE ? 'SET' : 'MISSING',
      SMTP_MAIL: process.env.SMTP_MAIL ? 'SET' : 'MISSING',
      SMTP_PASSWORD: process.env.SMTP_PASSWORD ? 'SET' : 'MISSING',
      EMAIL_FROM: process.env.EMAIL_FROM ? 'SET' : 'MISSING',
      NODE_ENV: process.env.NODE_ENV
    };

    console.log('📋 Environment Variables:', envCheck);

    // Test template rendering
    try {
      const { ejs } = await import('ejs');
      const testTemplate = `
        <h2>Test Template</h2>
        <p>Hello <%= recipientName %>,</p>
        <p>This is a test for <%= jobTitle %>.</p>
        <p>Best regards, <%= adminName %></p>
      `;
      const testData = {
        recipientName: 'Test User',
        jobTitle: 'Test Position',
        adminName: 'Test Admin'
      };
      const renderedHtml = ejs.render(testTemplate, testData);
      console.log('✅ Template rendering test passed');
    } catch (templateError) {
      console.error('❌ Template rendering test failed:', templateError);
    }

    const result = await testEmailSetup();
    
    return NextResponse.json({
      ...result,
      environment: envCheck,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Email test failed:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to test email setup',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
} 