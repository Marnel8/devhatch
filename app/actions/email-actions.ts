'use server';

import { 
  sendApplicationStatusEmail, 
  sendBulkStatusEmails, 
  testEmailConnection,
  EmailNotificationData 
} from '@/lib/email-transport';

// Re-export the functions to maintain the existing import structure
export { 
  sendApplicationStatusEmail, 
  sendBulkStatusEmails 
}; 

// Test email connection function
export async function testEmailSetup() {
  return await testEmailConnection();
} 