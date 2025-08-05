import type { Application, JobPosting } from '@/types';

// Mock Nodemailer for client-side compatibility
const mockNodemailer = {
  createTransport: () => ({
    sendMail: async () => {
      console.warn('Email sending is disabled in client-side environment');
      return { messageId: 'mock-message-id' };
    }
  })
};

// Dynamically import nodemailer only on the server
const getNodemailer = async () => {
  if (typeof window === 'undefined') {
    return (await import('nodemailer')).default;
  }
  return mockNodemailer;
};

export interface EmailOptions {
  email: string;
  subject: string;
  template: string;
  data: { [key: string]: any };
  attachments?: { filename: string; path: string; cid?: string }[];
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

export class ServerEmailService {
  private static instance: ServerEmailService;
  
  private constructor() {}

  public static getInstance(): ServerEmailService {
    if (!ServerEmailService.instance) {
      ServerEmailService.instance = new ServerEmailService();
    }
    return ServerEmailService.instance;
  }

  // Utility methods for formatting
  private formatDate(dateString: string): string {
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

  private formatTime(timeString: string): string {
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

  private getInterviewTypeText(type: string): string {
    switch (type) {
      case 'online': return 'Online Interview';
      case 'phone': return 'Phone Interview';
      default: return 'In-Person Interview';
    }
  }

  // Generic email sending method
  public async sendEmail(options: EmailOptions): Promise<void> {
    // Ensure this method is only called server-side
    if (typeof window !== 'undefined') {
      console.warn('Attempted to send email in client-side environment');
      return;
    }

    try {
      // Dynamically import dependencies
      const ejs = await import('ejs');
      const nodemailer = await getNodemailer();

      // Get template content with fallback
      const templateContent = await this.getTemplateContent(options.template);

      // Render email template
      const html: string = ejs.render(templateContent, options.data);

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

      // Prepare mail options
      const mailOptions = {
        from: process.env.EMAIL_FROM || `DevHatch OJT Portal <${process.env.SMTP_MAIL}>`,
        to: options.email,
        subject: options.subject,
        html,
        cc: options.cc,
        bcc: options.bcc,
        attachments: options.attachments
      };

      // Send email
      await transporter.sendMail(mailOptions);

      console.log(`✅ Email sent successfully to ${options.email}`);
    } catch (error) {
      console.error('❌ Email sending failed:', error);
      throw error;
    }
  }

  // Helper method to get template content with fallback
  private async getTemplateContent(templateName: string): Promise<string> {
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
        <p>Dear <%= recipientName %>,</p>
        <p>Your application for <strong><%= jobTitle %></strong> has been updated.</p>
        
        <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Status: <span style="color: #059669;"><%= status %></span></h3>
        </div>
        
        <p>Thank you for your interest in our program.</p>
        <p>Best regards,<br><%= adminName %></p>
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
        <p>Dear <%= recipientName %>,</p>
        <p>Your interview for <strong><%= jobTitle %></strong> has been scheduled.</p>
        
        <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Interview Details</h3>
            <p><strong>Date:</strong> <%= interviewDate %></p>
            <p><strong>Time:</strong> <%= interviewTime %></p>
            <p><strong>Location:</strong> <%= interviewLocation %></p>
            <p><strong>Type:</strong> <%= interviewType %></p>
        </div>
        
        <p>Please prepare accordingly and arrive on time.</p>
        <p>Best regards,<br><%= adminName %></p>
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
        <p>Dear <%= recipientName %>,</p>
        <p>We are pleased to inform you that your application for <strong><%= jobTitle %></strong> has been approved!</p>
        
        <div style="background-color: #f0fdf4; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #059669;">
            <h3 style="margin-top: 0; color: #059669;">Welcome to the Team!</h3>
            <p>You have been selected to join our internship program. We look forward to working with you!</p>
        </div>
        
        <p>You will receive further instructions regarding your onboarding process.</p>
        <p>Best regards,<br><%= adminName %></p>
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
        <p>Dear <%= recipientName %>,</p>
        <p>Thank you for your interest in <strong><%= jobTitle %></strong>.</p>
        
        <div style="background-color: #fef2f2; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc2626;">
            <h3 style="margin-top: 0; color: #dc2626;">Application Status</h3>
            <p>After careful consideration, we regret to inform you that we are unable to move forward with your application at this time.</p>
            <% if (rejectionReason) { %>
                <p><strong>Reason:</strong> <%= rejectionReason %></p>
            <% } %>
        </div>
        
        <p>We encourage you to apply for future opportunities.</p>
        <p>Best regards,<br><%= adminName %></p>
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

  // Specific method for application status updates
  public async sendApplicationStatusUpdate(data: EmailNotificationData): Promise<void> {
    // Ensure this method is only called server-side
    if (typeof window !== 'undefined') {
      console.warn('Attempted to send application status email in client-side environment');
      return;
    }

    const { application, jobPosting, adminName, interviewDetails, rejectionReason } = data;
    
    // Validate email
    const recipientEmail = application.studentEmail || application.email;
    if (!recipientEmail) {
      throw new Error(`No email address found for applicant ID: ${application.id}`);
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(recipientEmail)) {
      throw new Error(`Invalid email format: ${recipientEmail}`);
    }

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
          interviewDate: this.formatDate(interviewDetails?.date || ''),
          interviewTime: this.formatTime(interviewDetails?.time || ''),
          interviewLocation: interviewDetails?.location || 'TBD',
          interviewType: this.getInterviewTypeText(interviewDetails?.type || 'in_person'),
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

    // Send email using the generic sendEmail method
    await this.sendEmail({
      email: recipientEmail,
      subject,
      template: templateName,
      data: templateData
    });
  }

  // Bulk email sending method
  public async sendBulkStatusUpdates(applications: EmailNotificationData[]): Promise<void> {
    // Ensure this method is only called server-side
    if (typeof window !== 'undefined') {
      console.warn('Attempted to send bulk emails in client-side environment');
      return;
    }

    const results = await Promise.allSettled(
      applications.map(data => this.sendApplicationStatusUpdate(data))
    );

    const successful = results.filter(result => result.status === 'fulfilled').length;
    const failed = results.filter(result => result.status === 'rejected').length;

    console.log(`📧 Bulk email results: ${successful} sent, ${failed} failed`);

    if (failed > 0) {
      const errors = results
        .filter(result => result.status === 'rejected')
        .map(result => (result as PromiseRejectedResult).reason);
      
      console.error('❌ Failed email notifications:', errors);
    }
  }
}

export const serverEmailService = ServerEmailService.getInstance(); 