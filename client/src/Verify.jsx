import {useState} from 'react';
import {useLocation, Navigate} from 'react-router';

function Verify()
{
    const location = useLocation();
    const [code, setCode] = useState('');

    if(!location.state?.email) {
        return <Navigate to="/signup" replace/>
    }

     const email = location.state.email;

    async function handleSubmit() {
        const res = await fetch('/api/auth/verify', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({email, code}),
        })
        const data = await res.json()
        console.log(res.status, data)
    }

     return (
        <>
        <h1>Enter the code sent to {email}</h1>
        <input value = {code} onChange={(e) => setCode(e.target.value)} />
        <button onClick={handleSubmit}>Verify</button>
        </>
     );
}

export default Verify;