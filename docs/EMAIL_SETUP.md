# Email Configuration for Nodemailer (Server-Side)

## Environment Variables

Create a `.env` file in the project root with the following configuration:

```env
# SMTP Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SERVICE=gmail
SMTP_MAIL=your_email@gmail.com
SMTP_PASSWORD=your_app_password
EMAIL_FROM="DevHatch OJT Portal <your_email@gmail.com>"
```

### Configuration Details

- `SMTP_HOST`: SMTP server (default is Gmail)
- `SMTP_PORT`: SMTP port (default is 587 for TLS)
- `SMTP_SERVICE`: Email service provider (e.g., 'gmail')
- `SMTP_MAIL`: Your email address
- `SMTP_PASSWORD`: App password for your email account
- `EMAIL_FROM`: Optional custom sender name and email

## Gmail App Password Setup

1. Enable 2-Step Verification for your Google Account
2. Go to App Passwords in your Google Account
3. Select "Mail" and "Other (Custom name)"
4. Generate and use the app password in `SMTP_PASSWORD`

## Sending Emails in Next.js

### Server Actions

Use the server actions in `app/actions/email-actions.ts` to send emails:

```typescript
import { sendApplicationStatusEmail, sendBulkStatusEmails } from '@/app/actions/email-actions';

// Send a single email
const result = await sendApplicationStatusEmail({
  application: applicationData,
  jobPosting: jobPostingData,
  adminName: 'John Doe'
});

// Send bulk emails
const bulkResult = await sendBulkStatusEmails([
  { application: app1, jobPosting: job1 },
  { application: app2, jobPosting: job2 }
]);
```

### Email Types

- Interview Invitation
- Hired Notification
- Rejected Application
- Generic Status Update

## Troubleshooting

- Ensure all SMTP environment variables are set
- Check firewall and network settings
- Verify app password is correctly generated
- Emails are sent only from server-side code

### Common Issues

- **Authentication Failure**: Double-check your app password
- **Port Issues**: 
  - Port 587 for TLS 
  - Port 465 for SSL
- **Service-Specific Settings**: Some providers may require specific configurations

## Security Notes

- Never commit `.env` file to version control
- Use environment-specific configurations
- Rotate app passwords periodically
- Emails are sent only through server actions
- Sensitive data is not exposed in email templates 

## Project Admin Notifications

### Configuring Admin Email Notifications

You can configure admin email notifications using the following environment variables:

```env
# Primary admin email (main recipient)
ADMIN_NOTIFICATION_EMAIL=steerhub@g.batstate-u.edu.ph

# Project admin emails (comma-separated list)
PROJECT_ADMIN_EMAILS=project1admin@example.com,project2admin@example.com,project3admin@example.com
```

#### Configuration Details
- `ADMIN_NOTIFICATION_EMAIL`: The primary email address that will receive all admin notifications
- `PROJECT_ADMIN_EMAILS`: A comma-separated list of additional email addresses to CC on admin notifications

### Example
```env
# For multiple project admins
PROJECT_ADMIN_EMAILS=trioe_admin@example.com,mrmed_admin@example.com,haptics_admin@example.com
```

### Notes
- Emails are trimmed to remove any accidental whitespace
- If no project admin emails are provided, only the primary admin email will receive notifications
- Ensure all email addresses are valid and accessible 