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
      const path = await import('path');
      const ejs = await import('ejs');
      const nodemailer = await getNodemailer();

      // Resolve template path 
      const templatePath = path.join(process.cwd(), 'emails', 'templates', options.template);

      // Render email template
      const html: string = await ejs.renderFile(templatePath, options.data);

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