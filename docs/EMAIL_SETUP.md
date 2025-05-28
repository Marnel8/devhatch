# Free Email Notifications Setup Guide (EmailJS)

This guide will help you set up **completely free** email notifications for the DevHatch OJT Portal using EmailJS.

## Why EmailJS?

✅ **100% Free** - 200 emails/month forever  
✅ **No Credit Card Required** - truly free tier  
✅ **Easy Setup** - works with Gmail, Outlook, Yahoo  
✅ **Client-Side** - no server configuration needed  
✅ **Reliable** - used by thousands of developers  

## Quick Setup (5 minutes)

### 1. Create EmailJS Account

1. Go to https://www.emailjs.com/
2. Click **"Sign Up"** (it's free!)
3. Verify your email address

### 2. Connect Your Email Service

1. **Go to "Email Services"** in your EmailJS dashboard
2. **Click "Add New Service"**
3. **Choose your email provider**:
   - **Gmail** (recommended)
   - Outlook
   - Yahoo
   - Or any SMTP service

4. **For Gmail**:
   - Click "Connect Account"
   - Sign in with your Gmail
   - Allow EmailJS permissions

### 3. Create Email Template

1. **Go to "Email Templates"** in dashboard
2. **Click "Create New Template"**
3. **Use this template**:

```
Subject: {{subject}}

{{message}}
```

4. **Template Variables** (add these):
   - `to_email` - Recipient email
   - `to_name` - Recipient name
   - `subject` - Email subject
   - `message` - Email content
   - `from_name` - Sender name
   - `reply_to` - Reply email

5. **Save the template** and copy the **Template ID**

### 4. Get Your Keys

1. **Service ID**: Go to "Email Services" → Copy your service ID
2. **Template ID**: Go to "Email Templates" → Copy your template ID  
3. **Public Key**: Go to "Account" → Copy your public key

### 5. Add Environment Variables

Add these to your `.env.local` file:

```bash
# EmailJS Configuration (Free Email Service)
NEXT_PUBLIC_EMAILJS_SERVICE_ID=service_xxxxxxx
NEXT_PUBLIC_EMAILJS_TEMPLATE_ID=template_xxxxxxx
NEXT_PUBLIC_EMAILJS_PUBLIC_KEY=xxxxxxxxxxxxxxx
```

**Example:**
```bash
NEXT_PUBLIC_EMAILJS_SERVICE_ID=service_abc123
NEXT_PUBLIC_EMAILJS_TEMPLATE_ID=template_def456
NEXT_PUBLIC_EMAILJS_PUBLIC_KEY=ghi789jkl012mno
```

### 6. Test Email Functionality

1. **Restart your development server**:
   ```bash
   pnpm dev
   ```

2. **Update an application status** in the admin panel

3. **Check the console** for email sending logs

4. **Check your email** - you should receive the notification!

## Email Templates

The system includes these email types:

### 🎉 **Interview Scheduled**
- Professional interview invitation
- Date, time, location details
- Preparation tips and instructions

### 🎊 **Application Approved**
- Congratulations message
- Next steps and onboarding info
- Welcome to the team message

### 📄 **Application Rejected**
- Professional and encouraging
- Constructive feedback
- Future opportunities guidance

### 📊 **Status Updates**
- General status change notifications
- Clear status explanations

## Email Features

### 📧 **Professional Content**
- University branding
- Clear, friendly messaging
- Proper formatting

### 📱 **Works Everywhere**
- All email clients supported
- Mobile-friendly
- Plain text format (universal compatibility)

### 🔧 **Customizable**
- Easy to modify templates
- Dynamic content
- Personalized messages

## Free Tier Limits

- ✅ **200 emails/month** (perfect for university portal)
- ✅ **No credit card required**
- ✅ **No expiration** - free forever
- ✅ **All features included**

## Troubleshooting

### "EmailJS not configured" message
1. **Check environment variables** are correct
2. **Restart development server**
3. **Verify .env.local** file format

### Emails not being sent
1. **Check EmailJS dashboard** for error logs
2. **Verify email service** is connected
3. **Test template** in EmailJS dashboard
4. **Check spam folder**

### Gmail authentication issues
1. **Re-connect Gmail** in EmailJS dashboard
2. **Check Gmail permissions**
3. **Try incognito mode** for setup

## Alternative Free Services

If you prefer other options:

### **Nodemailer + Gmail**
```bash
# Add to .env.local
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=your-app-password
```

### **SendGrid Free Tier**
```bash
# 100 emails/day free
SENDGRID_API_KEY=your-api-key
```

## Security Notes

### Safe Public Keys
- EmailJS public keys are **safe to expose**
- They're designed for client-side use
- No sensitive data in environment variables

### Email Content
- No sensitive student data in emails
- Professional, university-appropriate content
- GDPR/privacy compliant

## Advanced Features

### Custom Templates
You can create multiple templates for different email types:
1. Interview notifications
2. Approval messages  
3. Rejection letters
4. Status updates

### Email Analytics
- Track delivery rates in EmailJS dashboard
- Monitor email performance
- View sending history

### Bulk Sending
- Send multiple notifications
- Built-in rate limiting
- Error handling

## Next Steps

1. ✅ **Set up EmailJS account** (5 minutes)
2. ✅ **Connect your Gmail/email service**
3. ✅ **Create email template**
4. ✅ **Add environment variables**
5. ✅ **Test email functionality**

## Support

### Resources
- **EmailJS Documentation**: https://www.emailjs.com/docs/
- **EmailJS Templates**: https://www.emailjs.com/docs/examples/
- **Gmail Setup Guide**: https://www.emailjs.com/docs/examples/gmail/

### Getting Help
- EmailJS has excellent documentation
- Free support via their website
- Active community forums

The email notification system is now completely free and ready to use! 📧✨

## Sample Email Output

When an interview is scheduled, students receive:

```
Subject: 🎉 Interview Scheduled - Frontend Developer at DevHatch

Hi John Doe,

Great news! We're excited to move forward with your application for the Frontend Developer position in the TRIOE project.

📅 Interview Details:
• Date: Monday, February 15, 2024
• Time: 2:00 PM
• Location: 3rd Floor, SteerHub Building
• Type: In-Person Interview

📝 Please prepare:
• Review your application and portfolio
• Prepare questions about the role and project
• Arrive 10 minutes early
• Bring copies of your resume

If you need to reschedule, please contact us as soon as possible.

Best regards,
DevHatch Team
DevHatch OJT Portal
Batangas State University
```

Professional, clear, and informative! 🎯 