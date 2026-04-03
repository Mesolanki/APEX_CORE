import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

function LoginSuccess() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    useEffect(() => {
        // Extract token from the URL query string
        const token = searchParams.get('token');

        if (token) {
            // Store token exactly like the standard Login.jsx does
            localStorage.setItem('token', token);
            console.log(">>> [System]: Identity_Synchronized");
            navigate('/');
        } else {
            console.error(">>> [System_Error]: Auth_Token_Missing");
            navigate('/login');
        }
    }, [searchParams, navigate]);

    return (
        <div className="min-h-screen bg-[#050505] flex items-center justify-center font-mono text-cyan-400 antialiased">
            <div className="text-center space-y-4">
                <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                <h2 className="text-xl tracking-[0.2em] uppercase animate-pulse">Establishing_Secure_Session...</h2>
                <p className="text-[10px] text-cyan-900 uppercase">Syncing_Virtual_Identity_v4.0.2</p>
            </div>
        </div>
    );
}

export default LoginSuccess;