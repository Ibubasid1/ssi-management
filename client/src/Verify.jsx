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

     return (
        <>
        <h1>Enter the code sent to {email}</h1>
        <input value = {code} onChange={(e) => setCode(e.target.value)} />
        <button>Verify</button>
        </>
     );
}

export default Verify;