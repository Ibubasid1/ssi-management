import {randomInt} from 'crypto';
import pool from './db.js';
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

export async function sendVerificationCode(email)
{
    const code = randomInt(100000, 1000000);
    
    await pool.query('UPDATE users SET code = $1, code_expiry_time = $2 WHERE email = $3',
         [code, new Date(Date.now() + (5 * 60 * 1000)), email]);
    await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: `${code} is your verification code`,
        text: `Your verification code is ${code}`
    });
}