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

export async function sendPasswordResetEmail(toEmail, resetToken) {
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
  const resetLink = `${clientUrl}/reset-password?token=${resetToken}`;
  const transporter = await getTransporter();

  const info = await transporter.sendMail({
    from: '"SSI Management" <no-reply@ssi-management.test>',
    to: toEmail,
    subject: 'Reset your SSI Management password',
    text: `Open this link to set a new password (valid for 1 hour):\n${resetLink}`,
    html: `<p>Click the link below to set a new password. It is valid for 1 hour.</p><p><a href="${resetLink}">Reset password</a></p>`,
  });

  console.log('Password reset email preview:', nodemailer.getTestMessageUrl(info));
}
