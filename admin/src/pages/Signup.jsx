import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { Gamepad2, Lock, Mail, User } from 'lucide-react';
import { API_BASE } from '../api';

const Signup = () => {
  const [formData, setFormData] = useState({ username: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await axios.post(`${API_BASE}/user/admin-signup`, formData);
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to register admin');
    }
    setLoading(false);
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-background">
      <div className="absolute top-1/4 right-1/4 w-[30rem] h-[30rem] bg-secondary/20 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-primary/15 rounded-full blur-3xl animate-pulse delay-1000"></div>

      <div className="glass p-8 rounded-2xl w-full max-w-md relative z-10 shadow-2xl">
        <div className="text-center mb-8">
          <Gamepad2 className="w-16 h-16 mx-auto text-secondary mb-4 drop-shadow-[0_0_15px_rgba(6,182,212,0.5)]" />
          <h1 className="text-3xl font-bold tracking-tight">Admin Registration</h1>
          <p className="text-gray-400 mt-2">Generate new access keys</p>
        </div>

        {error && <div className="p-3 mb-6 bg-red-500/20 border border-red-500/50 text-red-200 rounded-lg text-sm text-center">{error}</div>}

        <form onSubmit={handleSignup} className="space-y-5">
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input
              type="text" name="username" value={formData.username} onChange={handleChange} placeholder="Username"
              className="w-full bg-surface/50 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary transition-all" required
            />
          </div>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input
              type="email" name="email" value={formData.email} onChange={handleChange} placeholder="Admin Email"
              className="w-full bg-surface/50 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary transition-all" required
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input
              type="password" name="password" value={formData.password} onChange={handleChange} placeholder="Password"
              className="w-full bg-surface/50 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary transition-all" required minLength="6"
            />
          </div>

          <button
            type="submit" disabled={loading}
            className="w-full bg-gradient-to-r from-secondary to-blue-600 hover:from-secondary/90 hover:to-blue-600/90 text-white font-semibold py-3 rounded-xl transition-all duration-300 hover:scale-[1.02] shadow-lg shadow-secondary/25 disabled:opacity-50"
          >
            {loading ? 'Processing...' : 'Create Admin ID'}
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-gray-400">
          Already have keys? <Link to="/login" className="text-secondary hover:underline font-semibold">Login</Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
