import { useState, useEffect } from 'react';
import { useLocation, Navigate } from 'react-router';
import './Verify.css';

function Verify() {
    const location = useLocation();
    const [digits, setDigits] = useState(['', '', '', '', '', '']);
    const code = digits.join('');
    const [secondsLeft, setSecondsLeft] = useState(30);
    const [message, setMessage] = useState('');

    useEffect(() => {
        if (secondsLeft == 0) return;
        const timer = setTimeout(() => setSecondsLeft(secondsLeft - 1), 1000);
        return () => clearTimeout(timer);
    }, [secondsLeft]);

    if (!location.state?.email) {
        return <Navigate to="/signup" replace />
    }

    const email = location.state.email;

    async function handleSubmit() {
        if (code.length < 6) {
            setMessage('Enter all 6 digits');
            return;
        }
        try {
            const res = await fetch('/api/auth/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, code }),
            })
            const data = await res.json()
            if (res.ok) {
                setMessage('Account verified');
            } else {
                setMessage(data.message);
            }
        } catch {
            setMessage('Something went wrong. Please try again.');
        }
    }

    function handleDigitChange(i, value) {
        const newDigits = [...digits];
        newDigits[i] = value;
        setDigits(newDigits);
    }

    function handlePaste(e) {
        e.preventDefault();
        const pasted = e.clipboardData.getData('text').trim().slice(0, 6);
        const newDigits = ['', '', '', '', '', ''];
        for (let i = 0; i < pasted.length; i++) newDigits[i] = pasted[i];
        setDigits(newDigits);
    }

    async function handleResend() {
        try {
            const res = await fetch('/api/auth/resend-code', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            })
            const data = await res.json()
            if (res.ok) {
                setMessage(data.data.message);
                setSecondsLeft(30);
            } else {
                setMessage(data.message);
            }
        } catch {
            setMessage('Something went wrong. Please try again.');
        }
    }

    return (
        <div className="verify-page">
            <h1>Verify your email</h1>
            <p>We emailed a code to<br /><strong>{email}</strong></p>
            <div className="verify-card">
                <p>Enter verification code</p>
                <div className="code-boxes">
                    {digits.map((digit, i) => (
                        <input key={i} className="code-box" value={digit} maxLength={1} onChange={(e) => {
                            handleDigitChange(i, e.target.value);
                            if (e.target.value) e.target.nextElementSibling?.focus();
                        }} onKeyDown={(e) => {
                            if (e.key == 'Backspace' && !e.target.value) e.target.previousElementSibling?.focus();
                            if (e.key == 'Enter') handleSubmit();
                            if (e.key.length == 1 && !e.ctrlKey && !e.metaKey) {
                                e.preventDefault();
                                handleDigitChange(i, e.key);
                                e.target.nextElementSibling?.focus();
                            }
                        }}
                            onFocus={(e) => e.target.select()} onPaste={handlePaste} />
                    ))}
                </div>
                <button className="verify-button" onClick={handleSubmit}>Verify</button>
                <p>{message}</p>
                <p>Didn't get it? <button className="resend-link" onClick={handleResend} disabled={secondsLeft > 0}>Resend code</button> {secondsLeft > 0 && <span> (enabled in {secondsLeft}s)</span>}</p>
            </div>
        </div>
    );
}

export default Verify;