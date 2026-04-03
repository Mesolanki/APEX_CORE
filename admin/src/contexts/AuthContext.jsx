import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE } from '../api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('adminToken'));
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (token) {
            // Setup simple user info or validate token
            // For now we set dummy user, ideally we validate token via a backend call
            localStorage.setItem('adminToken', token);
            setUser({ role: 'admin' });
        } else {
            localStorage.removeItem('adminToken');
            setUser(null);
        }
        setLoading(false);
    }, [token]);

    const login = async (email, password) => {
        const { data } = await axios.post(`${API_BASE}/user/admin-login`, { email, password });
        setToken(data.token);
    };

    const logout = () => {
        setToken(null);
    };

    return (
        <AuthContext.Provider value={{ user, token, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};
