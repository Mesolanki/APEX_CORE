import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Gamepad2, Lock, Mail } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to login');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-background">
      {/* Dynamic Background Elements */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-[30rem] h-[30rem] bg-secondary/15 rounded-full blur-3xl animate-pulse delay-1000"></div>

      <div className="glass p-8 rounded-2xl w-full max-w-md relative z-10 shadow-2xl overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>
        <div className="text-center mb-8">
          <Gamepad2 className="w-16 h-16 mx-auto text-primary mb-4 animate-bounce" />
          <h1 className="text-3xl font-bold tracking-tight">System Login</h1>
          <p className="text-gray-400 mt-2">Initialize administrator session</p>
        </div>

        {error && <div className="p-3 mb-6 bg-red-500/20 border border-red-500/50 text-red-200 rounded-lg text-sm text-center">{error}</div>}

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Admin Email"
              className="w-full bg-surface/50 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white placeholder:text-gray-600 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-300"
              required
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full bg-surface/50 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white placeholder:text-gray-600 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-300"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-primary to-rose-600 hover:from-primary/90 hover:to-rose-600/90 text-white font-semibold py-3 rounded-xl transition-all duration-300 hover:scale-[1.02] shadow-lg shadow-primary/25 disabled:opacity-50 disabled:hover:scale-100"
          >
            {loading ? 'Authenticating...' : 'Access Terminal'}
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-gray-400">
          No access credentials? <Link to="/signup" className="text-primary hover:underline font-semibold">Request Access</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
