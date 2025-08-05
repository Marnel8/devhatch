import { NextResponse } from 'next/server';

export async function GET() {
  const diagnostics = {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    nodeVersion: process.version,
    platform: process.platform,
    
    // Environment Variables Check
    environmentVariables: {
      SMTP_HOST: process.env.SMTP_HOST ? 'SET' : 'MISSING',
      SMTP_PORT: process.env.SMTP_PORT ? 'SET' : 'MISSING',
      SMTP_SERVICE: process.env.SMTP_SERVICE ? 'SET' : 'MISSING',
      SMTP_MAIL: process.env.SMTP_MAIL ? 'SET' : 'MISSING',
      SMTP_PASSWORD: process.env.SMTP_PASSWORD ? 'SET' : 'MISSING',
      EMAIL_FROM: process.env.EMAIL_FROM ? 'SET' : 'MISSING',
      NODE_ENV: process.env.NODE_ENV || 'NOT_SET'
    },

    // SMTP Configuration
    smtpConfig: {
      host: process.env.SMTP_HOST || 'NOT_SET',
      port: process.env.SMTP_PORT || 'NOT_SET',
      service: process.env.SMTP_SERVICE || 'NOT_SET',
      user: process.env.SMTP_MAIL || 'NOT_SET',
      password: process.env.SMTP_PASSWORD ? 'SET' : 'MISSING',
      from: process.env.EMAIL_FROM || 'NOT_SET'
    },

    // Test Results
    tests: {
      environmentVariables: false,
      nodemailerImport: false,
      ejsImport: false,
      templateRendering: false,
      smtpConnection: false
    },

    errors: [] as string[]
  };

  try {
    // Test 1: Environment Variables
    const requiredVars = ['SMTP_HOST', 'SMTP_PORT', 'SMTP_SERVICE', 'SMTP_MAIL', 'SMTP_PASSWORD'];
    const missingVars = requiredVars.filter(varName => !process.env[varName]);
    
    if (missingVars.length === 0) {
      diagnostics.tests.environmentVariables = true;
    } else {
      diagnostics.errors.push(`Missing environment variables: ${missingVars.join(', ')}`);
    }

    // Test 2: Nodemailer Import
    try {
      const nodemailer = await import('nodemailer');
      diagnostics.tests.nodemailerImport = true;
    } catch (error) {
      diagnostics.errors.push(`Nodemailer import failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    // Test 3: EJS Import
    try {
      const ejs = await import('ejs');
      diagnostics.tests.ejsImport = true;
    } catch (error) {
      diagnostics.errors.push(`EJS import failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    // Test 4: Template Rendering
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
      diagnostics.tests.templateRendering = true;
    } catch (error) {
      diagnostics.errors.push(`Template rendering failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    // Test 5: SMTP Connection (if environment variables are set)
    if (diagnostics.tests.environmentVariables && diagnostics.tests.nodemailerImport) {
      try {
        const nodemailer = await import('nodemailer');
        
        const transporter = nodemailer.default.createTransport({
          host: process.env.SMTP_HOST,
          port: parseInt(process.env.SMTP_PORT || '587'),
          service: process.env.SMTP_SERVICE,
          auth: {
            user: process.env.SMTP_MAIL,
            pass: process.env.SMTP_PASSWORD,
          },
          secure: parseInt(process.env.SMTP_PORT || '587') === 465,
          tls: {
            rejectUnauthorized: process.env.NODE_ENV === 'production'
          },
          connectionTimeout: 10000,
          greetingTimeout: 5000,
          socketTimeout: 10000
        });

        await transporter.verify();
        diagnostics.tests.smtpConnection = true;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        diagnostics.errors.push(`SMTP connection failed: ${errorMessage}`);
        
        // Provide specific guidance based on error type
        if (errorMessage.includes('Invalid login')) {
          diagnostics.errors.push('→ This usually means incorrect email/password or missing Gmail App Password');
        } else if (errorMessage.includes('ECONNREFUSED')) {
          diagnostics.errors.push('→ This usually means network/firewall blocking or incorrect host/port');
        } else if (errorMessage.includes('ENOTFOUND')) {
          diagnostics.errors.push('→ This usually means incorrect SMTP_HOST setting');
        } else if (errorMessage.includes('timeout')) {
          diagnostics.errors.push('→ This usually means network issues or hosting provider blocking SMTP');
        }
      }
    }

    // Summary
    const passedTests = Object.values(diagnostics.tests).filter(Boolean).length;
    const totalTests = Object.keys(diagnostics.tests).length;
    
    return NextResponse.json({
      ...diagnostics,
      summary: {
        passedTests,
        totalTests,
        success: passedTests === totalTests,
        successRate: `${passedTests}/${totalTests}`
      }
    });

  } catch (error) {
    return NextResponse.json({
      ...diagnostics,
      error: error instanceof Error ? error.message : 'Unknown error',
      summary: {
        passedTests: 0,
        totalTests: 5,
        success: false,
        successRate: '0/5'
      }
    }, { status: 500 });
  }
} 