# Email Notifications Setup Guide

This guide will help you set up email notifications for the DevHatch OJT Portal using Resend.

## Why Resend?

✅ **Developer-friendly**: Simple API and great documentation  
✅ **Generous Free Tier**: 3,000 emails/month, 100 emails/day  
✅ **High Deliverability**: Built-in reputation management  
✅ **React Email Support**: Perfect integration with our email templates  
✅ **Easy Setup**: No complex configuration required  

## Setup Steps

### 1. Create Resend Account

1. Go to https://resend.com/
2. Sign up for a free account
3. Verify your email address

### 2. Get Your API Key

1. **Go to API Keys section** in your Resend dashboard
2. **Click "Create API Key"**
3. **Name your key** (e.g., "DevHatch OJT Portal")
4. **Copy the API key** (starts with `re_`)

### 3. Add Environment Variable

Add this to your `.env.local` file:

```bash
# Email Service Configuration (Resend)
RESEND_API_KEY=re_your_actual_api_key_here
```

**Example:**
```bash
RESEND_API_KEY=re_123abc456def789ghi012jkl345mno678pqr
```

### 4. Verify Domain (Optional - for Production)

For production use, you should verify your domain:

1. **Go to Domains section** in Resend dashboard
2. **Add your domain** (e.g., `devhatch.batstate-u.edu.ph`)
3. **Follow DNS setup instructions**
4. **Wait for verification** (usually takes a few minutes)

For development, you can use the default sandbox domain.

### 5. Test Email Functionality

1. **Restart your development server**:
   ```bash
   pnpm dev
   ```

2. **Update an application status** in the admin panel

3. **Check the console** for email sending logs

4. **Check your email** (if using a verified domain) or Resend dashboard logs

## Email Templates

The system includes these email templates:

### 📧 **Interview Scheduled**
- Sent when an interview is scheduled
- Includes date, time, location, and interview type
- Provides preparation tips

### 🎉 **Application Approved**
- Sent when an applicant is hired
- Includes next steps and onboarding information
- Welcome message and expectations

### 📄 **Application Rejected**
- Sent when an application is rejected
- Professional and encouraging message
- Provides feedback and future guidance

### 📊 **Status Update**
- Sent for other status changes (pending, for_review)
- General update message

## Email Features

### 🎨 **Professional Design**
- DevHatch branding
- Responsive layout
- Clean typography
- University colors

### 📱 **Mobile Friendly**
- Works on all devices
- Optimized for mobile email clients
- Responsive design

### 🔧 **Customizable**
- Admin name in emails
- Dynamic content based on job posting
- Personalized messages

## Configuration Options

### Environment Variables
```bash
# Required
RESEND_API_KEY=your_api_key

# Optional - for custom domain
RESEND_DOMAIN=your-domain.com
```

### Email Settings in Application

```typescript
// Enable/disable notifications per action
const emailSettings = {
  sendOnStatusUpdate: true,
  sendOnInterview: true,
  sendOnApproval: true,
  sendOnRejection: true
}
```

## Testing

### Development Mode
Without `RESEND_API_KEY`:
- Emails are logged to console
- No actual emails sent
- Template rendering is tested

With `RESEND_API_KEY`:
- Emails are sent to real addresses
- Check Resend dashboard for delivery logs

### Production Mode
- Always requires valid `RESEND_API_KEY`
- Uses verified domain for better deliverability
- Proper error handling and logging

## Troubleshooting

### "Email notification failed" error
1. **Check your API key** is correct
2. **Verify environment variable** name and format
3. **Restart the development server**
4. **Check Resend dashboard** for error logs

### Emails not being received
1. **Check spam/junk folder**
2. **Verify recipient email** address is correct
3. **Check Resend dashboard** delivery status
4. **For production**: Ensure domain is verified

### Template rendering errors
1. **Check console** for specific error messages
2. **Verify email template** syntax
3. **Check application data** is complete

## Resend Free Tier Limits

- ✅ **3,000 emails/month** (plenty for a university portal)
- ✅ **100 emails/day** (sufficient for daily operations)
- ✅ **No credit card required** for free tier
- ✅ **All features included** (templates, tracking, etc.)

## Email Content Guidelines

### Best Practices
- **Clear subject lines** with action required
- **Personalized greetings** with student names
- **Professional but friendly** tone
- **Clear next steps** and contact information
- **Consistent branding** with university identity

### Content Included
- **Student name** and application details
- **Job position** and project information
- **Status change** explanation
- **Next steps** or required actions
- **Contact information** for questions
- **University branding** and signature

## Security & Privacy

### Data Protection
- **No sensitive data** in email content
- **Secure transmission** via HTTPS
- **Resend compliance** with data protection laws
- **Opt-out handling** (if required)

### API Security
- **Server-side only** API key usage
- **Environment variable** protection
- **Error handling** without exposing secrets

## Advanced Features

### Email Analytics
- Track delivery rates in Resend dashboard
- Monitor open rates (if enabled)
- View bounce and complaint rates

### Batch Sending
- Send multiple notifications efficiently
- Built-in rate limiting
- Error handling for failed sends

### Custom Templates
- Easy to modify existing templates
- Add new email types as needed
- React-based template system

## Next Steps

1. ✅ **Set up Resend account and API key**
2. ✅ **Test email functionality in development**
3. 🔄 **Optional**: Verify domain for production
4. 🔄 **Optional**: Customize email templates
5. 🔄 **Optional**: Set up email analytics

## Support

### Resources
- **Resend Documentation**: https://resend.com/docs
- **React Email Docs**: https://react.email/docs
- **Resend Status Page**: https://status.resend.com/

### Getting Help
- Check Resend dashboard logs for detailed error information
- Contact Resend support for API-related issues
- Review application logs for integration issues

The email notification system is now ready to keep applicants informed about their application status automatically! 📧✨ 