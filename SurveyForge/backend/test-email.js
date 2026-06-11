const nodemailer = require('nodemailer');

const gmailUser = 'surveyforgeadmin@gmail.com';
const gmailPass = 'dwvdxrsihkoizwnb';

async function run() {
  console.log('Creating transporter...');
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: gmailUser, pass: gmailPass }
  });

  console.log('Sending email...');
  const info = await transporter.sendMail({
    from: `"Survexa Test" <${gmailUser}>`,
    to: 'surveyforgeadmin@gmail.com',
    subject: 'SMTP Diagnostic Test',
    text: 'If you receive this, SMTP is working!'
  });

  console.log('Email sent successfully:', info.messageId);
}

run().catch(err => {
  console.error('SMTP test failed:', err);
});
