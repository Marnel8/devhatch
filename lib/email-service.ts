import { Resend } from 'resend';
import { render } from '@react-email/render';
import { 
  ApplicationStatusUpdateEmail,
  InterviewScheduledEmail,
  ApplicationRejectedEmail,
  ApplicationApprovedEmail 
} from '@/emails';
import type { Application, JobPosting } from '@/types';

// Only initialize Resend when we have an API key and we're on the server
let resend: Resend | null = null;

function getResendInstance(): Resend | null {
  if (typeof window !== 'undefined') {
    // We're on the client side, don't initialize Resend
    return null;
  }
  
  if (!resend && process.env.RESEND_API_KEY) {
    resend = new Resend(process.env.RESEND_API_KEY);
  }
  
  return resend;
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

export class EmailService {
  private static instance: EmailService;
  
  public static getInstance(): EmailService {
    if (!EmailService.instance) {
      EmailService.instance = new EmailService();
    }
    return EmailService.instance;
  }

  private constructor() {
    // Only warn about missing API key on the server side
    if (typeof window === 'undefined' && !process.env.RESEND_API_KEY) {
      console.warn('⚠️ RESEND_API_KEY not found. Email notifications will be logged but not sent.');
    }
  }

  async sendApplicationStatusUpdate(data: EmailNotificationData): Promise<void> {
    try {
      const { application, jobPosting, adminName } = data;
      const recipientEmail = application.email || application.studentEmail;
      const recipientName = application.firstName && application.lastName 
        ? `${application.firstName} ${application.lastName}` 
        : application.studentName;

      if (!recipientEmail) {
        throw new Error('No email address found for applicant');
      }

      // Choose the appropriate email template based on status
      let emailHtml: string;
      let subject: string;

      switch (application.status) {
        case 'for_interview':
          emailHtml = await render(InterviewScheduledEmail({
            applicantName: recipientName || 'Student',
            jobTitle: jobPosting?.title || 'Position',
            jobProject: jobPosting?.project || 'Project',
            interviewDate: data.interviewDetails?.date || '',
            interviewTime: data.interviewDetails?.time || '',
            interviewLocation: data.interviewDetails?.location || '',
            interviewType: data.interviewDetails?.type || 'in_person',
            adminName: adminName || 'DevHatch Team'
          }));
          subject = `Interview Scheduled - ${jobPosting?.title || 'Position'} at DevHatch`;
          break;

        case 'hired':
          emailHtml = await render(ApplicationApprovedEmail({
            applicantName: recipientName || 'Student',
            jobTitle: jobPosting?.title || 'Position',
            jobProject: jobPosting?.project || 'Project',
            adminName: adminName || 'DevHatch Team'
          }));
          subject = `Congratulations! You've been selected for ${jobPosting?.title || 'the position'} at DevHatch`;
          break;

        case 'rejected':
          emailHtml = await render(ApplicationRejectedEmail({
            applicantName: recipientName || 'Student',
            jobTitle: jobPosting?.title || 'Position',
            rejectionReason: data.rejectionReason || 'After careful consideration, we have decided to move forward with other candidates.',
            adminName: adminName || 'DevHatch Team'
          }));
          subject = `Application Update - ${jobPosting?.title || 'Position'} at DevHatch`;
          break;

        default:
          emailHtml = await render(ApplicationStatusUpdateEmail({
            applicantName: recipientName || 'Student',
            jobTitle: jobPosting?.title || 'Position',
            status: application.status,
            adminName: adminName || 'DevHatch Team'
          }));
          subject = `Application Status Update - ${jobPosting?.title || 'Position'} at DevHatch`;
      }

      // Get Resend instance
      const resendInstance = getResendInstance();

      // Send email if API key is configured and we're on the server
      if (resendInstance) {
        const emailResult = await resendInstance.emails.send({
          from: 'DevHatch OJT Portal <noreply@devhatch.batstate-u.edu.ph>',
          to: [recipientEmail],
          subject,
          html: emailHtml,
          headers: {
            'X-Entity-Ref-ID': application.id,
          },
        });

        console.log('✅ Email sent successfully:', {
          emailId: emailResult.data?.id,
          recipient: recipientEmail,
          status: application.status
        });
      } else {
        // Log email for development/testing
        console.log('📧 Email would be sent (RESEND_API_KEY not configured or client-side):', {
          to: recipientEmail,
          subject,
          status: application.status,
          htmlLength: emailHtml.length
        });
      }

    } catch (error) {
      console.error('❌ Failed to send email notification:', error);
      throw new Error(`Email notification failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async sendBulkStatusUpdates(applications: EmailNotificationData[]): Promise<void> {
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

// Export singleton instance
export const emailService = EmailService.getInstance(); 