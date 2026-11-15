export async function sendVerificationCode(email)
{
    const {randomNum} = require('crypto');
    const code = randomInt(100000, 1000000);
    
    await pool.query('UPDATE users SET code = $1, code_expiry_time = $2 WHERE email = $3',
         [code, new Date(Date.now() + (5 * 60 * 1000)), email]);
}