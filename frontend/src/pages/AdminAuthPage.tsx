import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { RoleContext } from '../contexts/RoleContext';
// Removed DialogContent, DialogHeader, DialogTitle. Use styled divs instead.
import { Input } from '@/components/ui/input';

const AdminAuthPage = () => {
  const [isSignup, setIsSignup] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loginSuccess, setLoginSuccess] = useState(false);
  const [dashboardTrigger, setDashboardTrigger] = useState(0);
  const navigate = useNavigate();
  const { setRole } = useContext(RoleContext);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const endpoint = isSignup ? '/api/admin/signup' : '/api/admin/login';
    try {
      let res, data;
      if (isSignup) {
        res = await fetch(`http://localhost:8000${endpoint}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password })
        });
        if (!res.ok) throw new Error(await res.text());
        // After signup, auto-login
        setIsSignup(false);
        setError('Signup successful! Please log in.');
        return;
      } else {
        // Login: use form-encoded body for OAuth2PasswordRequestForm
        const formBody = new URLSearchParams();
        formBody.append('username', username);
        formBody.append('password', password);
        res = await fetch(`http://localhost:8000${endpoint}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: formBody.toString()
        });
        if (!res.ok) throw new Error(await res.text());
        data = await res.json();
        if (data.access_token) {
          localStorage.setItem('admin_token', data.access_token);
          setRole('admin');
          setLoginSuccess(true);
        } else {
          throw new Error('No token received');
        }
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    }
  };

  if (loginSuccess) {
    // When button is pressed, increment dashboardTrigger to force App rerender
    if (dashboardTrigger > 0) {
      navigate('/admin-home');
      return null;
    }
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-darkblue-100">
        <div className="modal-glass text-white max-w-md w-full text-center p-8 rounded-lg shadow-lg">
          <h1 className="text-2xl text-green-600 font-bold mb-4">Login Successful!</h1>
          <p className="mb-6">Welcome, admin. You have successfully logged in.</p>
          <button
            className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
            onClick={() => setDashboardTrigger((v) => v + 1)}
          >
            Continue to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-darkblue-100">
      <div className="modal-glass text-white max-w-md w-full p-8 rounded-lg shadow-lg">
        <h1 className="text-2xl text-white font-bold mb-6 text-center">{isSignup ? 'Admin Signup' : 'Admin Login'}</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-slate-300 block mb-1">Username</label>
            <Input
              type="text"
              placeholder="Username"
              value={username}
              onChange={e => setUsername(e.target.value)}
              className="bg-glass border-glass-border text-white"
              required
            />
          </div>
          <div>
            <label className="text-slate-300 block mb-1">Password</label>
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="bg-glass border-glass-border text-white"
              required
            />
          </div>
          {error && <div className="text-red-500 text-sm">{error}</div>}
          <button type="submit" className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600">
            {isSignup ? 'Sign Up' : 'Log In'}
          </button>
        </form>
        <div className="mt-4 text-center">
          <button
            className="text-blue-500 hover:underline"
            onClick={() => setIsSignup(!isSignup)}
          >
            {isSignup ? 'Already have an account? Log in' : "Don't have an account? Sign up"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminAuthPage;
