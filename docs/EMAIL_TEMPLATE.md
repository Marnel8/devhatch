# EmailJS Template Setup Guide

## Template Configuration

1. Go to EmailJS Dashboard → **Email Templates** → **Create New Template**
2. Name it `devhatch_application_template`
3. Copy and paste this HTML template:

```html
<!DOCTYPE html>
<html>
<head>
  <style>
    /* Email styles */
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #374151;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      background-color: #059669;
      color: white;
      text-align: center;
      padding: 20px;
      margin-bottom: 20px;
    }
    .header h1 {
      margin: 0;
      font-size: 24px;
    }
    .header p {
      margin: 5px 0 0;
      font-size: 14px;
      opacity: 0.8;
    }
    .content {
      padding: 20px;
      background: #ffffff;
    }
    .details-box {
      background-color: #f3f4f6;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      padding: 15px;
      margin: 20px 0;
    }
    .footer {
      text-align: left;
      color: #6b7280;
      font-size: 14px;
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid #e5e7eb;
    }
    .emoji {
      font-size: 18px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>DevHatch OJT Portal</h1>
      <p>Batangas State University</p>
    </div>
    
    <div class="content">
      <h2>{{subject}}</h2>
      
      <div style="white-space: pre-wrap;">{{message}}</div>
      
      <div class="footer">
        <p>
          Best regards,<br>
          {{from_name}}<br>
          DevHatch OJT Portal<br>
          Batangas State University<br><br>
          📧 {{reply_to}}
        </p>
      </div>
    </div>
  </div>
</body>
</html>
```

## Template Variables

Add these variables in the EmailJS template settings:

| Variable | Description | Example |
|----------|-------------|---------|
| `to_email` | Recipient's email | student@g.batstate-u.edu.ph |
| `to_name` | Recipient's name | John Doe |
| `subject` | Email subject | Interview Scheduled - Frontend Developer |
| `message` | Main email content | Great news! Your interview is scheduled... |
| `from_name` | Sender's name | DevHatch Team |
| `reply_to` | Reply-to email | devops@g.batstate-u.edu.ph |

## Email Preview

Here's how the emails will look:

### 1. Interview Scheduled
```
🎉 Interview Scheduled - Frontend Developer at DevHatch

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
```

### 2. Application Approved
```
🎊 Congratulations! You've been selected!

Hi John Doe,

We're thrilled to inform you that you have been SELECTED for the Frontend Developer position in the TRIOE project at DevHatch!

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
```

### 3. Application Rejected
```
Application Update - Frontend Developer at DevHatch

Hi John Doe,

Thank you for your interest in the Frontend Developer position at DevHatch.

After careful consideration, we have decided to move forward with other candidates who more closely match our current project requirements.

💡 Don't Give Up!
• Continue building your portfolio with personal projects
• Stay updated with the latest technologies
• Consider contributing to open-source projects
• Keep an eye on our future job postings

We encourage you to apply for future opportunities with DevHatch.
```

## Testing the Template

1. In EmailJS dashboard, click **"Test"**
2. Fill in test data:
   ```json
   {
     "to_email": "your.email@example.com",
     "to_name": "Your Name",
     "subject": "🎉 Test Email",
     "message": "This is a test email to verify the template formatting.\n\n📝 Testing Features:\n• Emoji support\n• Line breaks\n• Bullet points",
     "from_name": "DevHatch Team",
     "reply_to": "devops@g.batstate-u.edu.ph"
   }
   ```
3. Click **"Send Test Email"**

## Features

- ✨ **Professional Design**: Clean, readable layout
- 📱 **Mobile Responsive**: Looks good on all devices
- 🎨 **University Branding**: DevHatch colors and style
- 📝 **Rich Text**: Supports emojis, lists, and formatting
- 🔒 **Spam-Safe**: Follows email best practices

## Troubleshooting

### Common Issues

1. **Emojis not showing**
   - Make sure to use UTF-8 encoding
   - Test in different email clients

2. **Formatting broken**
   - Check for proper line breaks (`\n`)
   - Verify HTML is valid

3. **Styles not applying**
   - Some email clients strip CSS
   - Use inline styles for critical formatting

### Testing Tips

- Send test emails to different email providers (Gmail, Outlook, etc.)
- Check mobile and desktop views
- Verify all variables are replaced correctly

## Best Practices

1. **Keep it Simple**
   - Use basic HTML elements
   - Avoid complex CSS
   - Test across email clients

2. **Content Guidelines**
   - Clear subject lines
   - Professional tone
   - Consistent branding
   - Action items clearly stated

3. **Technical Tips**
   - Use inline CSS
   - Include plain text fallback
   - Test thoroughly before deploying 