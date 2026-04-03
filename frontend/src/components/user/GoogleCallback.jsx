import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

function GoogleCallback() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    useEffect(() => {
        const token = searchParams.get('token');
        if (token) {
            localStorage.setItem('token', token);
            // Optional: Trigger your "acceleration" animation here
            navigate('/'); 
        } else {
            navigate('/login?error=auth_failed');
        }
    }, [searchParams, navigate]);

    return (
        <div className="h-screen w-full bg-black flex items-center justify-center text-red-600 font-mono">
            ESTABLISHING SECURE CONNECTION...
        </div>
    );
}

export default GoogleCallback;  