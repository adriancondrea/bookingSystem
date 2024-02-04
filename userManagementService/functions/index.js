const functions = require('firebase-functions');
// const sgMail = require('@sendgrid/mail');

// Set your SendGrid API key
// sgMail.setApiKey('YOUR_SENDGRID_API_KEY');

exports.sendWelcomeEmail = functions.auth.user().onCreate((user) => {
  const msg = {
    to: user.email, // Newly created user's email
    from: 'your-email@example.com', // Replace with your email
    subject: 'Welcome to Our App',
    text: `Welcome, ${user.displayName || 'user'}! Thank you for signing up.`,
  };

  // Send the email
    console.log('Welcome email sent to:', user.email);
    console.log('Welcome email content:', msg.text);
  // return sgMail.send(msg).then(() => {
  //   console.log('Welcome email sent to:', user.email);
  // }).catch((error) => {
  //   console.error('Error sending welcome email:', error);
  // });
});
