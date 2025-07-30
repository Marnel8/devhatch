'use server';

import type { Application, JobPosting } from '@/types';
import { getProjectAdmins } from './user-service';

// Dynamically import server-side dependencies
const importServerDependencies = async () => {
  const nodemailer = await import('nodemailer');
  const path = await import('path');
  const ejs = await import('ejs');
  
  return { nodemailer, path, ejs };
};

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

  // Validate required environment variables with more flexibility
  const requiredEnvVars = [
    'SMTP_HOST', 'SMTP_PORT', 'SMTP_SERVICE', 
    'SMTP_MAIL', 'SMTP_PASSWORD'
  ];
  
  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    const errorMessage = `Missing email configuration: ${missingVars.join(', ')}. 
    Please set these environment variables in your .env file.
    Example:
    SMTP_HOST=smtp.gmail.com
    SMTP_PORT=587
    SMTP_SERVICE=gmail
    SMTP_MAIL=your_email@gmail.com
    SMTP_PASSWORD=your_app_password`;
    
    console.warn(errorMessage);
    
    return {
      success: false,
      message: errorMessage
    };
  }

  try {
    // Dynamically import server-side dependencies
    const { nodemailer, path, ejs } = await importServerDependencies();

    // Create transporter
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
      }
    });

    // Resolve template path 
    const templatePath = path.join(process.cwd(), 'emails', 'templates', options.template);

    // Render email template
    const html: string = await ejs.renderFile(templatePath, options.data);

    // Prepare mail options
    const mailOptions = {
      from: process.env.EMAIL_FROM || `DevHatch OJT Portal <${process.env.SMTP_MAIL}>`,
      to: options.to,
      subject: options.subject,
      html,
      cc: options.cc,
      bcc: options.bcc
    };

    // Send email
    await transporter.sendMail(mailOptions);

    console.log(`✅ Email sent successfully to ${options.to}`);
    return { success: true, message: 'Email sent successfully' };
  } catch (error) {
    console.error('❌ Email sending failed:', error);
    return { 
      success: false, 
      message: error instanceof Error ? error.message : 'Unknown error occurred' 
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