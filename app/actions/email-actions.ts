'use server';

import { 
  sendApplicationStatusEmail, 
  sendBulkStatusEmails, 
  EmailNotificationData 
} from '@/lib/email-transport';

// Re-export the functions to maintain the existing import structure
export { 
  sendApplicationStatusEmail, 
  sendBulkStatusEmails 
}; 