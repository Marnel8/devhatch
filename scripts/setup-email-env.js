#!/usr/bin/env node

/**
 * Email Environment Setup Script
 * 
 * This script helps you set up email environment variables for production.
 * Run this script to get the correct environment variable format.
 */

const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('📧 Email Environment Setup\n');

console.log('This script will help you set up email environment variables for production.\n');

console.log('Required Environment Variables:');
console.log('SMTP_HOST=smtp.gmail.com');
console.log('SMTP_PORT=587');
console.log('SMTP_SERVICE=gmail');
console.log('SMTP_MAIL=your_email@gmail.com');
console.log('SMTP_PASSWORD=your_app_password');
console.log('EMAIL_FROM="DevHatch OJT Portal <your_email@gmail.com>"\n');

console.log('⚠️  Important Notes:');
console.log('1. You need a Gmail App Password (not your regular password)');
console.log('2. Enable 2-Step Verification on your Google Account first');
console.log('3. Generate App Password at: https://myaccount.google.com/apppasswords\n');

function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

async function main() {
  try {
    const email = await askQuestion('Enter your Gmail address: ');
    const appPassword = await askQuestion('Enter your Gmail App Password (16 characters): ');
    
    if (!email.includes('@gmail.com')) {
      console.log('\n❌ Please use a Gmail address');
      process.exit(1);
    }
    
    if (appPassword.length !== 16) {
      console.log('\n❌ App Password should be 16 characters');
      console.log('Generate one at: https://myaccount.google.com/apppasswords');
      process.exit(1);
    }
    
    console.log('\n✅ Environment Variables for Production:\n');
    console.log('Copy and paste these into your hosting platform:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`SMTP_HOST=smtp.gmail.com`);
    console.log(`SMTP_PORT=587`);
    console.log(`SMTP_SERVICE=gmail`);
    console.log(`SMTP_MAIL=${email}`);
    console.log(`SMTP_PASSWORD=${appPassword}`);
    console.log(`EMAIL_FROM="DevHatch OJT Portal <${email}>"`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    console.log('📋 Platform-Specific Commands:\n');
    
    console.log('Vercel CLI:');
    console.log(`vercel env add SMTP_HOST`);
    console.log(`vercel env add SMTP_PORT`);
    console.log(`vercel env add SMTP_SERVICE`);
    console.log(`vercel env add SMTP_MAIL`);
    console.log(`vercel env add SMTP_PASSWORD`);
    console.log(`vercel env add EMAIL_FROM\n`);
    
    console.log('Netlify CLI:');
    console.log(`netlify env:set SMTP_HOST smtp.gmail.com`);
    console.log(`netlify env:set SMTP_PORT 587`);
    console.log(`netlify env:set SMTP_SERVICE gmail`);
    console.log(`netlify env:set SMTP_MAIL ${email}`);
    console.log(`netlify env:set SMTP_PASSWORD ${appPassword}`);
    console.log(`netlify env:set EMAIL_FROM "DevHatch OJT Portal <${email}>"\n`);
    
    console.log('Railway CLI:');
    console.log(`railway variables set SMTP_HOST=smtp.gmail.com`);
    console.log(`railway variables set SMTP_PORT=587`);
    console.log(`railway variables set SMTP_SERVICE=gmail`);
    console.log(`railway variables set SMTP_MAIL=${email}`);
    console.log(`railway variables set SMTP_PASSWORD=${appPassword}`);
    console.log(`railway variables set EMAIL_FROM="DevHatch OJT Portal <${email}>"\n`);
    
    console.log('🔧 Next Steps:');
    console.log('1. Set the environment variables in your hosting platform');
    console.log('2. Deploy your application');
    console.log('3. Test with: https://your-domain.com/api/email-diagnostics');
    console.log('4. Test email with: https://your-domain.com/api/test-email\n');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    rl.close();
  }
}

main(); 