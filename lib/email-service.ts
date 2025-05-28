import emailjs from '@emailjs/browser';
import type { Application, JobPosting } from '@/types';

// EmailJS configuration - these will be public keys (safe to expose)
const EMAILJS_CONFIG = {
  serviceId: process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID || 'your_service_id',
  templateId: process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID || 'your_template_id',
  publicKey: process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY || 'your_public_key',
};

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
  private initialized: boolean = false;
  
  public static getInstance(): EmailService {
    if (!EmailService.instance) {
      EmailService.instance = new EmailService();
    }
    return EmailService.instance;
  }

  private constructor() {
    this.initializeEmailJS();
  }

  private async initializeEmailJS() {
    if (this.initialized || typeof window === 'undefined') return;

    try {
      await emailjs.init(EMAILJS_CONFIG.publicKey);
      this.initialized = true;
      console.log('✅ EmailJS initialized successfully with config:', {
        serviceId: EMAILJS_CONFIG.serviceId.substring(0, 5) + '...',
        templateId: EMAILJS_CONFIG.templateId.substring(0, 5) + '...',
        hasPublicKey: !!EMAILJS_CONFIG.publicKey
      });
    } catch (error) {
      console.error('❌ Failed to initialize EmailJS:', error);
      this.initialized = false;
    }
  }

  private getEmailContent(data: EmailNotificationData): { subject: string; message: string } {
    const { application, jobPosting, adminName, interviewDetails, rejectionReason } = data;
    const recipientName = application.firstName && application.lastName 
      ? `${application.firstName} ${application.lastName}` 
      : application.studentName;

    let subject: string;
    let message: string;

    switch (application.status) {
      case 'for_interview':
        subject = `🎉 Interview Scheduled - ${jobPosting?.title || 'Position'} at DevHatch`;
        message = `Hi ${recipientName},

Great news! We're excited to move forward with your application for the ${jobPosting?.title || 'Position'} position in the ${jobPosting?.project || 'Project'} project.

📅 Interview Details:
• Date: ${this.formatDate(interviewDetails?.date || '')}
• Time: ${this.formatTime(interviewDetails?.time || '')}
• Location: ${interviewDetails?.location || 'TBD'}
• Type: ${this.getInterviewTypeText(interviewDetails?.type || 'in_person')}

📝 Please prepare:
• Review your application and portfolio
• Prepare questions about the role and project
• ${interviewDetails?.type === 'online' ? 'Test your camera and microphone' : 
     interviewDetails?.type === 'phone' ? 'Ensure good phone signal' : 
     'Arrive 10 minutes early'}
• Bring copies of your resume

If you need to reschedule, please contact us as soon as possible.

Best regards,
${adminName || 'DevHatch Team'}
DevHatch OJT Portal
Batangas State University`;
        break;

      case 'hired':
        subject = `🎉 Congratulations! You've been selected for ${jobPosting?.title || 'the position'} at DevHatch`;
        message = `Hi ${recipientName},

We're thrilled to inform you that you have been SELECTED for the ${jobPosting?.title || 'Position'} position in the ${jobPosting?.project || 'Project'} project at DevHatch!

🎉 Welcome to the DevHatch Team!

📋 Next Steps:
1. We'll contact you within 2-3 business days with onboarding details
2. Please prepare: Valid student ID, Letter of recommendation, Medical clearance
3. You'll attend an orientation session to meet your team

💡 What to Expect:
• Hands-on experience with cutting-edge technology
• Mentorship from experienced developers
• Real-world project contributions
• Skill development and career growth

Once again, congratulations! We look forward to working with you.

Best regards,
${adminName || 'DevHatch Team'}
DevHatch OJT Portal
Batangas State University`;
        break;

      case 'rejected':
        subject = `Application Update - ${jobPosting?.title || 'Position'} at DevHatch`;
        message = `Hi ${recipientName},

Thank you for your interest in the ${jobPosting?.title || 'Position'} position at DevHatch.

${rejectionReason || 'After careful consideration, we have decided to move forward with other candidates who more closely match our current project requirements.'}

We received many qualified applications, and while your background is impressive, we've decided to proceed with candidates whose skills more closely match our current needs.

💡 Don't Give Up!
• Continue building your portfolio with personal projects
• Stay updated with the latest technologies
• Consider contributing to open-source projects
• Keep an eye on our future job postings

We encourage you to apply for future opportunities with DevHatch.

Best regards,
${adminName || 'DevHatch Team'}
DevHatch OJT Portal
Batangas State University`;
        break;

      default:
        subject = `Application Status Update - ${jobPosting?.title || 'Position'} at DevHatch`;
        message = `Hi ${recipientName},

We wanted to update you on your application for the ${jobPosting?.title || 'Position'} position at DevHatch.

Your application status has been updated to: ${application.status.toUpperCase()}.

${application.status === 'pending' ? 'Your application is currently being reviewed by our team.' :
  application.status === 'for_review' ? 'Your application has been moved to the review stage.' :
  'We will keep you updated on any further changes.'}

If you have any questions, please don't hesitate to contact us.

Best regards,
${adminName || 'DevHatch Team'}
DevHatch OJT Portal
Batangas State University`;
    }

    return { subject, message };
  }

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

  async sendApplicationStatusUpdate(data: EmailNotificationData): Promise<void> {
    try {
      // Ensure EmailJS is initialized
      if (!this.initialized) {
        await this.initializeEmailJS();
      }

      const { application } = data;
      
      // Log full EmailJS configuration for debugging
      console.log('📧 Debug - EmailJS Config:', {
        serviceId: EMAILJS_CONFIG.serviceId,
        templateId: EMAILJS_CONFIG.templateId,
        publicKey: EMAILJS_CONFIG.publicKey ? '✓ Set' : '✗ Missing'
      });

      // Get the recipient email - prioritize studentEmail as it's required in the type
      const recipientEmail = application.studentEmail || application.email;

      console.log('📧 Debug - Recipient data:', {
        studentEmail: application.studentEmail,
        email: application.email,
        finalEmail: recipientEmail
      });

      if (!recipientEmail) {
        throw new Error(`No email address found for applicant ID: ${application.id}`);
      }

      // Additional email validation and cleaning
      const cleanedEmail = recipientEmail.trim();
      
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(cleanedEmail)) {
        throw new Error(`Invalid email format: ${cleanedEmail}`);
      }

      const { subject, message } = this.getEmailContent(data);

      // Get recipient name - prioritize firstName + lastName if available
      const recipientName = (application.firstName && application.lastName)
        ? `${application.firstName} ${application.lastName}`.trim()
        : (application.studentName || "Applicant").trim();

      // Prepare email parameters
      const templateParams = {
        to_email: cleanedEmail,
        to_name: recipientName,
        subject: subject,
        message: message,
        from_name: 'DevHatch OJT Portal',
        reply_to: 'devops@g.batstate-u.edu.ph',
        // Add recipient field in multiple formats that EmailJS might expect
        recipient: cleanedEmail,
        email: cleanedEmail,
        to: cleanedEmail
      };

      // Log the FULL template parameters
      console.log('📧 Debug - Template parameters:', {
        to_email: templateParams.to_email,
        recipient: templateParams.recipient,
        email: templateParams.email,
        to: templateParams.to,
        to_name: templateParams.to_name,
        subject: templateParams.subject,
        message_preview: templateParams.message.substring(0, 100) + '...'
      });

      // Validate all required fields are present and not empty
      const requiredFields = ['to_email', 'to_name', 'subject', 'message'] as const;
      for (const field of requiredFields) {
        if (!templateParams[field] || !templateParams[field].trim()) {
          console.error(`❌ Missing required field: ${field}`);
          throw new Error(`Required email field '${field}' is empty`);
        }
      }

      // Log the exact parameters being sent to EmailJS
      console.log('📧 Debug - Sending email with:', {
        service_id: EMAILJS_CONFIG.serviceId,
        template_id: EMAILJS_CONFIG.templateId,
        template_params: templateParams
      });

      // Send email using EmailJS
      const result = await emailjs.send(
        EMAILJS_CONFIG.serviceId,
        EMAILJS_CONFIG.templateId,
        templateParams
      );

      console.log('✅ Email sent successfully:', {
        status: result.status,
        text: result.text,
        recipient: cleanedEmail,
        applicationStatus: application.status
      });

    } catch (error) {
      // Handle EmailJS specific errors
      if (error && typeof error === 'object' && 'status' in error) {
        const emailJSError = error as { status: number; text: string };
        console.error('❌ EmailJS Error:', {
          status: emailJSError.status,
          text: emailJSError.text,
          config: {
            serviceId: EMAILJS_CONFIG.serviceId,
            templateId: EMAILJS_CONFIG.templateId,
            hasPublicKey: !!EMAILJS_CONFIG.publicKey,
            initialized: this.initialized
          }
        });
        throw new Error(`EmailJS Error (${emailJSError.status}): ${emailJSError.text}`);
      }

      // Handle other errors
      console.error('❌ General Error:', error);
      throw error instanceof Error ? error : new Error('Unknown error occurred while sending email');
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