import nodemailer from 'nodemailer';

let transporterPromise;

// Uses Ethereal: a fake inbox for testing. No real email is sent.
function getTransporter() {
  if (!transporterPromise) {
    transporterPromise = nodemailer.createTestAccount().then((account) =>
      nodemailer.createTransport({
        host: account.smtp.host,
        port: account.smtp.port,
        secure: account.smtp.secure,
        auth: { user: account.user, pass: account.pass },
      })
    ).catch((err) => {
      transporterPromise = undefined; // allow a retry on the next request
      throw err;
    });
  }
  return transporterPromise;
}

// Stops the page from waiting forever if the network is blocked.
function withTimeout(promise, ms) {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error('Email service timed out')), ms)),
  ]);
}

export async function sendPasswordResetEmail(toEmail, resetToken) {
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
  const resetLink = `${clientUrl}/reset-password?token=${resetToken}`;

  try {
    const transporter = await withTimeout(getTransporter(), 8000);
    const info = await withTimeout(
      transporter.sendMail({
        from: '"SSI Management" <no-reply@ssi-management.test>',
        to: toEmail,
        subject: 'Reset your SSI Management password',
        text: `Open this link to set a new password (valid for 1 hour):\n${resetLink}`,
        html: `<p>Click the link below to set a new password. It is valid for 1 hour.</p><p><a href="${resetLink}">Reset password</a></p>`,
      }),
      8000
    );
    console.log('Password reset email preview:', nodemailer.getTestMessageUrl(info));
  } catch (err) {
    // Testing fallback: email could not be sent, so print the link here instead.
    console.error('Could not send reset email:', err.message);
    console.log('Reset link (copy into browser):', resetLink);
  }
}
