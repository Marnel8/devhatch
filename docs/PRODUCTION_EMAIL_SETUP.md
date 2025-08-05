# Production Email Setup Guide

This guide helps you set up email functionality in production environments (Vercel, Netlify, Railway, etc.).

## Quick Diagnosis

### Step 1: Run Diagnostics

Visit your production URL to run comprehensive diagnostics:
```
https://your-domain.com/api/email-diagnostics
```

This will check:
- ✅ Environment variables
- ✅ Nodemailer import
- ✅ EJS import  
- ✅ Template rendering
- ✅ SMTP connection

### Step 2: Test Email Connection

Test the email functionality:
```
https://your-domain.com/api/test-email
```

## Environment Variables Setup

### Required Variables

You must set these environment variables in your production environment:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SERVICE=gmail
SMTP_MAIL=your_email@gmail.com
SMTP_PASSWORD=your_app_password
EMAIL_FROM="DevHatch OJT Portal <your_email@gmail.com>"
```

### Platform-Specific Setup

#### Vercel
```bash
# Using Vercel CLI
vercel env add SMTP_HOST
vercel env add SMTP_PORT
vercel env add SMTP_SERVICE
vercel env add SMTP_MAIL
vercel env add SMTP_PASSWORD
vercel env add EMAIL_FROM

# Or via Vercel Dashboard
# Go to Project Settings → Environment Variables
```

#### Netlify
```bash
# Using Netlify CLI
netlify env:set SMTP_HOST smtp.gmail.com
netlify env:set SMTP_PORT 587
netlify env:set SMTP_SERVICE gmail
netlify env:set SMTP_MAIL your_email@gmail.com
netlify env:set SMTP_PASSWORD your_app_password
netlify env:set EMAIL_FROM "DevHatch OJT Portal <your_email@gmail.com>"

# Or via Netlify Dashboard
# Go to Site Settings → Environment Variables
```

#### Railway
```bash
# Using Railway CLI
railway variables set SMTP_HOST=smtp.gmail.com
railway variables set SMTP_PORT=587
railway variables set SMTP_SERVICE=gmail
railway variables set SMTP_MAIL=your_email@gmail.com
railway variables set SMTP_PASSWORD=your_app_password
railway variables set EMAIL_FROM="DevHatch OJT Portal <your_email@gmail.com>"

# Or via Railway Dashboard
# Go to Project → Variables
```

#### Render
```bash
# Via Render Dashboard
# Go to Service → Environment → Environment Variables
```

## Gmail App Password Setup

### Step 1: Enable 2-Step Verification
1. Go to [Google Account settings](https://myaccount.google.com/)
2. Security → 2-Step Verification
3. Enable 2-Step Verification if not already enabled

### Step 2: Generate App Password
1. Go to [Google Account settings](https://myaccount.google.com/)
2. Security → 2-Step Verification → App passwords
3. Select "Mail" and "Other (Custom name)"
4. Enter "DevHatch OJT Portal" as the name
5. Click "Generate"
6. Copy the 16-character password (e.g., `abcd efgh ijkl mnop`)

### Step 3: Use App Password
- Use the 16-character app password in `SMTP_PASSWORD`
- **NOT** your regular Gmail password
- Remove spaces from the password

## Common Production Issues

### Issue 1: Missing Environment Variables

**Symptoms:**
- Error: "Missing email configuration"
- All tests fail in diagnostics

**Solution:**
1. Check your hosting platform's environment variable settings
2. Ensure variable names are exactly correct (case-sensitive)
3. Redeploy after setting variables

### Issue 2: Gmail Authentication Failure

**Symptoms:**
- Error: "Invalid login" or "Authentication failed"
- SMTP connection test fails

**Solution:**
1. Generate a new Gmail App Password
2. Use the 16-character app password (not regular password)
3. Remove any spaces from the password
4. Ensure 2-Step Verification is enabled

### Issue 3: Network/Firewall Issues

**Symptoms:**
- Error: "ECONNREFUSED" or "ENOTFOUND"
- Connection timeout errors

**Solution:**
1. Check if your hosting provider blocks SMTP ports
2. Try alternative ports:
   - Port 587 (TLS) - recommended
   - Port 465 (SSL) - alternative
3. Contact your hosting provider about SMTP restrictions

### Issue 4: Rate Limiting

**Symptoms:**
- Emails work occasionally but fail frequently
- Gmail quota exceeded errors

**Solution:**
1. Check Gmail sending limits (500/day for regular accounts)
2. Consider using a transactional email service

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

## Testing Checklist

### Before Deploying
- [ ] Set all SMTP environment variables
- [ ] Generate Gmail App Password
- [ ] Test email connection locally
- [ ] Verify environment variables in production

### After Deploying
- [ ] Run diagnostics: `/api/email-diagnostics`
- [ ] Test email functionality: `/api/test-email`
- [ ] Check production logs for errors
- [ ] Test actual email sending in your app

## Debugging Commands

### Check Environment Variables
```bash
# Vercel
vercel env ls

# Netlify
netlify env:list

# Railway
railway variables
```

### View Production Logs
```bash
# Vercel
vercel logs

# Netlify
netlify logs

# Railway
railway logs
```

## Emergency Fallback

If emails are critical and you need a quick fix:

1. **Use a different email service** (SendGrid, Mailgun)
2. **Implement email queuing** to retry failed emails
3. **Add fallback email providers**
4. **Use webhook notifications** as backup

## Getting Help

If you're still having issues:

1. Run the diagnostics: `/api/email-diagnostics`
2. Check the production logs for specific error messages
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