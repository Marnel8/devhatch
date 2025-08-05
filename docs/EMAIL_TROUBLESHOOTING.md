# Email Troubleshooting Guide

This guide helps you diagnose and fix email sending issues that work locally but fail in production.

## Quick Diagnosis

### 1. Check Environment Variables

First, verify that all required environment variables are set in your production environment:

```bash
# Required variables
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SERVICE=gmail
SMTP_MAIL=your_email@gmail.com
SMTP_PASSWORD=your_app_password
EMAIL_FROM="DevHatch OJT Portal <your_email@gmail.com>"
```

### 2. Test Email Connection

Use the built-in test function to diagnose issues:

```typescript
import { testEmailSetup } from '@/app/actions/email-actions';

// In your component or API route
const result = await testEmailSetup();
console.log(result);
```

Or visit: `https://your-domain.com/api/test-email`

## Common Issues and Solutions

### Issue 1: Missing Environment Variables

**Symptoms:**
- Error: "Missing email configuration: SMTP_HOST, SMTP_PASSWORD"
- Emails work locally but fail in production

**Solution:**
1. Check your production environment (Vercel, Netlify, etc.)
2. Add all required SMTP environment variables
3. Ensure variable names match exactly (case-sensitive)

**For Vercel:**
```bash
vercel env add SMTP_HOST
vercel env add SMTP_PORT
vercel env add SMTP_SERVICE
vercel env add SMTP_MAIL
vercel env add SMTP_PASSWORD
vercel env add EMAIL_FROM
```

### Issue 2: Template File Not Found

**Symptoms:**
- Error: "ENOENT: no such file or directory, open '/var/task/emails/templates/status-update.ejs'"
- Template files exist locally but not in production

**Solution:**
The code now includes fallback templates that will be used if the template files are not found in production. This should resolve the issue automatically.

If you still see template errors:
1. Check that the template files exist in `emails/templates/`
2. The fallback templates will be used automatically
3. No action needed - the system will work with built-in templates

### Issue 3: Gmail App Password Issues

**Symptoms:**
- Error: "Invalid login" or "Authentication failed"
- Works with regular password locally but fails in production

**Solution:**
1. Generate a new Gmail App Password:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate password for "Mail"
2. Use the 16-character app password (not your regular password)
3. Update `SMTP_PASSWORD` in production

### Issue 4: Network/Firewall Issues

**Symptoms:**
- Error: "ECONNREFUSED" or "ENOTFOUND"
- Connection timeout errors

**Solution:**
1. Check if your hosting provider blocks SMTP ports
2. Try alternative ports:
   - Port 587 (TLS) - recommended
   - Port 465 (SSL) - alternative
3. Contact your hosting provider if needed

### Issue 5: SSL/TLS Certificate Issues

**Symptoms:**
- Error: "CERT_HAS_EXPIRED" or SSL-related errors
- Works in development but fails in production

**Solution:**
The code already handles this with:
```typescript
tls: {
  rejectUnauthorized: process.env.NODE_ENV === 'production'
}
```

### Issue 6: Rate Limiting

**Symptoms:**
- Emails work occasionally but fail frequently
- Gmail quota exceeded errors

**Solution:**
1. Check Gmail sending limits (500/day for regular accounts)
2. Implement email queuing for high-volume sending
3. Consider using a transactional email service (SendGrid, Mailgun)

## Debugging Steps

### Step 1: Check Logs

Look for these log messages in your production console:

```
📧 Email Configuration: { host: 'smtp.gmail.com', port: '587', ... }
🔍 Verifying SMTP connection...
✅ SMTP connection verified successfully
📄 Template loaded successfully
📝 Email template rendered successfully
📤 Sending email to: user@example.com
✅ Email sent successfully to user@example.com
```

### Step 2: Test Connection

Add this to your application temporarily:

```typescript
// In any server component or API route
import { testEmailSetup } from '@/app/actions/email-actions';

export async function GET() {
  const result = await testEmailSetup();
  return Response.json(result);
}
```

Or visit: `https://your-domain.com/api/test-email`

### Step 3: Verify Environment Variables

Check if variables are accessible:

```typescript
console.log('Environment check:', {
  SMTP_HOST: process.env.SMTP_HOST ? 'SET' : 'MISSING',
  SMTP_PORT: process.env.SMTP_PORT ? 'SET' : 'MISSING',
  SMTP_MAIL: process.env.SMTP_MAIL ? 'SET' : 'MISSING',
  SMTP_PASSWORD: process.env.SMTP_PASSWORD ? 'SET' : 'MISSING',
  NODE_ENV: process.env.NODE_ENV
});
```

## Production Deployment Checklist

### Before Deploying:

1. ✅ Set all SMTP environment variables
2. ✅ Generate Gmail App Password
3. ✅ Test email connection locally
4. ✅ Verify environment variables in production
5. ✅ Test email sending in production

### After Deploying:

1. ✅ Check production logs for email errors
2. ✅ Test email functionality
3. ✅ Monitor for rate limiting
4. ✅ Set up error monitoring

## Alternative Email Services

If Gmail continues to cause issues, consider these alternatives:

### SendGrid
```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_SERVICE=sendgrid
SMTP_MAIL=apikey
SMTP_PASSWORD=your_sendgrid_api_key
```

### Mailgun
```env
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_SERVICE=mailgun
SMTP_MAIL=your_mailgun_username
SMTP_PASSWORD=your_mailgun_password
```

### AWS SES
```env
SMTP_HOST=email-smtp.us-east-1.amazonaws.com
SMTP_PORT=587
SMTP_SERVICE=ses
SMTP_MAIL=your_ses_access_key
SMTP_PASSWORD=your_ses_secret_key
```

## Emergency Fallback

If emails are critical and you need a quick fix:

1. **Use a different email service** (SendGrid, Mailgun)
2. **Implement email queuing** to retry failed emails
3. **Add fallback email providers**
4. **Use webhook notifications** as backup

## Getting Help

If you're still having issues:

1. Check the production logs for specific error messages
2. Test with the `testEmailSetup()` function
3. Verify all environment variables are set correctly
4. Try a different email service provider
5. Contact your hosting provider about SMTP restrictions

## Common Error Messages

| Error | Cause | Solution |
|-------|-------|----------|
| "Invalid login" | Wrong password or app password | Generate new Gmail app password |
| "ECONNREFUSED" | Network/firewall blocking | Check hosting provider settings |
| "ENOTFOUND" | Wrong SMTP host | Verify SMTP_HOST setting |
| "timeout" | Network issues | Increase timeout settings |
| "Missing email configuration" | Environment variables not set | Add all required SMTP variables |
| "ENOENT: no such file or directory" | Template files missing | Use fallback templates (automatic) | 