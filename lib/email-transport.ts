'use server';

import type { Application, JobPosting } from '@/types';
import { getProjectAdmins } from './user-service';

// Import server-side dependencies
async function importServerDependencies() {
  if (typeof window !== 'undefined') {
    throw new Error('Server dependencies cannot be imported on the client side');
  }

  try {
    const [nodemailer, path, ejs] = await Promise.all([
      import('nodemailer'),
      import('path'),
      import('ejs')
    ]);

    return {
      nodemailer: nodemailer.default,
      path: path.default,
      ejs: ejs.default
    };
  } catch (error) {
    console.error('Failed to import server dependencies:', error);
    throw new Error('Failed to load email dependencies');
  }
}

// Helper function to get template content
async function getTemplateContent(templateName: string): Promise<string> {
  try {
    // Try to read template from file system
    const [pathModule, fsModule] = await Promise.all([
      import('path'),
      import('fs/promises')
    ]);

    const templatePath = pathModule.default.join(process.cwd(), 'emails', 'templates', templateName);
    return await fsModule.default.readFile(templatePath, 'utf-8');
  } catch (error) {
    console.warn(`Failed to read template file ${templateName}, using fallback`);
    
    // Fallback templates for common email types
    const fallbackTemplates: Record<string, string> = {
      'status-update.ejs': `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Application Status Update</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
    <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #2563eb;">Application Status Update</h2>
        <p>Dear <%= data.application.firstName || data.application.studentName %>,</p>
        <p>Your application for <strong><%= data.jobPosting?.title || 'the position' %></strong> has been updated.</p>
        
        <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Status: <span style="color: #059669;"><%= data.application.status.toUpperCase() %></span></h3>
            <% if (data.application.reviewNotes) { %>
                <p><strong>Notes:</strong> <%= data.application.reviewNotes %></p>
            <% } %>
        </div>
        
        <p>Thank you for your interest in our program.</p>
        <p>Best regards,<br>DevHatch Team</p>
    </div>
</body>
</html>`,
      'interview.ejs': `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Interview Scheduled</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
    <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #2563eb;">Interview Scheduled</h2>
        <p>Dear <%= data.application.firstName || data.application.studentName %>,</p>
        <p>Your interview for <strong><%= data.jobPosting?.title || 'the position' %></strong> has been scheduled.</p>
        
        <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Interview Details</h3>
            <p><strong>Date:</strong> <%= data.interviewDetails?.date %></p>
            <p><strong>Time:</strong> <%= data.interviewDetails?.time %></p>
            <p><strong>Location:</strong> <%= data.interviewDetails?.location %></p>
            <p><strong>Type:</strong> <%= data.interviewDetails?.type %></p>
            <% if (data.application.interviewNotes) { %>
                <p><strong>Notes:</strong> <%= data.application.interviewNotes %></p>
            <% } %>
        </div>
        
        <p>Please prepare accordingly and arrive on time.</p>
        <p>Best regards,<br>DevHatch Team</p>
    </div>
</body>
</html>`,
      'hired.ejs': `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Congratulations - You're Hired!</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
    <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #059669;">Congratulations! 🎉</h2>
        <p>Dear <%= data.application.firstName || data.application.studentName %>,</p>
        <p>We are pleased to inform you that your application for <strong><%= data.jobPosting?.title || 'the position' %></strong> has been approved!</p>
        
        <div style="background-color: #f0fdf4; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #059669;">
            <h3 style="margin-top: 0; color: #059669;">Welcome to the Team!</h3>
            <p>You have been selected to join our internship program. We look forward to working with you!</p>
            <% if (data.application.reviewNotes) { %>
                <p><strong>Notes:</strong> <%= data.application.reviewNotes %></p>
            <% } %>
        </div>
        
        <p>You will receive further instructions regarding your onboarding process.</p>
        <p>Best regards,<br>DevHatch Team</p>
    </div>
</body>
</html>`,
      'rejected.ejs': `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Application Update</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
    <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #dc2626;">Application Update</h2>
        <p>Dear <%= data.application.firstName || data.application.studentName %>,</p>
        <p>Thank you for your interest in <strong><%= data.jobPosting?.title || 'our program' %></strong>.</p>
        
        <div style="background-color: #fef2f2; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc2626;">
            <h3 style="margin-top: 0; color: #dc2626;">Application Status</h3>
            <p>After careful consideration, we regret to inform you that we are unable to move forward with your application at this time.</p>
            <% if (data.application.rejectionReason) { %>
                <p><strong>Reason:</strong> <%= data.application.rejectionReason %></p>
            <% } %>
        </div>
        
        <p>We encourage you to apply for future opportunities.</p>
        <p>Best regards,<br>DevHatch Team</p>
    </div>
</body>
</html>`
    };

    const fallbackTemplate = fallbackTemplates[templateName];
    if (!fallbackTemplate) {
      throw new Error(`Template ${templateName} not found and no fallback available`);
    }

    return fallbackTemplate;
  }
}

export interface EmailOptions {
  to: string;
  subject: string;
  template: string;
  data: Record<string, any>;
  cc?: string | string[];
  bcc?: string | string[];
}

export interface EmailNotificationData {
  application: Application;
  jobPosting?: JobPosting;
  adminName?: string;
  interviewDetails?: {
    date: string;
    time: string;
    location: string;
    type: string;
  };
  rejectionReason?: string;
}

// Utility functions for formatting
function formatDate(dateString: string): string {
  if (!dateString) return 'TBD';
  try {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch {
    return dateString;
  }
}

function formatTime(timeString: string): string {
  if (!timeString) return 'TBD';
  try {
    const [hours, minutes] = timeString.split(':');
    const time = new Date();
    time.setHours(parseInt(hours), parseInt(minutes));
    return time.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  } catch {
    return timeString;
  }
}

function getInterviewTypeText(type: string): string {
  switch (type) {
    case 'online': return 'Online Interview';
    case 'phone': return 'Phone Interview';
    default: return 'In-Person Interview';
  }
}

// Server-side email sending function
export async function sendEmail(options: EmailOptions): Promise<{ success: boolean; message: string }> {
  // Ensure this is only called server-side
  if (typeof window !== 'undefined') {
    return { 
      success: false, 
      message: 'Email sending is only allowed on the server' 
    };
  }

  // Enhanced environment variable validation with detailed logging
  const requiredEnvVars = [
    'SMTP_HOST', 'SMTP_PORT', 'SMTP_SERVICE', 
    'SMTP_MAIL', 'SMTP_PASSWORD'
  ];
  
  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    const errorMessage = `Missing email configuration: ${missingVars.join(', ')}. 
    Please set these environment variables in your production environment.
    Example:
    SMTP_HOST=smtp.gmail.com
    SMTP_PORT=587
    SMTP_SERVICE=gmail
    SMTP_MAIL=your_email@gmail.com
    SMTP_PASSWORD=your_app_password`;
    
    console.error('❌ Email Configuration Error:', errorMessage);
    console.error('❌ Current environment variables:', {
      SMTP_HOST: process.env.SMTP_HOST ? 'SET' : 'MISSING',
      SMTP_PORT: process.env.SMTP_PORT ? 'SET' : 'MISSING',
      SMTP_SERVICE: process.env.SMTP_SERVICE ? 'SET' : 'MISSING',
      SMTP_MAIL: process.env.SMTP_MAIL ? 'SET' : 'MISSING',
      SMTP_PASSWORD: process.env.SMTP_PASSWORD ? 'SET' : 'MISSING',
      NODE_ENV: process.env.NODE_ENV
    });
    
    return {
      success: false,
      message: errorMessage
    };
  }

  try {
    // Log configuration for debugging (without sensitive data)
    console.log('📧 Email Configuration:', {
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      service: process.env.SMTP_SERVICE,
      user: process.env.SMTP_MAIL,
      password: process.env.SMTP_PASSWORD ? 'SET' : 'MISSING',
      from: process.env.EMAIL_FROM,
      nodeEnv: process.env.NODE_ENV
    });

    // Dynamically import server-side dependencies
    const { nodemailer, path, ejs } = await importServerDependencies();

    // Create transporter with enhanced error handling
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      service: process.env.SMTP_SERVICE || 'gmail',
      auth: {
        user: process.env.SMTP_MAIL,
        pass: process.env.SMTP_PASSWORD,
      },
      // Add secure connection for Gmail
      secure: parseInt(process.env.SMTP_PORT || '587') === 465,
      // Disable SSL certificate verification in development
      tls: {
        rejectUnauthorized: process.env.NODE_ENV === 'production'
      },
      // Add connection timeout
      connectionTimeout: 60000,
      greetingTimeout: 30000,
      socketTimeout: 60000
    });

    // Verify connection before sending
    console.log('🔍 Verifying SMTP connection...');
    await transporter.verify();
    console.log('✅ SMTP connection verified successfully');

    // Get template content (with fallback)
    const templateContent = await getTemplateContent(options.template);
    console.log('📄 Template loaded successfully');

    // Render email template
    const html: string = ejs.render(templateContent, options.data);
    console.log('📝 Email template rendered successfully');

    // Prepare mail options
    const mailOptions = {
      from: process.env.EMAIL_FROM || `DevHatch OJT Portal <${process.env.SMTP_MAIL}>`,
      to: options.to,
      subject: options.subject,
      html,
      cc: options.cc,
      bcc: options.bcc
    };

    console.log('📤 Sending email to:', options.to);
    console.log('📧 Subject:', options.subject);

    // Send email
    const result = await transporter.sendMail(mailOptions);

    console.log(`✅ Email sent successfully to ${options.to}`);
    console.log('📧 Message ID:', result.messageId);
    return { success: true, message: 'Email sent successfully' };
  } catch (error) {
    console.error('❌ Email sending failed:', error);
    
    // Provide more specific error messages
    let errorMessage = 'Unknown error occurred';
    if (error instanceof Error) {
      if (error.message.includes('Invalid login')) {
        errorMessage = 'SMTP authentication failed - check your email and app password';
      } else if (error.message.includes('ECONNREFUSED')) {
        errorMessage = 'SMTP connection refused - check host and port settings';
      } else if (error.message.includes('ENOTFOUND')) {
        errorMessage = 'SMTP host not found - check SMTP_HOST setting';
      } else if (error.message.includes('timeout')) {
        errorMessage = 'SMTP connection timeout - check network and firewall settings';
      } else {
        errorMessage = error.message;
      }
    }
    
    return { 
      success: false, 
      message: errorMessage 
    };
  }
}

// Specific function for application status updates
export async function sendApplicationStatusEmail(data: EmailNotificationData): Promise<{ success: boolean; message: string }> {
  // Ensure this is only called server-side
  if (typeof window !== 'undefined') {
    return { 
      success: false, 
      message: 'Email sending is only allowed on the server' 
    };
  }

  const { application, jobPosting, adminName, interviewDetails, rejectionReason } = data;
  
  // Validate email
  const recipientEmail = application.studentEmail || application.email;
  if (!recipientEmail) {
    return { 
      success: false, 
      message: `No email address found for applicant ID: ${application.id}` 
    };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(recipientEmail)) {
    return { 
      success: false, 
      message: `Invalid email format: ${recipientEmail}` 
    };
  }

  // Determine recipient name
  const recipientName = (application.firstName && application.lastName)
    ? `${application.firstName} ${application.lastName}`.trim()
    : (application.studentName || "Applicant").trim();

  // Prepare template and data based on application status
  let templateName: string;
  let templateData: Record<string, any>;
  let subject: string;

  switch (application.status) {
    case 'for_interview':
      templateName = 'interview.ejs';
      subject = `🎉 Interview Scheduled - ${jobPosting?.title || 'Position'} at DevHatch`;
      templateData = {
        recipientName,
        jobTitle: jobPosting?.title || 'Position',
        projectName: jobPosting?.project || 'Project',
        interviewDate: formatDate(interviewDetails?.date || ''),
        interviewTime: formatTime(interviewDetails?.time || ''),
        interviewLocation: interviewDetails?.location || 'TBD',
        interviewType: getInterviewTypeText(interviewDetails?.type || 'in_person'),
        adminName: adminName || 'DevHatch Team'
      };
      break;
    case 'hired':
      templateName = 'hired.ejs';
      subject = `🎉 Congratulations! You've been selected for ${jobPosting?.title || 'the position'} at DevHatch`;
      templateData = {
        recipientName,
        jobTitle: jobPosting?.title || 'Position',
        projectName: jobPosting?.project || 'Project',
        adminName: adminName || 'DevHatch Team'
      };
      break;
    case 'rejected':
      templateName = 'rejected.ejs';
      subject = `Application Update - ${jobPosting?.title || 'Position'} at DevHatch`;
      templateData = {
        recipientName,
        jobTitle: jobPosting?.title || 'Position',
        rejectionReason: rejectionReason || 'After careful consideration, we have decided to move forward with other candidates.',
        adminName: adminName || 'DevHatch Team'
      };
      break;
    default:
      templateName = 'status-update.ejs';
      subject = `Application Status Update - ${jobPosting?.title || 'Position'} at DevHatch`;
      templateData = {
        recipientName,
        jobTitle: jobPosting?.title || 'Position',
        status: application.status.toUpperCase(),
        adminName: adminName || 'DevHatch Team'
      };
  }

  // Send email
  return sendEmail({
    to: recipientEmail,
    subject,
    template: templateName,
    data: templateData
  });
}

// Bulk email sending function
export async function sendBulkStatusEmails(applications: EmailNotificationData[]): Promise<{ success: boolean; message: string }> {
  // Ensure this is only called server-side
  if (typeof window !== 'undefined') {
    return { 
      success: false, 
      message: 'Bulk email sending is only allowed on the server' 
    };
  }

  const results = await Promise.allSettled(
    applications.map(data => sendApplicationStatusEmail(data))
  );

  const successful = results.filter(result => result.status === 'fulfilled' && (result.value as any).success).length;
  const failed = results.filter(result => result.status === 'rejected' || !(result.value as any).success).length;

  console.log(`📧 Bulk email results: ${successful} sent, ${failed} failed`);

  if (failed > 0) {
    const errors = results
      .filter(result => result.status === 'rejected')
      .map(result => (result as PromiseRejectedResult).reason);
    
    console.error('❌ Failed email notifications:', errors);
  }

  return {
    success: failed === 0,
    message: `Sent emails for ${applications.length} applications (${successful} successful, ${failed} failed)`
  };
} 

// New function for sending admin notifications
export async function sendAdminNotification(data: EmailNotificationData): Promise<{ success: boolean; message: string }> {
  // Ensure this is only called server-side
  if (typeof window !== 'undefined') {
    return { 
      success: false, 
      message: 'Email sending is only allowed on the server' 
    };
  }

  const { application, jobPosting, adminName } = data;
  
  // Primary admin email
  const primaryAdminEmail = process.env.ADMIN_NOTIFICATION_EMAIL || 'steerhub@g.batstate-u.edu.ph';

  // Fetch project admin emails
  const projectAdminEmails = jobPosting?.project 
    ? await getProjectAdmins(jobPosting.project) 
    : [];

  console.log('📧 Admin Notification Details:', {
    primaryAdminEmail,
    projectAdminEmails,
    project: jobPosting?.project,
    jobTitle: jobPosting?.title
  });

  // Prepare admin notification template
  const templateName = 'admin-notification.ejs';
  const subject = `New Application Received - ${jobPosting?.title || 'Position'} at DevHatch`;
  
  const templateData = {
    recipientName: 'DevHatch Admin',
    applicantName: (application.firstName && application.lastName)
      ? `${application.firstName} ${application.lastName}`.trim()
      : (application.studentName || "Applicant"),
    jobTitle: jobPosting?.title || 'Position',
    projectName: jobPosting?.project || 'Project',
    applicantEmail: application.email || application.studentEmail,
    studentId: application.studentId,
    course: application.course,
    year: application.year,
    submittedAt: new Date(application.appliedAt || Date.now()).toLocaleString(),
    adminName: adminName || 'DevHatch Team'
  };

  // Send email
  return sendEmail({
    to: primaryAdminEmail,
    cc: projectAdminEmails, // CC project admins
    subject,
    template: templateName,
    data: templateData
  });
} 

// Test email function for debugging
export async function testEmailConnection(): Promise<{ success: boolean; message: string; details?: any }> {
  if (typeof window !== 'undefined') {
    return { 
      success: false, 
      message: 'Email testing is only allowed on the server' 
    };
  }

  try {
    console.log('🧪 Testing email connection...');
    
    // Check environment variables
    const envVars = {
      SMTP_HOST: process.env.SMTP_HOST,
      SMTP_PORT: process.env.SMTP_PORT,
      SMTP_SERVICE: process.env.SMTP_SERVICE,
      SMTP_MAIL: process.env.SMTP_MAIL,
      SMTP_PASSWORD: process.env.SMTP_PASSWORD ? 'SET' : 'MISSING',
      EMAIL_FROM: process.env.EMAIL_FROM,
      NODE_ENV: process.env.NODE_ENV
    };

    console.log('📋 Environment Variables:', envVars);

    const missingVars = Object.entries(envVars)
      .filter(([key, value]) => key !== 'EMAIL_FROM' && key !== 'NODE_ENV' && !value)
      .map(([key]) => key);

    if (missingVars.length > 0) {
      return {
        success: false,
        message: `Missing required environment variables: ${missingVars.join(', ')}`,
        details: { missingVars, envVars }
      };
    }

    // Import dependencies
    const { nodemailer } = await importServerDependencies();

    // Create transporter
    const transporter = nodemailer.createTransport({
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
      connectionTimeout: 30000,
      greetingTimeout: 15000,
      socketTimeout: 30000
    });

    // Test connection
    console.log('🔍 Verifying SMTP connection...');
    await transporter.verify();
    console.log('✅ SMTP connection verified successfully');

    // Test sending a simple email
    const testMailOptions = {
      from: process.env.EMAIL_FROM || `DevHatch OJT Portal <${process.env.SMTP_MAIL}>`,
      to: process.env.SMTP_MAIL, // Send to yourself for testing
      subject: 'Email Test - DevHatch OJT Portal',
      html: `
        <h2>Email Test Successful!</h2>
        <p>This is a test email to verify that your email configuration is working correctly.</p>
        <p><strong>Test Details:</strong></p>
        <ul>
          <li>Host: ${process.env.SMTP_HOST}</li>
          <li>Port: ${process.env.SMTP_PORT}</li>
          <li>Service: ${process.env.SMTP_SERVICE}</li>
          <li>Environment: ${process.env.NODE_ENV}</li>
          <li>Timestamp: ${new Date().toISOString()}</li>
        </ul>
        <p>If you received this email, your email configuration is working correctly!</p>
      `
    };

    console.log('📤 Sending test email...');
    const result = await transporter.sendMail(testMailOptions);
    console.log('✅ Test email sent successfully');

    return {
      success: true,
      message: 'Email connection test successful! Check your inbox for the test email.',
      details: {
        messageId: result.messageId,
        envVars,
        timestamp: new Date().toISOString()
      }
    };

  } catch (error) {
    console.error('❌ Email connection test failed:', error);
    
    let errorMessage = 'Unknown error occurred';
    if (error instanceof Error) {
      if (error.message.includes('Invalid login')) {
        errorMessage = 'SMTP authentication failed - check your email and app password';
      } else if (error.message.includes('ECONNREFUSED')) {
        errorMessage = 'SMTP connection refused - check host and port settings';
      } else if (error.message.includes('ENOTFOUND')) {
        errorMessage = 'SMTP host not found - check SMTP_HOST setting';
      } else if (error.message.includes('timeout')) {
        errorMessage = 'SMTP connection timeout - check network and firewall settings';
      } else {
        errorMessage = error.message;
      }
    }

    return {
      success: false,
      message: errorMessage,
      details: {
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        timestamp: new Date().toISOString()
      }
    };
  }
} 